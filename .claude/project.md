# DanMe — Tienda de Productos Naturales

**Estado:** Feature 002 en producción (panel admin verificado), Feature 003 pendiente

## Qué es

Plataforma de e-commerce para venta de productos naturales. Landing page pública responsiva + panel administrativo para gestionar productos, imágenes, usuarios y configuración. Deploy en Docker self-host con Caddy como reverse proxy.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind v4
- **Backend:** Next.js (misma aplicación), Node.js middleware
- **Base de datos:** PostgreSQL 16, Prisma 7 ORM
- **Auth:** Casera (node:crypto, scrypt + HMAC, cookies httpOnly stateless)
- **Almacenamiento:** Imágenes en disco local (`public/uploads/`)
- **Deploy:** Docker self-host, Caddy reverse proxy (gestionado por `cjhirashi-srv`)
- **Tests:** Vitest (unitarios + integración contra BD real)

## Arquitectura

```
danme/
├── apps/web/                  # Monolito Next.js
│   ├── app/                   # App Router
│   │   ├── (public)/          # Landing page
│   │   └── admin/(protected)/ # Panel admin (rutas protegidas)
│   ├── lib/
│   │   ├── db/               # Prisma + adaptadores
│   │   ├── auth/             # Login, sesiones
│   │   ├── upload/           # Subida de imágenes
│   │   └── api/              # Helpers de API
│   ├── components/           # Componentes React reutilizables
│   ├── tests/                # Tests de integración (BD real)
│   └── prisma/               # Schema + migraciones
├── docs/                      # Documentación de producto
├── .harness/                  # Gobernanza (SDD Anchored)
└── caddy.json                 # Configuración Caddy (cjhirashi-srv)
```

## Decisiones Tomadas (Vigentes)

| Decisión | Razón | Vigencia |
|----------|-------|----------|
| **Monolito Next.js** | Startup pequeño, patrón por capas separa concerns | ADR-001 |
| **Auth casera (crypto)** | Cero dependencias externas, control total | ADR-001 §5 |
| **N admins, mismo rol** | Carlos + Daniel editan a la vez, no RBAC | ADR-003 (2026-09-20) |
| **Imágenes en disco local** | Simplemente, sin S3/CDN (de momento) | State.md §"Imágenes" |
| **Postgres compartida dev/prod** | Único entorno, no hay separación dev/staging | State.md §"Cuentas admin" |
| **Sellos NOM-051 visibles** | Requisito de negocio | State.md §"Paleta DanMe" |

## Estado de Features

| Feature | Estado | Tareas | Verificado | Producción |
|---------|--------|--------|-----------|-----------|
| **001-landing-base** | ✅ Implemented | 30/30 | ✅ Sí | ✅ Live |
| **002-panel-admin** | ✅ Implemented | 61/61 | ✅ Sí | ✅ Live |
| **003-…** | ⏳ Planeando | — | — | — |

**Producción:** https://danme.cjhirashi.com (landing) + https://danme.cjhirashi.com/admin/login (panel)

## Cuentas Admin (Importante ⚠️)

- `cjhirashi@gmail.com` (Carlos) — password CAMBIADO desde el panel (2026-09-23)
- `danieljime444@gmail.com` (Daniel) — password temporal aún activa (última verificación: 2026-09-23)

**ACCIÓN:** Ambos deben cambiar su password temporal desde `/admin/account` en cuanto accedan.

## Hazards Conocidos

| Hazard | Impacto | Mitigación |
|--------|---------|-----------|
| **Prisma 7 config change** | CLI necesita `prisma.config.ts` (no schema.prisma) | Aplicado en repo |
| **Next.js 16 Tailwind v4** | CSS-first (@theme, no config.ts) | Aplicado en globals.css |
| **middleware.ts deprecado** | Renombrado a proxy.ts (runtime Node, no Edge) | Documentado en state.md |
| **HOSTNAME en Docker multi-red** | Server inalcanzable desde red 2 | `ENV HOSTNAME="0.0.0.0"` en Dockerfile |
| **Postgres compartida dev/prod** | Sin separación de datos | Riesgo aceptado (state.md §"Rechazado…") |

## Próximos Pasos

1. **Ahora:** Clarificar FEATURE-003 con Carlos (qué quiere agregar/cambiar)
2. **SDD Specify:** Redactar spec.md con criterios EARS
3. **SDD Plan:** Tareas + timeline
4. **SDD Implement:** Código + tests
5. **SDD Review → Verify:** Gate + producción

## Flujo SDD

| Fase | Quién | Qué | Verificación |
|------|-------|-----|--------------|
| Specify | Claude Code | Redacta spec (criterios EARS, riesgos) | Spec-End |
| Plan | Carlos | Revisa → Aprueba o ajusta | Gate 1 (value) + 2 (tech) |
| Tasks | Carlos | Desagrega tareas (T-NNN) | Gate 2 completo |
| Implement | Claude Code | Código + tests + gate | Tests pasan, gate ✅ |
| Review | Carlos | Revisa diff + merge | Convence al revisor |
| Verify | Carlos | Marca `verified` en state.md | Producción lista |

## Reglas Duras

1. **Gate primero:** `bash .harness/gate/check.sh` antes de tocar código
2. **state.md manda:** Correcciones del usuario en state.md §"Correcciones"
3. **Spec o SDD:** No código sin spec, no rediseño sin Specify
4. **No auto-aprobar:** Revisor (Carlos) firma todo
5. **Tests contra BD real:** Vitest con `danme_test` (no mocks)
6. **Force-dynamic:** Todas las rutas que leen Postgres
7. **Secretos en .env:** Nunca en código, siempre `process.env.`

## Referencias

- `.harness/method.md` — Método SDD Anchored
- `.harness/constitution.md` — Decisiones arquitectónicas (Art. 1-11)
- `.harness/memory/state.md` — Correcciones + hazards técnicos
- `docs/DEPLOYMENT.md` — Instrucciones de deploy en `cjhirashi-srv`
- `apps/web/README.md` — Guía dev local (por escribir)

---

**Proyecto:** DanMe  
**Método:** SDD Anchored  
**Especialista UX/UI:** AIRA (Claude Code)  
**Revisor/Gate:** AIRA + Carlos  
**En Producción:** Sí (Feature 001-002 verificadas)
