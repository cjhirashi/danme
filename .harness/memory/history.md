---
tipo: memoria
subtipo: history
---

# Bitácora del arnés — danme

> Append-only, orden cronológico inverso (lo más reciente arriba). Una entrada
> Session-End por sesión, con el formato fijo de `method.md §10`.

## [2026-09-20] SPEC-001 Landing pública base — implemented
- **Fase alcanzada:** implement (TASKS-001: 37/37 tareas, 9 RF con test y Pass)
- **Rebotes del verificador:** 0 (self-implementado en una sesión; sin verificador adversarial separado — pendiente `verified` humano)
- **Directiva de Pausa:** no
- **Drift / re-anchor:** no (sin commits nuevos todavía — `anchor_commit` sigue en la Génesis, pendiente moverlo al commit de cierre)
- **Anclas movidas:** ninguna todavía (pendiente commit)
- **Gate:** verde (`--full`: 19 ok · 0 warn · 0 error)
- **Docs actualizadas:** `docs/ARCHITECTURE.md`, `docs/CONTENT-MODEL.md`, `docs/DEPLOYMENT.md`, `apps/web/README.md` (todas nuevas)
- **Decisiones de diseño / límites de integración:**
  Landing Next.js 16 + Tailwind v4 + Prisma 7 (driver adapter `@prisma/adapter-pg`,
  cambio de config vs Prisma <7) + Postgres, SSR dinámico (`force-dynamic`) para que
  el futuro panel admin edite contenido sin rebuild. Paleta de marca DanMe extraída
  por muestreo real de imágenes del usuario. Sin rutas `/api/**` (Server Components
  leen Prisma directo). Coordinación de despliegue con sistema externo `cjhirashi-srv`
  vía `caddy.json` (contenedor `danme-web`:3000, red externa `net-danme`).
- **Próximo paso:** decidir con el usuario el commit de cierre (mueve
  `anchor_commit`); luego Fase 1 (Specify) de Feature 002 (panel admin + auth).

## [2026-09-20] Génesis del arnés — hecho
- **Fase alcanzada:** (prompt-directo — implantación del arnés, no es una feature de producto)
- **Rebotes del verificador:** 0
- **Directiva de Pausa:** no
- **Drift / re-anchor:** no
- **Anclas movidas:** ninguna (sin specs todavía)
- **Gate:** pendiente de primera corrida tras esta implantación
- **Docs actualizadas:** `.harness/constitution.md`, `AGENTS.md`, `CLAUDE.md` (copiado de `reference/`)
- **Decisiones de diseño / límites de integración:** Next.js monolito (`apps/web/`) +
  patrón por capas + Postgres/Prisma + Docker self-host + admin single-user (ADR-001).
  Especialista `experto-ux-ui` añadido por ser proyecto con frontend (ADR-002).
- **Próximo paso:** Fase 1 (Specify) de la primera feature — decidir con el usuario si
  empieza por la landing base o por el panel admin.
