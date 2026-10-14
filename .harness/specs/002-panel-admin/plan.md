---
id: PLAN-002
tipo: plan
feature: 002-panel-admin
estado: in-review
aprobaciones:
  fase_2: { por: "Carlos", fecha: 2026-09-20 }
  enmienda_2026-10-14_fase_2: { por: "Carlos", fecha: 2026-10-14 }
  enmienda_2026-10-14b_fase_2: { por: "Carlos", fecha: 2026-10-14 }
actualizado: 2026-10-14
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

---

## 9. Enmienda 2026-10-14 — retroalimentación de escritura y uploads en producción

> Cubre RF-121..RF-124 y la precisión de RNF-101 (ver `spec.md`, enmienda 2026-10-14).
> Diagnóstico en producción: `EACCES` en `mkdir/open` bajo `/app/public/uploads`
> (volumen con dueño `root`, proceso `nextjs` uid 1001), y el formulario ignoraba la
> respuesta. Además, el servidor de producción de Next.js indexa `public/` **una sola
> vez al arrancar** (`router-utils/filesystem.js`): un archivo subido después da 404
> hasta reiniciar.

### Implementación de RNF-101 (precisión: permiso de escritura)
- `apps/web/Dockerfile` (`runner`): crear `public/uploads/{products,settings}` con
  dueño `nextjs:nodejs`. Un volumen nombrado **vacío** hereda ese dueño al primer
  montaje; el volumen **ya existente** en producción necesita un `chown -R 1001:1001`
  único (paso operativo, con aprobación explícita del usuario — documentado en
  `docs/DEPLOYMENT.md`).

### Implementación de RF-124 (imagen visible de inmediato)
- Nuevo route handler `apps/web/app/uploads/[...path]/route.ts` (`GET`, público — la
  landing también lo consume; `proxy.ts` no lo intercepta). Lee de `UPLOADS_ROOT`
  vía una función nueva `readUpload(segments)` en `uploads.service.ts`:
  - solo extensiones `jpg|png|webp` (Content-Type según extensión);
  - ruta resuelta debe quedar dentro de `UPLOADS_ROOT` (anti path traversal) →
    si no, o si no existe: 404 RFC 9457;
  - `Cache-Control: public, max-age=31536000, immutable` (nombres UUID, nunca se
    reescriben).
- Los archivos presentes al arrancar siguen sirviéndose como estáticos (Next revisa
  `public/` antes que las rutas de app); los subidos después caen en el handler.
  Las URLs `/uploads/...` guardadas en BD no cambian.

### Implementación de RF-121 / RF-122 (mensaje siempre, con motivo)
- `apps/web/lib/admin/mutate.ts` (cliente): `mutate(url, init)` →
  `{ ok: true, data } | { ok: false, error }`. Atrapa errores de red ("No se pudo
  conectar con el servidor") y en no-2xx extrae `detail` RFC 9457 (fallback:
  `"Error <status>"`). Todo `fetch` de escritura del panel pasa por aquí.
- `apps/web/components/admin/Notice.tsx`: aviso con variante `success`
  (`role="status"`, verde DanMe) / `error` (`role="alert"`, rojo) / `warning`
  (resultado parcial), con botón "Cerrar".
- Puntos que hoy ignoran la respuesta y se corrigen: `ProductForm` (subir y quitar
  imagen), `SettingsForm` (guardar, subir logo, quitar logo),
  `ProductAvailabilityToggle`, `UserActiveToggle`; `users/new` gana mensaje de éxito.
  `account/page.tsx` también pasa a `mutate` (revisión: con la red caída el `fetch`
  crudo lanzaba y el botón quedaba en "Guardando…" sin aviso). `LogoutButton` se deja
  igual: no escribe contenido y su resultado visible es la redirección al login.
- `ProductForm`: un 2xx sin cuerpo JSON no debe lanzar — en edición usa el id ya
  conocido; en alta, la imagen se reporta como no subida (aviso `warning`).
- `readUpload` resuelve `realpath` y exige que quede dentro de `UPLOADS_ROOT` (un
  symlink no saca archivos de fuera). `deleteUpload` (preexistente) gana el mismo
  chequeo con separador (`uploads-evil` no cuenta como dentro).

