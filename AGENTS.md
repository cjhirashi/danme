# AGENTS.md — mapa de danme

> **Punto de entrada** para cualquier agente que trabaje en este repo. Es un **mapa**,
> no una biblia: lee sólo lo que necesites, cuando lo necesites.
>
> **Cómo trabajamos:** este repo usa un arnés **SDD Anchored** (spec viva anclada al
> código). Empieza por **`.harness/method.md §0`**. Los principios innegociables están
> en **`.harness/constitution.md`**.
>
> **Separación estricta:** `.harness/` = cómo operamos · `docs/` = el producto.

## Antes de empezar (en orden)

1. Ejecuta **`.harness/gate/check.sh`**. Si cierra la compuerta (exit 1 / algún ❌),
   **DETENTE** y reporta.
2. Lee **`.harness/memory/state.md`** completo (corto; las correcciones del usuario van
   arriba y se leen SIEMPRE).
3. Ojea **`.harness/specs/`** — carpetas `NNN-slug` = features; `estado:` en su `spec.md`.

## Qué es el sistema

Landing page pública con diseño responsive + panel de administración de contenido para
un único administrador. Monolito Next.js (App Router + TypeScript) en `apps/web/`,
patrón por capas, persistencia en Postgres vía Prisma, deploy en Docker self-host.
Detalle en `.harness/constitution.md` Art. 1-2.

**Estado:** greenfield — Génesis del arnés hecha (ADR-001/002); `apps/web/` todavía no
existe. La primera spec (Fase 1) crea el andamiaje del proyecto Next.js.

## Servicios / módulos y comandos

| Servicio | Stack | Tests | Arranque local |
|---|---|---|---|
| `apps/web` | Next.js (App Router) + TypeScript + Prisma/Postgres | vitest (por definir en el primer `plan.md`) | *(pendiente — se define al scaffoldear)* |

## Convenciones

- Código en **inglés**; specs/docs/interacción en **español**. Commits: **Conventional
  Commits** + `(RF-NNN)`.
- IDs `RF-`/`RNF-`/`T-` por feature, `ADR-` por proyecto; número reservado al crear el archivo.
- Tests anotados con su `RF-`: comentario `// RF-NNN` junto al `describe`/`it`.
- Errores de API: **RFC 9457** (Art. 6 — rutas internas, sin OpenAPI formal por ahora).

## Mapa de documentación (producto)

Aún no existe `docs/` de producto (greenfield). Tabla completa (con "se actualiza
cuando cambia…"): `.harness/constitution.md` Art. 11.

## Bindings de herramienta

`.claude/agents/` es el binding de Claude Code: `orquestador`, `autor-de-spec`,
`arquitecto`, `implementador`, `revisor`, `explorador` (base) + `experto-ux-ui`
(especialista, ADR-002 — proyecto con frontend). El núcleo del arnés vive en `.harness/`.
