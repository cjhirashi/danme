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

*(sin correcciones todavía)*

## Estado del backlog

- Génesis: **hecha** (ADR-001 perfil de arquitectura, ADR-002 especialista UX/UI).
- Feature **001-landing-base**: SPEC-001/PLAN-001/TASKS-001 en `implemented` (37/37
  tareas, 9 RF con test y `Pass`). Gate verde (`--full`, 19 ok/0 warn/0 error).
  `apps/web/` existe y compila, testea y builda en Docker. Commiteado y cerrado:
  commit `f758dcb` (`anchor_commit` movido). Pendiente de `verified` (revisión
  humana del PR/diff — no autoaprobado).
- Feature 002 (panel admin + auth) — **no iniciada**, siguiente candidata natural.
- `caddy.json`: el usuario ya avisó a `cjhirashi-srv` para que configure la conexión
  (crear red `net-danme`). Pendiente de que ellos sincronicen.

## Decisiones tomadas (histórico, sigue vigente)

- Stack: Next.js 16 (App Router + TS) monolito en `apps/web/`, patrón por capas,
  Postgres/Prisma, Docker self-host. (ADR-001)
- Feature 001 = landing base (responsive), sin carrito (informativo + WhatsApp).
  Feature 002 (futura) = panel admin, auth de un único usuario, mismo modelo
  `Product`/`SiteSettings`.
- Paleta DanMe (extraída de imágenes reales de marca, SPEC-001 §5b): `#416E51`
  verde, `#123322` verde oscuro, `#FEBD59` ámbar, `#DF6C2B` naranja quemado,
  `#E3C392` crema.
- Contenido de marca (nombre, tagline, badges, WhatsApp real) tomado de imágenes del
  usuario; precio es mockup (Feature 002 lo hace editable).
- Sellos NOM-051 sí se muestran en el sitio (confirmado por el usuario).
- Despliegue: acceso externo vía Caddy gestionado por sistema externo
  `cjhirashi-srv`, coordinado por `caddy.json` (raíz del repo) — contrato ya sembrado
  por ese sistema: contenedor `danme-web`, puerto 3000, host `danme.cjhirashi.com`,
  red `net-danme`. **`net-danme` todavía no existe** (la crea `cjhirashi-srv`); hay
  un mensaje abierto (MSG-0005) esperando que `docker-compose.yml` esté listo — ya
  lo está, pendiente de que ellos sincronicen. Detalle: `docs/DEPLOYMENT.md`.

## Hazards / aprendizajes técnicos de esta sesión

- **Prisma 7** cambió el modelo de configuración: `datasource.url` ya NO va en
  `schema.prisma`. Va en `prisma.config.ts` (CLI) y como driver adapter
  (`@prisma/adapter-pg`) en el cliente runtime (`lib/db/prisma.ts`). Ver
  `docs/ARCHITECTURE.md`.
- El tag `latest` de `npm view prisma` apuntaba a un release candidate (8.0.0-rcX)
  con dependencias enormes e innecesarias (Cloudflare `workerd`, `alchemy`). Se fijó
  `prisma@7.10.0` explícito (última estable, igual que `@prisma/client`).
- Next.js 16 usa Tailwind v4 (config CSS-first vía `@theme` en `globals.css`, no
  `tailwind.config.ts`) — el plan original asumía v3, se ajustó sin cambiar RF-005.
- La página debe llevar `export const dynamic = "force-dynamic"`: sin esto, Next
  "hornea" el contenido de Postgres en build time (rompe la edición futura desde el
  admin panel y exige DB accesible durante `docker build`).
- Imagen runtime `node:24-slim` necesita `apt-get install openssl` explícito o el
  motor de Prisma falla en detectar libssl.
- Tests de repositorio (`tests/db/`) corren contra una base separada `danme_test`
  (mismo Postgres, otra DB) con `fileParallelism: false` (config propia,
  `vitest.db.config.ts`) — correr los archivos en paralelo contra las mismas tablas
  producía carreras (`upsert` fallando de forma intermitente).
- Sin sudo/root disponible en este entorno para instalar deps de sistema de
  Chromium — la verificación responsive (T-033) se hizo con un contenedor
  `mcr.microsoft.com/playwright` (`--network host`) en vez de Playwright local.

## Próximo paso concreto

1. Preguntar al usuario si hace el commit de cierre (mover `anchor_commit` de
   SPEC-001 al commit resultante) — no autoaprobado, pendiente de decisión humana.
2. Feature 002 (panel admin + auth) — Fase 1 (Specify) cuando el usuario quiera
   continuar.
3. Revisar si `cjhirashi-srv` ya sincronizó `net-danme` (mensaje MSG-0005 en
   `caddy.json` sigue abierto).
