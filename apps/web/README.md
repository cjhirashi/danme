# apps/web — danme

Landing pública + (futuro) panel admin de DanMe. Next.js (App Router) + TypeScript +
Prisma/Postgres. Arquitectura: `docs/ARCHITECTURE.md`. Modelo de contenido:
`docs/CONTENT-MODEL.md`.

## Setup local

```bash
npm install
cp .env.example .env          # ajustar si tu Postgres local no usa el default
```

Levantar Postgres de dev (desde la raíz del repo, no `apps/web/`):

```bash
docker compose up -d postgres
```

Aplicar migraciones y sembrar datos:

```bash
npx prisma migrate deploy   # o `migrate dev` si vas a crear una migración nueva
npm run db:seed
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (`http://localhost:3000`) |
| `npm run build` | Build de producción (salida `standalone`) |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests unitarios y de componentes (vitest, sin tocar Postgres) |
| `npm run test:db` | Tests de repositorio contra Postgres real — requiere la base `danme_test` (ver `.env.test`) |
| `npm run db:seed` | Corre `prisma/seed.ts` |

## Variables de entorno

Ver `.env.example`. La única requerida es `DATABASE_URL` (cadena de conexión
Postgres). En producción la inyecta `docker-compose.yml` (raíz del repo).

## Tests de base de datos (`npm run test:db`)

Requieren una base separada `danme_test` en el mismo Postgres de dev, para no pisar
los datos sembrados de desarrollo:

```bash
docker exec danme-postgres psql -U danme -d danme -c "CREATE DATABASE danme_test;"
DATABASE_URL="postgresql://danme:danme@localhost:5432/danme_test?schema=public" npx prisma migrate deploy
```

## Notas de Prisma 7

Desde Prisma 7 la URL de conexión no va en `schema.prisma`; se configura en
`prisma.config.ts` (CLI) y en `lib/db/prisma.ts` (runtime, vía driver adapter
`@prisma/adapter-pg`). Ver `docs/ARCHITECTURE.md`.
