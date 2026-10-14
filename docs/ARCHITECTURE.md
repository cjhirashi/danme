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
  admin/login/              login (fuera del layout protegido)
  admin/(protected)/        productos, settings, usuarios, cuenta — comparten layout con nav
  api/admin/**               rutas API internas (auth, productos, settings, usuarios, cuenta)
  uploads/[...path]/         sirve imágenes subidas en runtime (pública — ver abajo)
proxy.ts                → protege /admin/** y /api/admin/** (SPEC-002)
components/landing/     → UI pública (sin lógica de negocio)
components/admin/       → UI del panel (formularios, toggles — sin lógica de negocio)
lib/services/           → casos de uso (lógica de negocio)
  content.service.ts       catálogo público, config del sitio, formateo, link de WhatsApp
  auth.service.ts          hash/verify password, firma/verificación de sesión, login/logout
  admin-users.service.ts   crear/listar/activar cuentas admin, cambio de password propia
  products-admin.service.ts, site-settings-admin.service.ts   CRUD de contenido (panel)
  uploads.service.ts       guardar/borrar archivos subidos (imágenes)
lib/db/                 → acceso a datos (Prisma)
  prisma.ts                 cliente singleton (driver adapter @prisma/adapter-pg)
  products.repository.ts, site-settings.repository.ts, admin-users.repository.ts
lib/admin/               → utilidades de cliente del panel
  mutate.ts                 todo fetch de escritura del panel: nunca ignora la respuesta, devuelve motivo de error
  flash.ts                  aviso que sobrevive a navegar (sessionStorage), p. ej. guardar producto → lista
lib/http/                → utilidades transversales de rutas
  problem-details.ts        RFC 9457 (Art. 6)
  session-cookie.ts         nombre/formato de la cookie de sesión
prisma/                 → schema, migraciones, seed
```

Regla del patrón: la lógica de negocio vive **solo** en `lib/services/`; las rutas y
componentes no acceden a Prisma directamente, siempre pasan por el servicio.

## Imágenes subidas (SPEC-002 RF-109..RF-113, RF-124, RNF-101)

Se guardan en `public/uploads/{products,settings}/<uuid>.<ext>` (volumen Docker
`danme-uploads`). El server de producción de Next.js indexa `public/` **una sola vez
al arrancar**: lo que existía al arrancar se sirve como estático; lo subido después
lo sirve `app/uploads/[...path]/route.ts` leyendo el volumen
(`uploads.service.ts` → `readUpload`, solo jpg/png/webp, nunca fuera de
`UPLOADS_ROOT`). Las URLs `/uploads/...` guardadas en BD son las mismas en ambos casos.

## Retroalimentación de escritura en el panel (SPEC-002 RF-121..RF-123)

Regla: **toda operación de escritura termina en un aviso visible** (`Notice`) de
éxito, error con motivo, o éxito parcial (p. ej. "Producto guardado, pero la imagen
no se pudo subir: ‹motivo›"). Los `fetch` de escritura pasan por `lib/admin/mutate.ts`;
cuando la acción navega (guardar producto, crear cuenta) o refresca una lista
(toggles), el aviso viaja con `lib/admin/flash.ts` y lo pinta `FlashNotice` en la
lista hasta que el usuario lo cierra.

## Auth del panel admin (SPEC-002, ADR-003)

N cuentas admin, mismo rol (sin RBAC). Sesión: cookie firmada httpOnly
**stateless** — sin tabla `Session` en DB. El token es
`<payload_base64url>.<firma_base64url>`, firmado con HMAC-SHA256
(`SESSION_SECRET`); el payload lleva `{sub, exp}`. La revocación (p. ej. al
desactivar una cuenta) no depende de invalidar el token: `getSessionAdmin()`
siempre relee `AdminUser.active` en Postgres en cada request.

Hashing de passwords: `node:crypto` `scrypt` (sal aleatoria por usuario,
formato `salt:hash`), sin librerías de terceros (`bcrypt`/`argon2`) — ver
`lib/services/auth.service.ts`.

## `proxy.ts` (no `middleware.ts`)

Next.js 16 renombró `middleware.ts` a `proxy.ts` (el primero está deprecado).
`proxy.ts` corre en runtime **Node.js por defecto** en esta versión (antes Edge),
así que puede usar Prisma y `node:crypto` sin restricciones. Protege `/admin/**` y
`/api/admin/**`: redirige a `/admin/login` (páginas) o responde 401 RFC 9457
(`/api/admin/**`) si no hay sesión válida.

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
| `002-panel-admin` | Auth de N admins (mismo rol, ADR-003) + CRUD de contenido + subida de imágenes | ver `.harness/specs/002-panel-admin/` |
