---
id: PLAN-002
tipo: plan
feature: 002-panel-admin
estado: implemented
aprobaciones:
  fase_2: { por: "Carlos", fecha: 2026-09-20 }
actualizado: 2026-09-20
---

# PLAN-002 · Panel de administración (auth + CRUD de contenido)

> Traduce SPEC-002 al patrón por capas (Constitución Art. 1–2).

## 0. Gates de simplicidad

- [x] Simplicity — auth casera con `node:crypto` (scrypt + HMAC), sin librería de
      terceros; subida de archivos con `Request.formData()` nativo de Next.js, sin
      librería de upload; **cero dependencias nuevas** (ver §7).
- [x] Anti-Abstraction — sin capa de "permisos"/RBAC (no la pidió nadie — ADR-003);
      sin tabla `Session` (revocación vía `AdminUser.active`, ya suficiente para RF-118).
- [x] Integration-First — schema de `AdminUser` y contrato RFC 9457 se fijan antes
      de las rutas que los usan.

## 1. Cumplimiento constitucional

| Artículo | Cómo lo respeta este plan |
|---|---|
| Art. 1–2 (patrón) | `app/(admin)/` + `app/api/admin/` (rutas) → `lib/services/` (casos de uso) → `lib/db/` (Prisma). Hash/firma de sesión vive en `auth.service.ts`, nunca en rutas. |
| Art. 3 (testing) | vitest. Nueva zona respecto a Feature 001: `app/api/admin/**` (integración request→response, incluye 401 sin sesión). |
| Art. 5 (seguridad, ADR-003) | N admins mismo rol; passwords con `scrypt` (sal por usuario); sesión cookie firmada httpOnly; `/admin/**` y `/api/admin/**` verifican sesión en `proxy.ts` (Next.js 16 — ver nota); sin registro público. |
| Art. 6 (contratos) | Rutas `/api/admin/**` internas — sin `openapi.yaml`, pero **sí** sobre RFC 9457 consistente (helper compartido, ver §2). |
| Art. 12 (anti-hipersistema) | 3 archivos de esta feature; 0 dependencias nuevas. |

**Nota Next.js 16:** el archivo `middleware.ts` está **deprecado y renombrado a
`proxy.ts`** en esta versión (confirmado en `node_modules/next/dist/docs/.../proxy.md`
— no asumir la convención de versiones anteriores). Además, `proxy.ts` usa el
runtime **Node.js por defecto** desde v16 (antes era Edge) — puede llamar a Prisma
y `node:crypto` sin restricciones de Edge runtime.

## 2. Arquitectura de la feature (patrón por capas)

### Modelo (`apps/web/prisma/schema.prisma`)
- `AdminUser`: `id`, `email` (único), `passwordHash`, `active`, `failedLoginAttempts`
  (int, default 0), `lockedUntil` (datetime?, RF-103), `createdAt`, `updatedAt`.
- Migración `0002_admin_users`.

### Repositorio (`apps/web/lib/db/`)
- `admin-users.repository.ts` — `findByEmail`, `findById`, `findAll`, `create`,
  `updateById` (password/active/lockout).

### Servicios — casos de uso (`apps/web/lib/services/`)
- `auth.service.ts`:
  - `hashPassword` / `verifyPassword` — `node:crypto` `scrypt` + sal aleatoria por
    usuario (formato almacenado: `salt:hash`, ambos hex).
  - `signSession(adminId)` / `verifySessionToken(token)` — HMAC-SHA256 con
    `SESSION_SECRET` (env nueva), payload `{sub, exp}` en base64url + firma.
    Formato cookie: `<payload_b64url>.<sig_b64url>`. Expira a los 7 días.
  - `login(email, password)` ← RF-101/102/103: valida `lockedUntil`, compara hash,
    incrementa/reinicia `failedLoginAttempts`, fija `lockedUntil` al 5º fallo.
  - `logout()` ← RF-104: instruye borrar la cookie (`Set-Cookie` con `Max-Age=0`).
  - `getSessionAdmin(cookieValue)` ← RF-105/118: verifica firma+expiración, **y**
    vuelve a leer `AdminUser.active` en DB (no confía solo en el token) — así una
    cuenta desactivada pierde acceso en la siguiente request, no solo en el login.
