# Arquitectura — danme

> Se actualiza cuando cambia la estructura de `apps/web/`, sus capas o decisiones de
> diseño (ver `.harness/constitution.md` Art. 11).

## Visión general

Monolito Next.js (App Router + TypeScript) en `apps/web/`, patrón **por capas**,
persistencia en Postgres vía Prisma. Un solo servicio, deploy Docker self-host.
Perfil de arquitectura completo: `.harness/constitution.md` Art. 2 (ADR-001).

## Capas

```
app/                    → rutas Next.js (Server Components)
  (public)/page.tsx        landing pública — orquesta las secciones
components/landing/     → UI de presentación (sin lógica de negocio)
lib/services/           → casos de uso (lógica de negocio)
  content.service.ts       catálogo, config del sitio, formateo, link de WhatsApp
lib/db/                 → acceso a datos (Prisma)
  prisma.ts                 cliente singleton (driver adapter @prisma/adapter-pg)
  products.repository.ts
  site-settings.repository.ts
prisma/                 → schema, migraciones, seed
```

Regla del patrón: la lógica de negocio vive **solo** en `lib/services/`; las rutas y
componentes no acceden a Prisma directamente, siempre pasan por el servicio.

## Renderizado

La landing (`app/(public)/page.tsx`) se marca `export const dynamic = "force-dynamic"`:
se renderiza en cada request (SSR), no se "hornea" en build time. Esto es necesario
porque el contenido vive en Postgres y lo editará el panel admin (Feature 002) sin
requerir un rebuild de la imagen.

## Prisma 7 — driver adapters

Desde Prisma 7, la URL de conexión ya no va en `schema.prisma` (`datasource.url`).
Se configura en dos lugares:
- `prisma.config.ts` — usado por el CLI (`migrate`, `db seed`, `generate`).
- `lib/db/prisma.ts` — el cliente en runtime usa `@prisma/adapter-pg` con
  `DATABASE_URL` del entorno.

## Despliegue

Contenedor único `danme-web` (Dockerfile multi-stage, salida `standalone` de
Next.js) + Postgres. El acceso externo (dominio, TLS) lo gestiona un reverse proxy
Caddy administrado por un sistema externo (`cjhirashi-srv`) — ver `docs/DEPLOYMENT.md`.

## Features y su estado

| Feature | Qué añade | Estado |
|---|---|---|
| `001-landing-base` | Landing pública responsive, modelo `Product`/`SiteSettings`, seed | ver `.harness/specs/001-landing-base/` |
| `002-panel-admin` *(futura)* | Auth de admin único + CRUD de contenido sobre el mismo modelo | no iniciada |
