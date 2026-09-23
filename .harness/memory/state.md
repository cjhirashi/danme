---
tipo: memoria
subtipo: state
actualizado: 2026-09-20
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

## Estado del backlog

- Génesis: **hecha** (ADR-001 perfil de arquitectura, ADR-002 especialista UX/UI).
- Feature **001-landing-base**: `implemented`, commiteada (`f758dcb` + cierre
  `d8c298a`). `danme-web` corre en Docker, conectado a `net-danme` (ya la creó
  `cjhirashi-srv`). Pendiente de que `cjhirashi-srv` corra su `caddy-sync` para
  la ruta pública — coordinación de su lado, no bloquea nada nuestro.
- Feature **002-panel-admin**: SPEC-002/PLAN-002/TASKS-002 en `implemented` (61/61
  tareas, 20 RF con test y `Pass`). Gate verde (`--full`, 20 ok/1 warn/0 error — el
  warn es drift esperado de `covers`, se resuelve al commitear y mover
  `anchor_commit`). **Todavía no commiteada** — pendiente de que el usuario lo
  apruebe. Verificado manualmente end-to-end (login, lockout tras 5 intentos,
  CRUD de producto + imagen, settings, usuarios, logout) — capturas en
  `/tmp/admin-shots/` (no versionadas).
- Cuentas admin sembradas en dev: `cjhirashi@gmail.com` y
  `danieljime444@gmail.com` (Daniel, propietario del negocio), password temporal
  compartido `admin1234` (ver `.env`, no commiteado). Ambas deben cambiarla desde
  `/admin/account` (RF-117).

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

## Próximo paso concreto

1. Preguntar al usuario si hace el commit de Feature 002 (mover `anchor_commit`
   de SPEC-002 al commit resultante) — no autoaprobado.
2. Tras commitear: `docker compose build web && docker compose up -d web` en el
   servidor real (no solo en este entorno de trabajo) para desplegar el panel.
3. Avisar a Carlos y Daniel que cambien la password temporal (`admin1234`) desde
   `/admin/account` en cuanto tengan acceso.
4. Sin Feature 003 planeada todavía.