### Implementación de RF-123 (aviso persistente tras guardar producto)
- `apps/web/lib/admin/flash.ts`: `setFlash(notice)` / `consumeFlash()` sobre
  `sessionStorage` (try/catch: si no hay storage, el aviso se pierde pero la
  operación no falla) + evento `window` `danme:flash` para avisos emitidos sin
  cambiar de página (toggles).
- `apps/web/components/admin/FlashNotice.tsx`: consume el flash al montar y escucha
  el evento; renderiza `Notice` hasta que se cierra. Se monta en las listas de
  productos y usuarios.
- Se descartó pasar el mensaje por query string: cualquiera podría fabricar un link
  que muestre un aviso falso dentro del panel.
- `ProductForm` tras guardar: `setFlash` con "Producto creado"/"Producto actualizado"
  o, si la imagen falló, warning "Producto guardado, pero la imagen no se pudo
  subir: ‹motivo›"; luego `router.push("/admin/products")`. Si el registro mismo
  falla, se queda en el formulario con el error (comportamiento actual).

### Pruebas (por zona)
| Zona | Qué se prueba | Herramienta |
|---|---|---|
| `lib/admin/mutate.ts` | 2xx → ok+data; 4xx con `detail` → error con motivo; 4xx sin JSON → `Error <status>`; `fetch` rechaza → mensaje de red | vitest (unit, `fetch` mock) |
| `lib/admin/flash.ts` | set→consume devuelve y borra; storage que lanza no rompe | vitest (unit) |
| `uploads.service.ts` `readUpload` | lee archivo válido; `..`/ruta absoluta/extensión no permitida/inexistente → null | vitest (unit, dir temporal) |
| `app/uploads/[...path]/route.ts` | 200 + Content-Type + Cache-Control; 404 RFC 9457 en traversal/inexistente | vitest (unit, `UPLOADS_ROOT` mockeado) |
| `Notice`, `FlashNotice` | roles ARIA por variante; cerrar lo oculta; consume flash al montar y por evento | vitest + Testing Library |
| `ProductForm`, `SettingsForm`, toggles, `users/new` | éxito → mensaje de éxito; fallo de registro → error con motivo; fallo solo de imagen → warning parcial; error de red → mensaje de red | vitest + Testing Library |
| `Dockerfile` / volumen | build de la imagen + upload real contra el contenedor local; imagen subida responde 200 sin reiniciar | verificación manual con evidencia |

### Secuenciación (tests antes que código)
1. `mutate.ts` + `flash.ts` (tests → código).
2. `Notice` + `FlashNotice` (tests → código).
3. `readUpload` + route handler `/uploads/[...path]` (tests → código).
4. Formularios y toggles (tests → refactor a `mutate` + avisos), listas montan `FlashNotice`.
5. `Dockerfile` → build local → verificación manual end-to-end.
6. Docs.

### Seguimiento de complejidad
Sin dependencias nuevas. Sin librería de toasts: `Notice` + `sessionStorage` (≈60
líneas) bastan para 2 listas.

### Impacto en documentación (enmienda)
| Documento | Ruta | Qué cambia | Tarea |
|---|---|---|---|
| Arquitectura | `docs/ARCHITECTURE.md` | `/uploads/*` servido por route handler además del estático; `lib/admin/` (mutate, flash) y regla "toda escritura muestra aviso" | `[doc]` T-075 |
| Deploy / infra | `docs/DEPLOYMENT.md` | Dueño del volumen `danme-uploads` (uid 1001) y `chown` único para volúmenes existentes | `[doc]` T-076 |

## 10. Enmienda 2026-10-14 (b) — eliminar producto y pantalla siempre al día

Cubre RF-125..RF-128 (SPEC-002, aprobada Fase 1 `enmienda_2026-10-14b_fase_1`).

### Implementación de RF-126 (borrado físico)
- `lib/services/products-admin.service.ts` → `deleteProduct(id)`: lee el producto
  (`null` → devuelve `null`), `prisma.product.delete`, y **después** `deleteUpload(imageUrl)`
  (el archivo se borra solo si la fila ya se borró; si el `rm` fallara queda un
  archivo huérfano, nunca una fila apuntando a nada). `Product` no tiene relaciones.