- `admin-users.service.ts` — `createAdmin` (RF-114/115, valida email único y
  password ≥8 — RF-120), `listAdmins`, `setActive` (RF-116), `changeOwnPassword`
  (RF-117, valida password actual).
- `products-admin.service.ts` — `createProduct` (RF-106), `updateProduct` (RF-107),
  `setAvailable` (RF-108).
- `site-settings-admin.service.ts` — `updateSiteSettings` (RF-112).
- `uploads.service.ts` — `saveUpload(file, subdir)` ← RF-109/111/113: valida
  `file.type` ∈ {jpeg,png,webp} y `file.size` ≤ 5MB, escribe a
  `public/uploads/<subdir>/<cuid>.<ext>`, devuelve la URL pública; `deleteUpload(url)`
  ← RF-110: borra el archivo si existe bajo `public/uploads/` (nunca fuera de ahí).

### Contrato de error compartido
- `lib/http/problem-details.ts` — helper `problemResponse(status, title, detail?)`
  que arma `Response` con `Content-Type: application/problem+json` (RFC 9457),
  usado por todas las rutas `/api/admin/**` (Art. 6).

### Fronteras de entrada
| Ruta | Para qué | RF |
|---|---|---|
| `apps/web/proxy.ts` | Protege `/admin/**` y `/api/admin/**` (excepto `/admin/login`, `/api/admin/auth/login`) | RF-105, RF-118 |
| `app/(admin)/login/page.tsx` | Formulario de login | RF-101, RF-102, RF-103 |
| `app/api/admin/auth/login/route.ts` | POST login | RF-101, RF-102, RF-103 |
| `app/api/admin/auth/logout/route.ts` | POST logout | RF-104 |
| `app/(admin)/admin/products/page.tsx` + `[id]/page.tsx` + `new/page.tsx` | UI de productos | RF-106..111 |
| `app/api/admin/products/route.ts` (POST) , `[id]/route.ts` (PATCH) | CRUD producto | RF-106, RF-107, RF-108 |
| `app/api/admin/products/[id]/image/route.ts` (POST/DELETE) | Imagen de producto | RF-109, RF-110, RF-111 |
| `app/(admin)/admin/settings/page.tsx` | UI de `SiteSettings` | RF-112, RF-113 |
| `app/api/admin/settings/route.ts` (PATCH) | Editar `SiteSettings` | RF-112 |
| `app/api/admin/settings/logo/route.ts` (POST/DELETE) | Logo de `SiteSettings` | RF-113 |
| `app/(admin)/admin/users/page.tsx` + `new/page.tsx` | UI de usuarios admin | RF-114..116 |
| `app/api/admin/users/route.ts` (POST/GET) , `[id]/route.ts` (PATCH) | CRUD usuarios admin | RF-114, RF-115, RF-116 |
| `app/(admin)/admin/account/page.tsx` | UI cambiar password propia | RF-117 |
| `app/api/admin/account/password/route.ts` (PATCH) | Cambiar password propia | RF-117, RF-120 |

### Fronteras de salida
- Filesystem local (`public/uploads/`) vía `uploads.service.ts` — volumen Docker
  persistente (RNF-101, ver `docker-compose.yml` en §6).

## 3. Modelo de datos

- `schema.prisma`: añade `AdminUser` (ver §2). Migración `0002_admin_users`,
  independiente de `0001_init` (no toca `Product`/`SiteSettings`).
- `seed.ts`: añade 2 filas `AdminUser` — `cjhirashi@gmail.com` y
  `danieljime444@gmail.com`, password temporal compartido (hasheado con
  `hashPassword`, nunca en texto plano fuera de `.env`), `active: true`.
