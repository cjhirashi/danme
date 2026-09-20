# Deploy / infra — danme

> Se actualiza cuando cambia el Dockerfile, `docker-compose.yml`, variables de
> entorno o puertos (ver `.harness/constitution.md` Art. 11).

## Contenedores

`docker-compose.yml` (raíz del repo) define:

| Servicio | Contenedor | Puerto | Red(es) |
|---|---|---|---|
| `web` (Next.js) | `danme-web` | 3000 (interno) | `net-danme` (externa, proxy) + `net-danme-db` (interna) |
| `postgres` | `danme-postgres` | 5432 (publicado a host, solo dev) | `net-danme-db` |

`apps/web/Dockerfile`: build multi-stage (`deps` → `builder` → `runner`), salida
`standalone` de Next.js. La imagen `runner` corre como usuario no-root (`nextjs`) e
incluye OpenSSL (requerido por el motor de Prisma).

## Variables de entorno (producción)

| Variable | Dónde se define | Notas |
|---|---|---|
| `DATABASE_URL` | `docker-compose.yml` (servicio `web`) | Apunta al servicio `postgres` por nombre de contenedor |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `docker-compose.yml` (servicio `postgres`) | Ajustar antes de exponer a producción real (valores actuales son de desarrollo) |

## Coordinación con Caddy (`cjhirashi-srv`)

El acceso externo (dominio, TLS) **no lo gestiona este proyecto** — lo hace un
sistema externo (`cjhirashi-srv`, proxy Caddy + Cloudflare Tunnel) mediante el
archivo `caddy.json` en la raíz del repo:

- `caddy.json` es un **contrato**: la sección `cjhirashi_srv` la escribe/gestiona
  ese sistema (no editar); la sección `servicios` la completa este proyecto.
- Contrato actual: contenedor `danme-web`, puerto `3000`, host
  `danme.cjhirashi.com`, red `net-danme`.
- `docker-compose.yml` declara `net-danme` como red **externa** (`external: true`)
  — la crea `cjhirashi-srv`, este proyecto solo se conecta. Mientras esa red no
  exista, `docker compose up web` no podrá levantar el servicio (sí puede
  levantarse `postgres` solo, para desarrollo local).
- Coordinación de cambios: mensajes en `caddy.json` → `mensajes[]` (gestionados con
  la herramienta `bin/caddy-msg` del lado de `cjhirashi-srv`).

## Desarrollo local

```bash
docker compose up -d postgres   # no requiere net-danme
cd apps/web && npm run dev
```

Para probar la imagen de producción localmente sin `net-danme`:

```bash
docker compose build web
docker run --rm --network danme_net-danme-db \
  -e DATABASE_URL="postgresql://danme:danme@danme-postgres:5432/danme?schema=public" \
  -p 3001:3000 danme-web:latest
```
