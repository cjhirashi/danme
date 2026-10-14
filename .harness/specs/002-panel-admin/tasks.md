---
id: TASKS-002
tipo: tasks
feature: 002-panel-admin
estado: in-review
actualizado: 2026-10-14
---

# TASKS-002 · Panel de administración (auth + CRUD de contenido)

## Reglas
- Cada tarea: ≤ 30 min, un solo propósito, `(cubre RF-NNN)`, zona del patrón (o `[doc]`).
- Orden por dependencias. **Test antes que código.**
- Cada fila de `plan.md §8` (Impacto en documentación) → una tarea `[doc]`.

## Tareas

### Modelo de datos
- [x] T-001 — Añadir `AdminUser` a `schema.prisma` (cubre RF-101, RF-103, RF-114, RF-116) [zona: modelo]
- [x] T-002 — Generar migración `0002_admin_users` [zona: modelo]

### Servicio de auth — hashing y firma (`lib/services/auth.service.ts`)
- [x] T-003 — Test unit: `hashPassword`/`verifyPassword` roundtrip (sal distinta cada vez, verify correcto e incorrecto) (cubre RF-101) [zona: test]
- [x] T-004 — Implementar `hashPassword`/`verifyPassword` con `node:crypto` scrypt (cubre RF-101) [zona: servicio]
- [x] T-005 — Test unit: `signSession`/`verifySessionToken` (token válido, expirado, firma alterada → null) (cubre RF-101, RF-105) [zona: test]
- [x] T-006 — Implementar `signSession`/`verifySessionToken` con HMAC-SHA256 (cubre RF-101, RF-105) [zona: servicio]

### Servicio de auth — login/logout/lockout
- [x] T-007 — Test unit: `login` éxito con credenciales válidas y cuenta activa (cubre RF-101) [zona: test]
- [x] T-008 — Test unit: `login` rechaza password incorrecto y cuenta inactiva con el mismo mensaje genérico (cubre RF-102) [zona: test]
- [x] T-009 — Test unit: `login` bloquea tras 5 intentos fallidos seguidos y respeta `lockedUntil` (cubre RF-103) [zona: test]
- [x] T-010 — Implementar `login` (valida lockout, compara hash, actualiza `failedLoginAttempts`/`lockedUntil`) (cubre RF-101, RF-102, RF-103) [zona: servicio]
- [x] T-011 — Implementar `logout` (instrucción de borrado de cookie) (cubre RF-104) [zona: servicio]
- [x] T-012 — Test unit: `getSessionAdmin` devuelve `null` si `active=false` aunque el token sea válido (cubre RF-118) [zona: test]
- [x] T-013 — Implementar `getSessionAdmin` (verifica token + relee `active` en DB) (cubre RF-105, RF-118) [zona: servicio]

### Repositorio (`lib/db/admin-users.repository.ts`)
- [x] T-014 — Test: `findByEmail`, `create`, `updateById` contra Postgres de test (cubre RF-101, RF-114, RF-116) [zona: test]
- [x] T-015 — Implementar `admin-users.repository.ts` (cubre RF-101, RF-114, RF-116) [zona: repositorio]

### Servicios de negocio restantes
- [x] T-016 — Test unit: `admin-users.service.createAdmin` rechaza email duplicado (RF-115) y password <8 (RF-120) [zona: test]
- [x] T-017 — Implementar `admin-users.service.ts` (`createAdmin`, `listAdmins`, `setActive`, `changeOwnPassword`) (cubre RF-114, RF-115, RF-116, RF-117, RF-120) [zona: servicio]
- [x] T-018 — Test unit: `uploads.service` rechaza mime type inválido y tamaño >5MB (cubre RF-111) [zona: test]
- [x] T-019 — Implementar `uploads.service.ts` (`saveUpload`, `deleteUpload`) (cubre RF-109, RF-110, RF-111, RF-113) [zona: servicio]
- [x] T-020 — Implementar `products-admin.service.ts` (`createProduct`, `updateProduct`, `setAvailable`) (cubre RF-106, RF-107, RF-108) [zona: servicio]
- [x] T-021 — Implementar `site-settings-admin.service.ts` (`updateSiteSettings`) (cubre RF-112) [zona: servicio]
- [x] T-022 — Implementar `lib/http/problem-details.ts` (helper RFC 9457) [zona: servicio]

