---
tipo: memoria
subtipo: state
actualizado: 2026-10-14
---

# Estado del arnés — danme

## ⚠️ Correcciones del usuario (leer SIEMPRE — no borrar)

> Formato por entrada:
> ### [YYYY-MM-DD] ‹título corto›
> - **Qué pasó:** ‹el error o la suposición equivocada›
> - **Corrección:** ‹lo que el usuario indicó›
> - **Cómo aplicar:** ‹la regla para no reincidir›

### [2026-09-20] "Cero al llegar" antes de repartir culpas de infra
- **Qué pasó:** dije "todavía no [está accesible]" y atribuí el bloqueo solo a
  `cjhirashi-srv` (falta crear `net-danme`), sin haber verificado que **mi propia
  parte** (levantar `danme-web`) tampoco estaba hecha.
- **Corrección:** el usuario señaló que yo tampoco había levantado el contenedor —
  no era 100% culpa del otro sistema.
- **Cómo aplicar:** antes de reportar un bloqueo como "ajeno", verificar en vivo
  (`docker ps`, `docker network ls`, logs) el estado real de **ambos** lados, no
  asumir a partir del último mensaje leído.

### [2026-10-14] Toda acción del panel debe decir qué pasó
- **Qué pasó:** la subida de imagen de producto fallaba (EACCES en el volumen) y el
  formulario ignoraba la respuesta — el usuario no veía ni éxito ni error. Mismo
  patrón que ya se corrigió en el cambio de password (2026-09-23).
- **Corrección:** cada carga de imagen y cada creación/actualización de registro
  DEBE mostrar un mensaje de éxito o de error. "Si nunca indicas nada, no sabemos
  qué pasó."
- **Cómo aplicar:** ningún `fetch` de escritura en el panel puede ignorar su
  respuesta; todo flujo de escritura termina en un mensaje visible (éxito o error
  con el motivo). Revisarlo en cada review de UI del admin.

## Estado del backlog

- Génesis: **hecha** (ADR-001 perfil de arquitectura, ADR-002 especialista UX/UI).
- Feature **001-landing-base**: `implemented`, commiteada (`f758dcb` + cierre
  `d8c298a`). **Live en producción**: https://danme.cjhirashi.com (contrato
  `caddy.json` validado por `cjhirashi-srv`, commit `3ddaab4`).
- Feature **002-panel-admin**: `implemented`, commiteada (`c95fdaf` + cierre
  `fdb6aa5`). 61/61 tareas, 20 RF con test y `Pass`. Gate verde. Panel accesible en
  `/admin/login` (local: `http://localhost:3000/admin/login`; producción:
  `https://danme.cjhirashi.com/admin/login`). Verificado end-to-end manualmente
  (login, lockout tras 5 intentos, CRUD de producto + imagen, settings, usuarios,
  logout) — capturas en `/tmp/admin-shots/` (no versionadas, solo evidencia local).
- Cuentas admin: `cjhirashi@gmail.com` (Carlos) y `danieljime444@gmail.com`
  (Daniel). **Importante:** el Postgres de este entorno de trabajo y el de
  producción (`danme.cjhirashi.com`) son **la misma base** — no hay separación
  dev/prod. Carlos ya cambió su password real desde el panel (2026-09-23, entre
  sesiones) — `admin1234` ya NO es válida para su cuenta. La de Daniel seguía con
  el temporal la última vez que se verificó.
- Iteración de UI del panel (feedback directo del usuario, 2026-09-23, sin pasar
  por specify/plan — ajuste de bajo riesgo dentro del alcance ya aprobado de
  SPEC-002): sidebar en vez de nav horizontal; `ImageUploadField` (componente
  compartido) reemplaza el `<input type=file>` desnudo en productos/settings;
  cambio de password ahora pide confirmación (debe coincidir, ≥8 caracteres) y
  muestra un banner de éxito visible (antes el usuario no veía confirmación
  ninguna). Commit `1b6edb8`, redesplegado en producción.

- **Enmienda SPEC-002 (2026-10-14):** avisos visibles en toda escritura del panel
  (RF-121..RF-123) y subida de imágenes arreglada (RF-124, RNF-101). `implemented`,
  aprobada por el revisor. **Producción aún sin arreglar:** falta `chown` único del
  volumen `danme-uploads` + redeploy (requiere permiso del usuario).
- Gate en rojo solo por `theme-tokens.test.ts` (oklch con `°` en `globals.css`,
  commit `8cb5e02`, rediseño de otra sesión — fuera de alcance de la enmienda). Ojo:
  `°` no es CSS válido; un redeploy con ese commit pierde los colores de marca.

## Decisiones tomadas (histórico, sigue vigente)

- Stack: Next.js 16 (App Router + TS) monolito en `apps/web/`, patrón por capas,
  Postgres/Prisma, Docker self-host. (ADR-001)