- Nuevas variables `.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (solo las lee el seed),
  `SESSION_SECRET` (firma de cookies, obligatoria en runtime).

## 4. Contratos

- Sin `openapi.yaml` (rutas internas, Art. 6). Contrato de error uniforme: helper
  `problem-details.ts` (§2), verificado por los tests de integración de cada ruta
  (todo error 4xx/5xx responde `application/problem+json`).

## 5. Estrategia de pruebas (por zona del patrón)

| Zona | Qué se prueba | Herramienta |
|---|---|---|
| `lib/services/auth.service.ts` | hash/verify roundtrip; `signSession`/`verifySessionToken` (válido, expirado, firma alterada); `login` (éxito, password incorrecto, cuenta inactiva, bloqueo al 5º intento — RF-103) | vitest (unit) |
| `lib/services/uploads.service.ts` | rechaza mime type inválido y tamaño >5MB (RF-111); guarda y borra correctamente | vitest (unit, `fs` real sobre dir temporal) |
| `lib/services/admin-users.service.ts`, `products-admin.service.ts`, `site-settings-admin.service.ts` | reglas de negocio (email duplicado RF-115, password <8 RF-120) | vitest (unit) |
| `lib/db/admin-users.repository.ts` | consultas contra Postgres de test | vitest + Postgres de test (`danme_test`) |
| `app/api/admin/**` | request→response: 401 sin sesión (RF-105), 401 tras desactivar cuenta con sesión activa (RF-118), 4xx con cuerpo RFC 9457, 2xx con el efecto esperado en DB | vitest (integración, contra `danme_test`) |
| `components/admin/*` (formularios) | render, validación básica de campos requeridos, estados de error | vitest + Testing Library |

## 6. Secuenciación de archivos

Tests antes que código, por capa:
1. `schema.prisma` (+ `AdminUser`) → migración `0002_admin_users`.
2. `lib/http/problem-details.ts` (sin test dedicado — función pura trivial, se
   verifica indirectamente en los tests de integración de rutas).
3. Tests de `auth.service.ts` (deben fallar) → implementación (hash, firma, login, lockout).
4. Tests de `admin-users.repository.ts` (deben fallar) → implementación.
5. Tests de `admin-users.service.ts`, `products-admin.service.ts`,
   `site-settings-admin.service.ts`, `uploads.service.ts` (deben fallar) → implementación.
6. Tests de integración de `app/api/admin/**` (deben fallar) → implementación de
   cada ruta (usa los servicios de los pasos 3–5).
7. `proxy.ts` (protección de rutas) — verificado por los mismos tests de
   integración (request sin cookie → 401/redirect).
8. `docker-compose.yml`: añade volumen `danme-uploads` montado en
   `apps/web/public/uploads` del servicio `web`, y las 3 env vars nuevas.
9. `prisma/seed.ts`: añade las 2 cuentas admin.
10. UI (`app/(admin)/**`, `components/admin/**`) — formularios y listados,
    consumen las rutas ya probadas.

## 7. Seguimiento de complejidad

| Excepción a la simplicidad | Justificación |
|---|---|
| *(ninguna — al contrario)* | **Cero dependencias nuevas**: hashing (`node:crypto` `scrypt`) y firma de sesión (`node:crypto` `createHmac`) con la librería estándar de Node en vez de `bcrypt`/`argon2`/`jose`; subida de archivos con `Request.formData()` nativo de Next.js en vez de `multer`/`formidable`. Reduce superficie de Docker build (ya hubo fricción con dependencias nativas en Prisma — ver `memory/state.md`). |

## 8. Impacto en documentación (Art. 11 — obligatorio)

| Documento | Ruta | Qué cambia | Tarea |
|---|---|---|---|
| Modelo de contenido | `docs/CONTENT-MODEL.md` | Añade `AdminUser` y qué campos gestiona esta feature | `[doc]` T-content-model |
| Arquitectura | `docs/ARCHITECTURE.md` | Añade capa admin (`proxy.ts`, `lib/http/problem-details.ts`, servicios nuevos) | `[doc]` T-arch |
| Deploy / infra | `docs/DEPLOYMENT.md` | Volumen `danme-uploads`, env vars `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`SESSION_SECRET` | `[doc]` T-deploy |
| README del servicio | `apps/web/README.md` | Setup de la primera cuenta admin, nuevas env vars | `[doc]` T-readme |
