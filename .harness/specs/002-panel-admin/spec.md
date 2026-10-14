---
id: SPEC-002
tipo: spec
feature: 002-panel-admin
estado: in-review
# --- anclaje (fusionado; ver method.md §9) ---
anchor_commit: c95fdaf49681673a68a4a7d696583f6082ac2e4f
anchor_mode: advisory
covers:
  - apps/web/app/admin/**
  - apps/web/app/api/admin/**
  - apps/web/proxy.ts
  - apps/web/components/admin/**
  - apps/web/lib/services/auth.service.ts
  - apps/web/lib/services/admin-users.service.ts
  - apps/web/lib/services/products-admin.service.ts
  - apps/web/lib/services/site-settings-admin.service.ts
  - apps/web/lib/services/uploads.service.ts
  - apps/web/lib/services/uploads-root.ts
  - apps/web/lib/db/admin-users.repository.ts
  - apps/web/lib/http/**
  - apps/web/lib/admin/**
  - apps/web/app/uploads/**
  - apps/web/prisma/schema.prisma
  - apps/web/prisma/seed.ts
  - apps/web/prisma/migrations/20260920200740_admin_users/**
  - apps/web/tests/**
  - docker-compose.yml
  - docs/CONTENT-MODEL.md
  - docs/ARCHITECTURE.md
  - docs/DEPLOYMENT.md
  - apps/web/README.md
# --- aprobaciones humanas ---
aprobaciones:
  fase_1: { por: "Carlos", fecha: 2026-09-20 }
  fase_2: { por: "Carlos", fecha: 2026-09-20 }
  enmienda_2026-10-14_fase_2: { por: "Carlos", fecha: 2026-10-14 }
  enmienda_2026-10-14_fase_1: { por: "Carlos", fecha: 2026-10-14 }
actualizado: 2026-10-14
---

# SPEC-002 · Panel de administración (auth + CRUD de contenido)

> Producida en Fase 1 por elicitación interactiva con el usuario (`method.md §3`).
> Depende de ADR-003 (enmienda Constitución Art. 5: N administradores, mismo rol).
>
> **Enmienda 2026-10-14** (bug reportado en producción): la subida de imágenes fallaba
> en silencio (volumen `danme-uploads` sin permiso de escritura para el proceso +
> formulario que ignoraba la respuesta). Añade RF-121..RF-124 y precisa RNF-101.
> Regla del usuario: *"si nunca indicas nada, no sabemos qué pasó"*.

## 1. Contexto del dominio

La landing (SPEC-001) sirve contenido desde Postgres con datos mockup/seed. Esta
feature construye el panel que lo hace editable, con autenticación de **N cuentas
administradoras** (mismo rol, sin RBAC — ADR-003): Carlos (operador técnico) y
Daniel (dueño del negocio DanMe), quien gestionará el contenido del día a día.

Límites del sistema: rutas protegidas `/admin/**` y `/api/admin/**` dentro del mismo
monolito Next.js. Sesión por cookie firmada httpOnly (sin librería de terceros de
auth — Art. 5, "nada de dependencias nuevas sin justificación"). Subida de imágenes
a disco local (volumen Docker), sin servicio de almacenamiento externo.

## 2. Alcance

### En alcance
- **Login/logout** — formulario email+password, sesión por cookie firmada httpOnly.
- **Gestión de productos** — crear, editar, desactivar (`available=false`, ya
  existe el campo — no hay borrado físico, confirmado por el usuario), y activar de
  nuevo. Subida y eliminación de imagen de producto (archivo, disco local).
- **Edición de `SiteSettings`** — marca, tagline, WhatsApp, Instagram, Facebook,
  logo (con subida de imagen igual que productos).
- **Gestión de usuarios admin** — listar, crear cuenta nueva (email+password),
  desactivar/reactivar. Sin registro público: solo una cuenta admin autenticada
  puede crear otra.
- **Cambiar contraseña propia** — el admin autenticado cambia su password sin
  pasar por `.env`.
- **Límite de intentos de login** — bloqueo temporal tras varios intentos fallidos
  seguidos con el mismo email (protección básica anti fuerza-bruta).

### Fuera de alcance
- **RBAC / permisos diferenciados** — descartado explícitamente (ADR-003): las 2
  cuentas tienen el mismo rol.
- **Resguardo anti-bloqueo** (impedir desactivar al último admin activo) —
  propuesto y **rechazado explícitamente por el usuario**. Riesgo aceptado: es
  posible que los 2 administradores se desactiven mutuamente y pierdan acceso; la
  recuperación en ese caso es manual (acceso directo a Postgres). *(§6.)*
- **Borrado físico de productos** — "eliminar" en la UI es desactivar
  (`available=false`), no `DELETE` de la fila.
- **Recuperación de contraseña por email** ("olvidé mi contraseña") — no hay envío
  de email en esta fase (Art. 5, requeriría integración externa nueva). Si un admin
  pierde su contraseña, otro admin no puede resetearla desde el panel en esta
  feature (fuera de alcance) — recuperación es manual (acceso directo a Postgres).
- **Registro público de cuentas** — nunca. Todas las cuentas nuevas se crean desde
  el panel por una cuenta ya autenticada (o la primera, por seed).

## 3. Modelo de datos y contratos de E/S

| Frontera | Dirección | Tipo | Contrato |
|---|---|---|---|
| `/api/admin/auth/login` | entrada | REST (interna) | RFC 9457 en error |
| `/api/admin/auth/logout` | entrada | REST (interna) | — |
| `/api/admin/products` , `/api/admin/products/[id]` | entrada | REST (interna) | RFC 9457 en error |
| `/api/admin/products/[id]/image` | entrada | REST (interna, multipart) | RFC 9457 en error |
| `/api/admin/settings` | entrada | REST (interna) | RFC 9457 en error |
| `/api/admin/users` , `/api/admin/users/[id]` | entrada | REST (interna) | RFC 9457 en error |
| `/api/admin/account/password` | entrada | REST (interna) | RFC 9457 en error |

Todas las rutas `/api/admin/**` son **internas** (solo las consume `/admin/**` del
mismo panel) — Art. 6 no exige `openapi.yaml` mientras no tengan otro consumidor.

**`AdminUser`** (nueva entidad)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `email` | string (único) | login |
| `passwordHash` | string | bcrypt/argon2, nunca se expone |
| `active` | boolean | `false` → no puede iniciar sesión |
| `createdAt` / `updatedAt` | datetime | — |

`Product` y `SiteSettings`: sin cambios de schema (SPEC-001 §3); esta feature les
añade una UI/API de edición. `Product.imageUrl` y `SiteSettings.logoUrl` pasan a
poblarse vía subida de archivo (antes solo por seed).

## 4. Criterios de aceptación (EARS)

**Auth**
- **RF-101** — El sistema DEBE permitir iniciar sesión con email+password contra
  `AdminUser.active=true`, estableciendo una cookie de sesión firmada httpOnly.
- **RF-102** — SI las credenciales son inválidas O la cuenta está inactiva ENTONCES
  el sistema DEBE rechazar el login sin distinguir cuál de las dos causas fue
  (mismo mensaje genérico, evita enumerar cuentas válidas).
- **RF-103** — SI hay 5 intentos fallidos seguidos para el mismo email ENTONCES el
  sistema DEBE bloquear nuevos intentos para ese email durante 15 minutos.
- **RF-104** — El sistema DEBE permitir cerrar sesión, invalidando la cookie.
- **RF-105** — CUANDO una request llega a `/admin/**` o `/api/admin/**` sin sesión
  válida, el sistema DEBE redirigir a `/admin/login` (rutas de página) o responder
  401 con cuerpo RFC 9457 (rutas `/api/admin/**`).

**Productos**
- **RF-106** — El sistema DEBE permitir crear un producto con nombre, sabor
  (slug único), descripción, precio, presentación y sellos NOM-051.
- **RF-107** — El sistema DEBE permitir editar cualquier campo de un producto
  existente.
- **RF-108** — El sistema DEBE permitir alternar `available` (activar/desactivar)
  de un producto sin borrar la fila.
- **RF-109** — El sistema DEBE permitir subir una imagen para un producto (JPG,
  PNG o WebP, máximo 5MB), reemplazando la anterior si existía.
- **RF-110** — El sistema DEBE permitir eliminar la imagen de un producto, dejando
  `imageUrl` en `null` (la landing ya muestra placeholder — ver criterio de imagen
  nula de SPEC-001 §4).
- **RF-111** — SI el archivo subido no es JPG/PNG/WebP o excede 5MB ENTONCES el
  sistema DEBE rechazarlo con un error claro, sin guardar el archivo.

**SiteSettings**
- **RF-112** — El sistema DEBE permitir editar `SiteSettings` (marca, tagline,
  WhatsApp, Instagram, Facebook).
- **RF-113** — El sistema DEBE permitir subir/eliminar el logo de `SiteSettings`
  con las mismas reglas de RF-109/RF-110/RF-111.

**Usuarios admin**
- **RF-114** — El sistema DEBE permitir a una cuenta admin autenticada crear una
  cuenta admin nueva (email+password).
- **RF-115** — SI el email ya existe ENTONCES el sistema DEBE rechazar la creación
  con un error claro.
- **RF-116** — El sistema DEBE permitir a una cuenta admin autenticada
  desactivar/reactivar otra cuenta admin (incluida la propia — riesgo aceptado,
  ver §6).
- **RF-117** — El sistema DEBE permitir a una cuenta admin autenticada cambiar su
  propia contraseña, verificando la contraseña actual antes de aceptar la nueva.

## 5. Casos límite y manejo de errores

- **RF-118** — SI una cuenta se desactiva mientras tiene una sesión activa ENTONCES
  la siguiente request autenticada de esa sesión DEBE ser rechazada (re-verificar
  `active` en cada request, no solo al hacer login).
- **RF-119** — SI se intenta subir una imagen a un producto/",SiteSettings" que no
  existe ENTONCES el sistema DEBE responder 404 con cuerpo RFC 9457.
- **RF-120** — SI la nueva contraseña (creación de usuario o cambio propio) tiene
  menos de 8 caracteres ENTONCES el sistema DEBE rechazarla.

**Retroalimentación de escritura** *(enmienda 2026-10-14)*
- **RF-121** — CUANDO termine cualquier operación de escritura del panel (crear o
  editar producto, activar/desactivar producto, subir o eliminar imagen de producto,
  guardar `SiteSettings`, subir o eliminar logo, crear usuario, activar/desactivar
  usuario, cambiar contraseña) el sistema DEBE mostrar un mensaje visible de éxito
  o de error que diga qué se intentó y qué pasó. Ninguna operación de escritura
  puede terminar sin mensaje.
- **RF-122** — SI una operación de escritura falla (respuesta no-2xx o error de
  red) ENTONCES el mensaje DEBE ser de error e incluir el motivo devuelto por el
  servidor (`detail` RFC 9457) o, si no hay, un motivo genérico ("no se pudo
  conectar con el servidor").
- **RF-123** — CUANDO se crea o edita un producto con éxito, el sistema DEBE volver
  a la lista de productos mostrando arriba un aviso que permanece visible hasta que
  el usuario lo cierra ("Producto creado" / "Producto actualizado"). SI el registro
  se guardó pero la imagen falló ENTONCES el aviso DEBE informar ambos resultados
  por separado ("Producto guardado, pero la imagen no se pudo subir: ‹motivo›").
- **RF-124** — CUANDO una imagen o logo se sube con éxito, DEBE quedar accesible en
  su URL de inmediato, sin reiniciar el servicio.

## 6. Registro de decisiones y descartes

| Decisión | Justificación | Alternativa descartada | ADR |
|---|---|---|---|
| N administradores, mismo rol, sin RBAC | Caso real: 2 personas (Carlos, Daniel) necesitan editar por igual | RBAC con roles diferenciados | ADR-003 |
| "Eliminar" producto = desactivar (`available=false`) | Nunca se pierde información ni se rompen referencias por accidente | Borrado físico (`DELETE`) | — |
| Imágenes: subida de archivo a disco local | Self-host, sin servicios externos de almacenamiento (Art. 5) | Solo pegar URL externa | — |
| Límite de intentos de login (5 intentos / 15 min) | Protección básica anti fuerza-bruta, propuesta por el agente y aceptada | Sin límite | — |
| **Resguardo anti-bloqueo del último admin — RECHAZADO** | El usuario prefiere no añadir esa restricción; acepta el riesgo de auto-bloqueo mutuo, recuperable manualmente vía Postgres | Bloquear desactivación del último admin activo | — |
| Sin recuperación de contraseña por email | Evita integración externa nueva (envío de email) no autorizada en esta fase | Flujo "olvidé mi contraseña" con email | — |
| Mensaje de éxito/error obligatorio en toda escritura del panel (RF-121) — alcance: todo el panel, no solo productos | Regla del usuario 2026-10-14: sin mensaje no se sabe si algo se guardó | Solo productos y settings | — |
| Tras guardar producto: volver a la lista con aviso persistente (RF-123) | Elegido por el usuario | Quedarse en el formulario con el aviso | — |
| Sesión: cookie firmada httpOnly *stateless* (sin tabla `Session` en DB) | Menos superficie (Art. 12 anti-hipersistema); revocación se resuelve con `AdminUser.active` (RF-118), no con una tabla de sesiones a limpiar | Tabla `Session` en Postgres con revocación por fila | — |

## 7. Requisitos no funcionales (RNF)

- **RNF-101** — Los archivos subidos se sirven desde un volumen Docker persistente
  (sobreviven a rebuilds de la imagen) — impacta `docker-compose.yml` (Feature 002
  `plan.md`, no SPEC-001). El proceso de la app (usuario no-root del contenedor)
  DEBE tener permiso de escritura sobre ese volumen *(precisión 2026-10-14)*.
- **RNF-102** — Las contraseñas nunca se registran en logs ni se devuelven en
  ninguna respuesta de API (ni siquiera el hash).

## Marcadores abiertos

*(ninguno — `[NEEDS CLARIFICATION] = 0`)*
