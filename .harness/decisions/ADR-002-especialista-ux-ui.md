---
id: ADR-002
tipo: adr
estado: accepted
fecha: 2026-09-20
---

# ADR-002 · Adopción del especialista `experto-ux-ui`

## Contexto y planteamiento del problema

`danme` es un proyecto con frontend público (landing responsive) y un panel de
administración con el que interactúa un usuario humano a diario. El conjunto base de
agentes del arnés no incluye una revisión dedicada de UX/UI; sin ella, la calidad
visual/interacción queda solo en manos de quien implementa.

## Decisión

Copiamos `experto-ux-ui` del set de especialistas opcionales de `reference/` a
`.claude/agents/`. Interviene en Fase 1/2 (flujos, estados por vista, `RF-` de UX) y en
Fase 4 (revisión contra estándar: jerarquía, espaciado, tipografía, contraste WCAG AA,
consistencia de componentes, accesibilidad de teclado/ARIA, responsive, microcopy). No
escribe código de producción.

## Opciones consideradas

- **No añadir especialista, dejarlo en manos del `implementador`** — descartada: sin un
  revisor dedicado, la landing/panel corre el riesgo de quedar funcional pero
  inconsistente o poco accesible.
- **Añadir `experto-ux-ui`** — **elegida**: es de bajo costo (no implementa, solo
  diseña/revisa) y este proyecto es, por definición, mayormente interfaz.

## Consecuencias

- **Buenas:** cada feature de interfaz pasa por una revisión de UX/UI antes de
  `verified` (Constitución, cláusula a añadir si se formaliza como gate humano).
- **Coste / malas:** un paso más en el flujo de Fase 4 para features de UI (revisión
  antes de dar por cerrada la tarea).

## Enlaces

- Afecta a: `.claude/agents/experto-ux-ui.md` (copiado tal cual, sin nota de sistema de
  diseño propia todavía — se rellena en la primera spec de UI).
- Relacionado: ADR-001.