- Paleta DanMe (SPEC-001 §5b): `#416E51` verde, `#123322` verde oscuro, `#FEBD59`
  ámbar, `#DF6C2B` naranja quemado, `#E3C392` crema.
- Sellos NOM-051 sí se muestran en el sitio (confirmado por el usuario).
- **ADR-003 (2026-09-20):** de "un único admin" (ADR-001/Art. 5 original) a **N
  administradores, mismo rol, sin RBAC**. Motivo: el usuario (Carlos) y el
  propietario del negocio (Daniel) necesitan editar por igual. Alta de cuentas
  nuevas solo desde el panel (nunca registro público); la primera se siembra vía
  `.env`. Constitución Art. 5 enmendado.
- **Rechazado explícitamente por el usuario:** resguardo anti-bloqueo del último
  admin activo (propuesto por el agente). Riesgo aceptado — ver SPEC-002 §6.
- Auth casera con `node:crypto` (scrypt + HMAC) — **cero dependencias nuevas**,
  ni `bcrypt` ni `jose`/`jsonwebtoken`. Sesión: cookie firmada httpOnly
  *stateless* (sin tabla `Session`; revocación vía `AdminUser.active`, releído en
  cada request).
- Imágenes: subida de archivo a disco local (`public/uploads/`, volumen Docker
  `danme-uploads`), JPG/PNG/WebP máx 5MB. Sin resize/compresión server-side (no
  se pidió, evita añadir `sharp`).
- Despliegue: acceso externo vía Caddy gestionado por `cjhirashi-srv`, coordinado
  por `caddy.json` (raíz del repo). `net-danme` ya existe y `danme-web` ya corre
  ahí. Detalle: `docs/DEPLOYMENT.md`.

## Hazards / aprendizajes técnicos

- **Prisma 7**: `datasource.url` ya NO va en `schema.prisma` — va en
  `prisma.config.ts` (CLI) y como driver adapter (`@prisma/adapter-pg`) en
  runtime (`lib/db/prisma.ts`).
- El tag `latest` de `npm view prisma` apuntaba a un release candidate 8.x con
  dependencias enormes (Cloudflare `workerd`). Se fijó `prisma@7.10.0` explícito.
- Next.js 16: Tailwind v4 es CSS-first (`@theme` en `globals.css`, no
  `tailwind.config.ts`); `middleware.ts` está **deprecado y renombrado a
  `proxy.ts`**, que corre en runtime Node.js por defecto (antes Edge) — puede usar
  Prisma y `node:crypto` sin restricciones.
- La landing pública lleva `export const dynamic = "force-dynamic"` (si no, Next
  hornea el contenido en build time).
- Imagen runtime `node:24-slim` necesita `apt-get install openssl` explícito para
  el motor de Prisma.
- Tests de integración (`tests/db/`) corren contra `danme_test` con
  `fileParallelism: false` (`vitest.db.config.ts`) — en paralelo, archivos que
  comparten tablas producían carreras intermitentes.
- Sin sudo/root en este entorno para deps de sistema de Chromium — capturas se
  hacen con contenedor `mcr.microsoft.com/playwright` (`--network host`).
- `npm install-scripts approve` es necesario para paquetes con postinstall
  legítimos (prisma engines, esbuild, unrs-resolver) — npm 11+ los bloquea por
  defecto.
- **Todas** las páginas que leen Postgres necesitan `force-dynamic` (no solo la
  landing): las páginas admin (`app/admin/(protected)/**`) lo heredan del
  `layout.tsx` de ese route group — evita que Next intente prerenderizarlas en
  build time sin DB disponible.
- **Next.js standalone + Docker multi-red:** el server usa `$HOSTNAME` para el
  bind del socket; Docker fija `HOSTNAME` al hostname del contenedor, que en un
  contenedor conectado a 2 redes (`net-danme` + `net-danme-db`) resuelve a una
  sola IP — el server quedaba inalcanzable desde la otra red (Caddy: "connection
  refused" aunque resolvía la IP correcta). Fix: `ENV HOSTNAME="0.0.0.0"`
  explícito en el Dockerfile (`runner`).
- `docker-compose.yml` con `${VAR:?...}` (variable obligatoria) necesita un `.env`
  en la **raíz del repo** (no `apps/web/.env`) para la interpolación — separado del
  gitignore de `apps/web/`, se creó `.gitignore` en la raíz.

## Próximo paso concreto

1. **Hecho:** redesplegado en producción — panel admin verificado en vivo en
   https://danme.cjhirashi.com/admin/login (login + ruta protegida responden 200
   con las cuentas reales).
2. Avisar a Carlos y Daniel que cambien la password temporal (`admin1234`) desde
   `/admin/account` en cuanto tengan acceso.
3. Sin Feature 003 planeada todavía.
4. Con permiso: `docker run --rm -v danme-uploads:/data alpine chown -R 1001:1001 /data`
   + `docker compose build web && docker compose up -d web`; luego
   `docker logs danme-web | grep EACCES` vacío y subir una imagen real.