### Rutas API — auth
- [x] T-023 — Test integración: `POST /api/admin/auth/login` (éxito con cookie, 401 credenciales inválidas, 429/401 bloqueo) (cubre RF-101, RF-102, RF-103) [zona: test]
- [x] T-024 — Implementar `app/api/admin/auth/login/route.ts` (cubre RF-101, RF-102, RF-103) [zona: ruta]
- [x] T-025 — Test integración: `POST /api/admin/auth/logout` borra la cookie (cubre RF-104) [zona: test]
- [x] T-026 — Implementar `app/api/admin/auth/logout/route.ts` (cubre RF-104) [zona: ruta]

### `proxy.ts` — protección de rutas
- [x] T-027 — Test integración: request a `/api/admin/products` sin cookie → 401 RFC 9457 (cubre RF-105) [zona: test]
- [x] T-028 — Test integración: request con cookie de cuenta recién desactivada → 401 (cubre RF-118) [zona: test]
- [x] T-029 — Implementar `apps/web/proxy.ts` (cubre RF-105, RF-118) [zona: ruta]

### Rutas API — productos
- [x] T-030 — Test integración: `POST /api/admin/products` crea producto (cubre RF-106) [zona: test]
- [x] T-031 — Implementar `app/api/admin/products/route.ts` (POST) (cubre RF-106) [zona: ruta]
- [x] T-032 — Test integración: `PATCH /api/admin/products/[id]` edita campos y alterna `available` (cubre RF-107, RF-108) [zona: test]
- [x] T-033 — Implementar `app/api/admin/products/[id]/route.ts` (PATCH) (cubre RF-107, RF-108) [zona: ruta]
- [x] T-034 — Test integración: `POST /api/admin/products/[id]/image` sube imagen válida y rechaza inválida; `DELETE` limpia `imageUrl` (cubre RF-109, RF-110, RF-111) [zona: test]
- [x] T-035 — Implementar `app/api/admin/products/[id]/image/route.ts` (POST/DELETE) (cubre RF-109, RF-110, RF-111) [zona: ruta]

### Rutas API — SiteSettings
- [x] T-036 — Test integración: `PATCH /api/admin/settings` edita marca/tagline/WhatsApp/redes (cubre RF-112) [zona: test]
- [x] T-037 — Implementar `app/api/admin/settings/route.ts` (PATCH) (cubre RF-112) [zona: ruta]
- [x] T-038 — Test integración: `POST/DELETE /api/admin/settings/logo` (cubre RF-113) [zona: test]
- [x] T-039 — Implementar `app/api/admin/settings/logo/route.ts` (POST/DELETE) (cubre RF-113) [zona: ruta]

### Rutas API — usuarios admin
- [x] T-040 — Test integración: `POST /api/admin/users` crea cuenta, 409 si email duplicado (cubre RF-114, RF-115) [zona: test]
- [x] T-041 — Implementar `app/api/admin/users/route.ts` (POST/GET) (cubre RF-114, RF-115) [zona: ruta]
- [x] T-042 — Test integración: `PATCH /api/admin/users/[id]` activa/desactiva (cubre RF-116) [zona: test]
- [x] T-043 — Implementar `app/api/admin/users/[id]/route.ts` (PATCH) (cubre RF-116) [zona: ruta]
- [x] T-044 — Test integración: `PATCH /api/admin/account/password` valida password actual y longitud mínima (cubre RF-117, RF-120) [zona: test]
- [x] T-045 — Implementar `app/api/admin/account/password/route.ts` (PATCH) (cubre RF-117, RF-120) [zona: ruta]

### UI — login y layout admin
- [x] T-046 — Implementar `app/(admin)/login/page.tsx` (formulario email+password) (cubre RF-101, RF-102) [zona: componente]
- [x] T-047 — Implementar layout admin (nav a Productos/Settings/Usuarios/Cuenta + botón logout) [zona: componente]

### UI — productos
- [x] T-048 — Test: formulario de producto valida campos requeridos antes de enviar (cubre RF-106) [zona: test]
- [x] T-049 — Implementar `app/(admin)/admin/products/page.tsx` (listado + toggle disponible) (cubre RF-106, RF-107, RF-108) [zona: componente]
- [x] T-050 — Implementar `app/(admin)/admin/products/new/page.tsx` y `[id]/page.tsx` (crear/editar + subir/quitar imagen) (cubre RF-106, RF-107, RF-109, RF-110) [zona: componente]

