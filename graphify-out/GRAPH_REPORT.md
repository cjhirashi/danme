# Graph Report - danme  (2026-10-28)

## Corpus Check
- 141 files · ~47,557 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .graphify-bak 1, .example 1)

## Summary
- 736 nodes · 1299 edges · 55 communities (46 shown, 9 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ffa39b38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- flash.ts
- vitest
- @prisma/client
- problemResponse
- Método del arnés — `.harness/`
- package.json
- PLAN-002 · Panel de administración (auth + CRUD de contenido)
- devDependencies
- compilerOptions
- Constitución — danme
- Tareas
- PLAN-NNN · ‹Nombre›
- DanMe — Tienda de Productos Naturales
- SPEC-001 · Landing pública base (responsive)
- SPEC-002 · Panel de administración (auth + CRUD de contenido)
- SPEC-NNN · ‹Nombre de la funcionalidad›
- Arquitectura — danme
- check.sh
- AdminSidebar.tsx
- products/page.tsx
- next
- Estado del arnés — danme
- AGENTS.md — mapa de danme
- delete-product.mjs
- apps/web — danme
- Modelo de contenido — danme
- ADR-000 · ‹Título de la decisión›
- ADR-001 · Adopción del arnés SDD Anchored + perfil de arquitectura
- ADR-002 · Adopción del especialista `experto-ux-ui`
- ADR-003 · De un único administrador a N administradores (mismo rol)
- Bitácora del arnés — danme
- app/layout.tsx
- mutate
- experto-ux-ui.md
- Deploy / infra — danme
- PLAN-001 · Landing pública base (responsive)
- implementador.md
- orquestador.md
- TASKS-NNN · ‹Nombre›
- ProductForm.feedback.test.tsx
- arquitecto.md
- autor-de-spec.md
- .claude/agents/ — binding de Claude Code
- CLAUDE.md
- revisor.md
- web/AGENTS.md
- postcss.config.mjs
- AdminWriteFeedback.test.tsx
- explorador.md
- 2026-10-14-eliminar-producto.md
- specs/README.md
- README.md
- mutate.ts
- DeleteProductButton.test.tsx

## God Nodes (most connected - your core abstractions)
1. `vitest` - 32 edges
2. `mutate()` - 26 edges
3. `problemResponse()` - 25 edges
4. `@prisma/client` - 24 edges
5. `setFlash()` - 23 edges
6. `next` - 19 edges
7. `Tareas` - 19 edges
8. `hashPassword()` - 17 edges
9. `prisma` - 17 edges
10. `Notice()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Estado del backlog` --references--> `ImageUploadField()`  [INFERRED]
  .harness/memory/state.md → apps/web/components/admin/ImageUploadField.tsx
- `Implementación de RF-125 / RF-127 (diálogo + aviso)` --references--> `setFlash()`  [INFERRED]
  .harness/specs/002-panel-admin/plan.md → apps/web/lib/admin/flash.ts
- `Auth del panel admin (SPEC-002, ADR-003)` --references--> `getSessionAdmin()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/lib/services/auth.service.ts
- `3. Modelo de datos` --references--> `hashPassword()`  [INFERRED]
  .harness/specs/002-panel-admin/plan.md → apps/web/lib/services/auth.service.ts
- `Servicio — casos de uso (`apps/web/lib/services/`)` --references--> `getCatalog()`  [INFERRED]
  .harness/specs/001-landing-base/plan.md → apps/web/lib/services/content.service.ts

## Import Cycles
- None detected.

## Communities (55 total, 9 thin omitted)

### Community 0 - "flash.ts"
Cohesion: 0.19
Nodes (17): FlashNotice(), onFlash(), Notice(), STYLES, consumeFlash(), FLASH_EVENT, NoticeVariant, readUpload() (+9 more)

### Community 1 - "vitest"
Cohesion: 0.09
Nodes (44): PATCH(), GET(), POST(), create(), findAll(), findByEmail(), findById(), updateById() (+36 more)

### Community 2 - "@prisma/client"
Cohesion: 0.07
Nodes (43): dynamic, LandingPage(), About(), Catalog(), Contact(), Footer(), Hero(), ProductCard() (+35 more)

### Community 3 - "problemResponse"
Cohesion: 0.06
Nodes (41): EditProductPage(), POST(), POST(), DELETE(), POST(), DELETE(), PATCH(), POST() (+33 more)

### Community 4 - "Método del arnés — `.harness/`"
Cohesion: 0.07
Nodes (27): §0 · Qué es esto, §10 · Eficiencia de tokens (obligatorio), §11 · Procedencia, §1 · Génesis del proyecto, §2 · Rúbrica de decisión (Fase 0) — ¿entra al arnés?, §3 · Flujo de 5 fases (carril SDD), §4 · EARS — sintaxis de los criterios de aceptación, §5 · Reglas transversales (+19 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (41): eslintConfig, allowScripts, esbuild@0.28.2, prisma@7.10.0, @prisma/engines@7.10.0, unrs-resolver@1.12.2, dependencies, next (+33 more)

### Community 6 - "PLAN-002 · Panel de administración (auth + CRUD de contenido)"
Cohesion: 0.10
Nodes (19): 0. Gates de simplicidad, 10. Enmienda 2026-10-14 (b) — eliminar producto y pantalla siempre al día, 1. Cumplimiento constitucional, 2. Arquitectura de la feature (patrón por capas), 3. Modelo de datos, 4. Contratos, 6. Secuenciación de archivos, 7. Seguimiento de complejidad (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, dotenv, eslint, eslint-config-next, jsdom, prisma, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Constitución — danme"
Cohesion: 0.12
Nodes (16): seed(), Artículo 10 · Regla de raíz (prohibido el parche), Artículo 11 · Mapa de documentación del proyecto, Artículo 12 · Anti-hipersistema, Artículo 1 · Arquitectura, Artículo 2 · Perfil de arquitectura *(definido en la Génesis — ADR-001)*, Artículo 3 · Testing, Artículo 4 · Persistencia (+8 more)

### Community 10 - "Tareas"
Cohesion: 0.12
Nodes (16): Cobertura (el gate exige 100 %; `Estado` lo rellena el gate), Documentación, Infra y datos, Modelo de datos, `proxy.ts` — protección de rutas, Reglas, Rutas API — auth, Rutas API — productos (+8 more)

### Community 11 - "PLAN-NNN · ‹Nombre›"
Cohesion: 0.12
Nodes (16): 0. Gates de simplicidad, 1. Cumplimiento constitucional, 2. Arquitectura de la feature  *(según el patrón elegido)*, 3. Modelo de datos, 4. Contratos, 5. Estrategia de pruebas (por zona del patrón), 6. Secuenciación de archivos, 7. Seguimiento de complejidad  *(opcional)* (+8 more)

### Community 12 - "DanMe — Tienda de Productos Naturales"
Cohesion: 0.15
Nodes (12): Arquitectura, Cuentas Admin (Importante ⚠️), DanMe — Tienda de Productos Naturales, Decisiones Tomadas (Vigentes), Estado de Features, Flujo SDD, Hazards Conocidos, Próximos Pasos (+4 more)

### Community 13 - "SPEC-001 · Landing pública base (responsive)"
Cohesion: 0.15
Nodes (12): 1. Contexto del dominio, 2. Alcance, 3. Modelo de datos y contratos de E/S, 4. Criterios de aceptación (EARS), 5. Casos límite y manejo de errores, 5b. Paleta de marca DanMe (tokens de diseño), 6. Registro de decisiones y descartes, 7. Requisitos no funcionales (RNF) (+4 more)

### Community 14 - "SPEC-002 · Panel de administración (auth + CRUD de contenido)"
Cohesion: 0.17
Nodes (11): 1. Contexto del dominio, 2. Alcance, 3. Modelo de datos y contratos de E/S, 4. Criterios de aceptación (EARS), 5. Casos límite y manejo de errores, 6. Registro de decisiones y descartes, 7. Requisitos no funcionales (RNF), En alcance (+3 more)

### Community 15 - "SPEC-NNN · ‹Nombre de la funcionalidad›"
Cohesion: 0.17
Nodes (11): 1. Contexto del dominio, 2. Alcance, 3. Modelo de datos y contratos de E/S  ← INVENTARIO DE FRONTERAS, 4. Criterios de aceptación (EARS), 5. Casos límite y manejo de errores, 6. Registro de decisiones y descartes, 7. Requisitos no funcionales (RNF)  *(opcional)*, En alcance (+3 more)

### Community 16 - "Arquitectura — danme"
Cohesion: 0.18
Nodes (10): Arquitectura — danme, Auth del panel admin (SPEC-002, ADR-003), Capas, Despliegue, Features y su estado, Imágenes subidas (SPEC-002 RF-109..RF-113, RF-124, RNF-101), Prisma 7 — driver adapters, `proxy.ts` (no `middleware.ts`) (+2 more)

### Community 17 - "check.sh"
Cohesion: 0.36
Nodes (9): budget(), err(), fm_value(), ok(), sec(), check.sh script, skip(), touched() (+1 more)

### Community 18 - "AdminSidebar.tsx"
Cohesion: 0.29
Nodes (5): dynamic, ProtectedAdminLayout(), AdminSidebar(), NAV_ITEMS, LogoutButton()

### Community 19 - "products/page.tsx"
Cohesion: 0.16
Nodes (16): AdminProductsPage(), AdminUsersPage(), AdminButton(), AdminButtonProps, Element, Variant, variantStyles, AdminTable() (+8 more)

### Community 20 - "next"
Cohesion: 0.16
Nodes (9): LoginPage(), AdminSettingsPage(), ImageUploadField(), SettingsForm(), handleSubmit(), Flash, nextConfig, next (+1 more)

### Community 21 - "Estado del arnés — danme"
Cohesion: 0.22
Nodes (8): [2026-09-20] "Cero al llegar" antes de repartir culpas de infra, [2026-10-14] Toda acción del panel debe decir qué pasó, ⚠️ Correcciones del usuario (leer SIEMPRE — no borrar), Decisiones tomadas (histórico, sigue vigente), Estado del arnés — danme, Estado del backlog, Hazards / aprendizajes técnicos, Próximo paso concreto

### Community 22 - "AGENTS.md — mapa de danme"
Cohesion: 0.25
Nodes (7): AGENTS.md — mapa de danme, Antes de empezar (en orden), Bindings de herramienta, Convenciones, Mapa de documentación (producto), Qué es el sistema, Servicios / módulos y comandos

### Community 23 - "delete-product.mjs"
Cohesion: 0.25
Nodes (5): dlg, landing, log(), reqs, row

### Community 24 - "apps/web — danme"
Cohesion: 0.29
Nodes (6): apps/web — danme, Comandos, Notas de Prisma 7, Setup local, Tests de base de datos (`npm run test:db`), Variables de entorno

### Community 25 - "Modelo de contenido — danme"
Cohesion: 0.29
Nodes (6): `AdminUser` — cuentas del panel (SPEC-002, ADR-003), Imágenes subidas (`Product.imageUrl`, `SiteSettings.logoUrl`), Modelo de contenido — danme, `Product` — cada sabor de chicharrón, Seed, `SiteSettings` — configuración global (singleton, fila `id: "default"`)

### Community 26 - "ADR-000 · ‹Título de la decisión›"
Cohesion: 0.29
Nodes (6): ADR-000 · ‹Título de la decisión›, Consecuencias, Contexto y planteamiento del problema, Decisión, Enlaces, Opciones consideradas

### Community 27 - "ADR-001 · Adopción del arnés SDD Anchored + perfil de arquitectura"
Cohesion: 0.29
Nodes (6): ADR-001 · Adopción del arnés SDD Anchored + perfil de arquitectura, Consecuencias, Contexto y planteamiento del problema, Decisión, Enlaces, Opciones consideradas

### Community 28 - "ADR-002 · Adopción del especialista `experto-ux-ui`"
Cohesion: 0.29
Nodes (6): ADR-002 · Adopción del especialista `experto-ux-ui`, Consecuencias, Contexto y planteamiento del problema, Decisión, Enlaces, Opciones consideradas

### Community 29 - "ADR-003 · De un único administrador a N administradores (mismo rol)"
Cohesion: 0.29
Nodes (6): ADR-003 · De un único administrador a N administradores (mismo rol), Consecuencias, Contexto y planteamiento del problema, Decisión, Enlaces, Opciones consideradas

### Community 30 - "Bitácora del arnés — danme"
Cohesion: 0.29
Nodes (6): [2026-09-20] Génesis del arnés — hecho, [2026-09-20] SPEC-001 Landing pública base — implemented, [2026-09-20] SPEC-002 Panel de administración — implemented, [2026-10-14] SPEC-002 enmienda — avisos de escritura + subida de imágenes — implemented, [2026-10-14] SPEC-002 enmienda (b) — eliminar producto con confirmación + refresco — implemented, Bitácora del arnés — danme

### Community 31 - "app/layout.tsx"
Cohesion: 0.33
Nodes (3): geistMono, geistSans, metadata

### Community 32 - "mutate"
Cohesion: 0.23
Nodes (15): AccountPage(), handleSubmit(), NewProductPage(), NewAdminUserPage(), handleSubmit(), confirm(), ProductAvailabilityToggle(), toggle() (+7 more)

### Community 33 - "experto-ux-ui.md"
Cohesion: 0.33
Nodes (5): Arranque, Cuándo intervienes, Entrega, Estándar que aplicas (checklist), Reglas duras

### Community 34 - "Deploy / infra — danme"
Cohesion: 0.33
Nodes (5): Contenedores, Coordinación con Caddy (`cjhirashi-srv`), Deploy / infra — danme, Desarrollo local, Variables de entorno (producción)

### Community 35 - "PLAN-001 · Landing pública base (responsive)"
Cohesion: 0.12
Nodes (15): 0. Gates de simplicidad, 1. Cumplimiento constitucional, 2. Arquitectura de la feature (patrón por capas), 3. Modelo de datos, 4. Contratos, 7. Seguimiento de complejidad, 8. Impacto en documentación (Art. 11 — obligatorio), Despliegue / coordinación con Caddy (fuera de esta feature, pero condiciona `docker-compose.yml`) (+7 more)

### Community 36 - "implementador.md"
Cohesion: 0.40
Nodes (4): Arranque, Directiva de Pausa (`method.md §5`), Por cada tarea, Reglas duras

### Community 37 - "orquestador.md"
Cohesion: 0.40
Nodes (4): Arranque (en orden), Ciclo, Cierre de sesión, Reglas duras

### Community 38 - "TASKS-NNN · ‹Nombre›"
Cohesion: 0.40
Nodes (4): Cobertura (el gate exige 100 %; `Estado` lo rellena el gate), Reglas, Tareas, TASKS-NNN · ‹Nombre›

### Community 39 - "ProductForm.feedback.test.tsx"
Cohesion: 0.22
Nodes (6): fetchMock, json(), problem(), product, push, refresh

### Community 40 - "arquitecto.md"
Cohesion: 0.50
Nodes (3): Arranque, Produces `plan.md` (plantilla: `.harness/specs/_template/plan.md`), Reglas duras

### Community 41 - "autor-de-spec.md"
Cohesion: 0.50
Nodes (3): Arranque, El bucle (hasta converger), Reglas duras

### Community 42 - ".claude/agents/ — binding de Claude Code"
Cohesion: 0.50
Nodes (3): .claude/agents/ — binding de Claude Code, Conjunto base (mapea 1:1 a `method.md §8`), Especialistas de dominio (opcionales, por proyecto)

### Community 43 - "CLAUDE.md"
Cohesion: 0.40
Nodes (3): Diagramas: Archify + Diagram Design, graphify, Reglas duras (no negociables, aplican SIEMPRE — también a "arregla esto"/"corrige X")

### Community 47 - "AdminWriteFeedback.test.tsx"
Cohesion: 0.25
Nodes (6): fetchMock, json(), problem(), push, refresh, settings

### Community 53 - "mutate.ts"
Cohesion: 0.33
Nodes (4): MutateResult, NETWORK_ERROR, RFC-9457, fetchMock

## Knowledge Gaps
- **13 isolated node(s):** `RFC-9457`, `RFC-9457`, `jsdom`, `react-dom`, `tailwindcss` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 419 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `vitest`, `problemResponse`, `package.json`, `ProductForm.feedback.test.tsx`, `AdminWriteFeedback.test.tsx`, `next`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mutate()` (e.g. with `Implementación de RF-121 / RF-122 (mensaje siempre, con motivo)` and `Secuenciación (tests antes que código)`) actually correct?**
  _`mutate()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RFC-9457`, `RFC-9457`, `jsdom` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.08821548821548822 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `problemResponse` to `flash.ts`, `vitest`, `@prisma/client`, `package.json`, `ProductForm.feedback.test.tsx`, `AdminWriteFeedback.test.tsx`, `AdminSidebar.tsx`, `next`, `mutate.ts`, `DeleteProductButton.test.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `setFlash()` (e.g. with `Implementación de RF-123 (aviso persistente tras guardar producto)` and `Implementación de RF-125 / RF-127 (diálogo + aviso)`) actually correct?**
  _`setFlash()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `@prisma/client` be split into smaller, more focused modules?**
  _Cohesion score 0.07139079851930195 - nodes in this community are weakly interconnected._