- `app/api/admin/products/[id]/route.ts` → `DELETE`: 204 sin cuerpo; inexistente →
  404 RFC 9457 "Producto no encontrado". Protegido por `proxy.ts` como el resto de
  `/api/admin/**` (sin sesión → 401).

### Implementación de RF-125 / RF-127 (diálogo + aviso)
- `components/admin/DeleteProductButton.tsx` (cliente; props `productId`,
  `productName`): botón "Eliminar" (variante `danger`) que abre un modal propio
  (`role="dialog"`, `aria-modal`, `aria-labelledby`) con el texto de RF-125 y botones
  "Cancelar" / "Eliminar". Escape, clic en el fondo o "Cancelar" cierran sin
  petición. Al confirmar: `mutate(DELETE)` → `setFlash` (éxito «Producto «X»
  eliminado» / error «No se pudo eliminar «X»: motivo») → `router.refresh()` solo si
  `ok`. Mientras borra, el botón muestra "Eliminando…" y queda deshabilitado (sin
  doble envío).
- `app/admin/(protected)/products/page.tsx`: el botón va en la celda de acciones de
  cada fila, junto a Editar y Activar/Desactivar.
- Sin dependencias nuevas (nada de librerías de modal).

### Implementación de RF-128 (pantalla al día)
- Diagnóstico (2026-10-14, build de producción local + Playwright contra
  `danme_test`): crear, editar, activar/desactivar, quitar imagen, volver a editar,
  "atrás" del navegador y la landing **ya reflejan el cambio sin recargar**. Las
  páginas `(protected)` son `force-dynamic` y el Client Cache de Next 16 no guarda
  páginas dinámicas (`staleTimes.dynamic` = 0). Cloudflare responde
  `cf-cache-status: DYNAMIC`. El síntoma reportado coincide con la versión anterior
  en producción (imagen invisible hasta reiniciar — RF-124, desplegado 18:19).
- Por eso RF-128 se cumple con el patrón ya existente (toda escritura exitosa →
  `router.refresh()` o navegación a una página dinámica). Se fija con pruebas: cada
  componente de escritura de productos verifica `refresh` en éxito, y un script e2e
  (Playwright) recorre los 6 flujos + eliminar. **Si el usuario reporta un caso
  concreto que siga fallando, se reabre con esos pasos.**

### Pruebas (por zona)
| Zona | Prueba | Cubre |
|---|---|---|
| servicio+API (db) | `tests/db/api-product-delete.test.ts`: DELETE 204 borra fila y archivo; 404 si no existe; sin sesión 401; error inesperado → 500 (no 404); `rm` falla tras borrar la fila → 204 + archivo huérfano registrado | RF-126 |
| UI | `tests/components/DeleteProductButton.test.tsx`: abre diálogo con el nombre; Cancelar / Escape / fondo → sin fetch; confirmar ok → flash éxito + refresh; error → flash con motivo, sin refresh; deshabilitado mientras borra | RF-125, RF-127, RF-128 |
| UI | `ProductForm.feedback` / `AdminWriteFeedback`: aserción explícita de navegación/`refresh` en cada éxito | RF-128 |
| e2e manual | `apps/web/e2e/delete-product.mjs` (Playwright) contra build local + `danme_test`; salida en `.harness/memory/evidence/2026-10-14-eliminar-producto.md` | RF-125..RF-128 |

### Secuenciación (tests antes que código)
1. Tests db de DELETE (rojo) → `deleteProduct` + handler `DELETE`.
2. Test de `DeleteProductButton` (rojo) → componente → montarlo en la lista.
3. Aserciones de `refresh` (RF-128) en los tests existentes.
4. e2e Playwright; docs.

### Impacto en documentación
| Doc | Cambio |
|---|---|
| `docs/CONTENT-MODEL.md` | `available`: quitar "no hay borrado físico"; eliminar = `DELETE` definitivo (RF-126) |
| `docs/ARCHITECTURE.md` | `DELETE /api/admin/products/[id]` en el mapa de API |