### UI — settings, usuarios, cuenta
- [x] T-051 — Implementar `app/(admin)/admin/settings/page.tsx` (edición + logo) (cubre RF-112, RF-113) [zona: componente]
- [x] T-052 — Implementar `app/(admin)/admin/users/page.tsx` + `new/page.tsx` (listado, alta, activar/desactivar) (cubre RF-114, RF-115, RF-116) [zona: componente]
- [x] T-053 — Implementar `app/(admin)/admin/account/page.tsx` (cambiar password propia) (cubre RF-117, RF-120) [zona: componente]

### Infra y datos
- [x] T-054 — Actualizar `docker-compose.yml`: volumen `danme-uploads` en `web`, env vars `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`SESSION_SECRET` [zona: infra]
- [x] T-055 — Actualizar `.env.example`/`.env.test` con las 3 variables nuevas [zona: infra]
- [x] T-056 — Actualizar `prisma/seed.ts`: crear las 2 cuentas admin (`cjhirashi@gmail.com`, `danieljime444@gmail.com`) con password temporal hasheado (cubre RF-101) [zona: modelo]

### Verificación
- [x] T-057 — Verificación manual: login con ambas cuentas, crear/editar/desactivar producto con imagen, editar settings, crear tercera cuenta admin, cambiar password propia, logout — evidencia pegada (cubre RF-101..RF-120) [zona: verificación]

### Documentación
- [x] T-058 — Actualizar `docs/CONTENT-MODEL.md` (añade `AdminUser`) [doc]
- [x] T-059 — Actualizar `docs/ARCHITECTURE.md` (capa admin, `proxy.ts`, RFC 9457) [doc]
- [x] T-060 — Actualizar `docs/DEPLOYMENT.md` (volumen uploads, env vars nuevas) [doc]
- [x] T-061 — Actualizar `apps/web/README.md` (setup primera cuenta admin) [doc]

### Enmienda 2026-10-14 — retroalimentación de escritura y uploads (plan §9)
- [x] T-062 — Test unit: `mutate` (2xx, 4xx con `detail`, 4xx sin JSON, error de red) (cubre RF-121, RF-122) [zona: test]
- [x] T-063 — Implementar `lib/admin/mutate.ts` (cubre RF-121, RF-122) [zona: frontera cliente]
- [x] T-064 — Test unit: `setFlash`/`consumeFlash` + storage que lanza (cubre RF-123) [zona: test]
- [x] T-065 — Implementar `lib/admin/flash.ts` (cubre RF-123) [zona: frontera cliente]
- [x] T-066 — Test componente: `Notice` (roles por variante, cerrar) y `FlashNotice` (consume al montar y por evento) (cubre RF-121, RF-123) [zona: test]
- [x] T-067 — Implementar `Notice.tsx` y `FlashNotice.tsx` (cubre RF-121, RF-123) [zona: UI]
- [x] T-068 — Test unit: `readUpload` (válido, traversal, extensión no permitida, inexistente) y route handler `/uploads/[...path]` (200 + headers, 404 RFC 9457) (cubre RF-124) [zona: test]
- [x] T-069 — Implementar `readUpload` en `uploads.service.ts` y `app/uploads/[...path]/route.ts` (cubre RF-124) [zona: servicio + frontera entrada]
- [x] T-070 — Test componente: `ProductForm` — creado/actualizado → flash de éxito; imagen falla → flash warning con motivo; registro falla → error en formulario; quitar imagen → aviso (cubre RF-121, RF-122, RF-123) [zona: test]
- [x] T-071 — Refactor `ProductForm` a `mutate` + flash/avisos; montar `FlashNotice` en lista de productos (cubre RF-121, RF-122, RF-123) [zona: UI]
- [x] T-072 — Test componente: `SettingsForm` (guardar ok/falla, logo falla → parcial, quitar logo), toggles de producto/usuario y `users/new` (éxito y error) (cubre RF-121, RF-122) [zona: test]
- [x] T-073 — Refactor `SettingsForm`, `ProductAvailabilityToggle`, `UserActiveToggle`, `users/new` a `mutate` + avisos; montar `FlashNotice` en lista de usuarios (cubre RF-121, RF-122) [zona: UI]
- [x] T-074 — `Dockerfile`: `public/uploads/{products,settings}` con dueño `nextjs:nodejs`; build local + upload real end-to-end sin reiniciar (cubre RNF-101, RF-124) [zona: infra]
- [x] T-075 — [doc] `docs/ARCHITECTURE.md`: `/uploads/*` vía route handler, `lib/admin/`, regla de avisos (cubre doc: arch-enmienda)
- [x] T-076 — [doc] `docs/DEPLOYMENT.md`: dueño del volumen y `chown` único (cubre doc: deploy-enmienda)
- [x] T-077 — Tests (rojo): `AccountPage` con error de red → alerta "No se pudo conectar…" y botón liberado; `ProductForm` con 2xx sin cuerpo + imagen (alta → aviso; edición → sube al id conocido); `readUpload` con symlink, `%2e%2e` y byte nulo; `deleteUpload` en carpeta hermana `uploads-evil` (cubre RF-121, RF-122, RF-124) [zona: ui+servicio] — hallazgos del revisor
- [x] T-078 — `account/page.tsx` vía `mutate`; `ProductForm` sin `saved.data.id` crudo; `readUpload` con `realpath`; `deleteUpload` con `path.sep` (cubre RF-121, RF-122, RF-124) [zona: ui+servicio]

## Cobertura (el gate exige 100 %; `Estado` lo rellena el gate)
| RF / doc | Tareas | Test(s) | Estado |
|---|---|---|---|
| RF-101 | T-001, T-004, T-006, T-010, T-015, T-024, T-046, T-056 | T-003, T-005, T-007, T-014, T-023 | Pass |
| RF-102 | T-010, T-024, T-046 | T-008, T-023 | Pass |
| RF-103 | T-001, T-010, T-024 | T-009, T-023 | Pass |
| RF-104 | T-011, T-026 | T-025 | Pass |
| RF-105 | T-006, T-013, T-029 | T-005, T-027 | Pass |
| RF-106 | T-020, T-031, T-049, T-050 | T-030, T-048 | Pass |
| RF-107 | T-020, T-033, T-049, T-050 | T-032 | Pass |
| RF-108 | T-020, T-033, T-049 | T-032 | Pass |
| RF-109 | T-019, T-035, T-050 | T-034 | Pass |
| RF-110 | T-019, T-035, T-050 | T-034 | Pass |
| RF-111 | T-019, T-035 | T-018, T-034 | Pass |
| RF-112 | T-021, T-037, T-051 | T-036 | Pass |
| RF-113 | T-019, T-039, T-051 | T-038 | Pass |
| RF-114 | T-001, T-015, T-017, T-041, T-052 | T-014, T-016, T-040 | Pass |
| RF-115 | T-017, T-041, T-052 | T-016, T-040 | Pass |
| RF-116 | T-001, T-015, T-017, T-043, T-052 | T-014, T-042 | Pass |
| RF-117 | T-017, T-045, T-053 | T-044 | Pass |
| RF-118 | T-013, T-029 | T-012, T-028 | Pass |
| RF-119 | T-035, T-039 | T-034, T-038 (casos 404) | Pass |
| RF-120 | T-017, T-045, T-053 | T-016, T-044 | Pass |
| RNF-101 | T-054, T-074 | verificación manual (T-057, T-074) | Pendiente |
| RF-121 | T-063, T-067, T-071, T-073, T-078 | T-062, T-066, T-070, T-072, T-077 | Pendiente |
| RF-122 | T-063, T-071, T-073, T-078 | T-062, T-070, T-072, T-077 | Pendiente |
| RF-123 | T-065, T-067, T-071 | T-064, T-066, T-070 | Pendiente |
| RF-124 | T-069, T-074, T-078 | T-068, T-077, verificación manual (T-074) | Pendiente |
| RNF-102 | T-022, T-024, T-041, T-045 | revisión de código (sin campo password en respuestas) | Pass |
| doc: content-model | T-058 | — | Pass |
| doc: arch | T-059 | — | Pass |
| doc: deploy | T-060 | — | Pass |
| doc: readme | T-061 | — | Pass |
| doc: arch-enmienda | T-075 | — | Pendiente |
| doc: deploy-enmienda | T-076 | — | Pendiente |

> Esta tabla **es** la trazabilidad de la feature (no hay `traceability-matrix.md`).
> Fila sin test, en `Fail` o `Pendiente` → el gate no abre.
