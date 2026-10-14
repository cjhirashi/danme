---
tipo: memoria
subtipo: history
---

# Bitácora del arnés — danme

> Append-only, orden cronológico inverso (lo más reciente arriba). Una entrada
> Session-End por sesión, con el formato fijo de `method.md §10`.

## [2026-10-14] SPEC-002 enmienda (b) — eliminar producto con confirmación + refresco — implemented
- **Fase alcanzada:** implement (T-079..T-087; RF-125..RF-128 con test y Pass) + deploy a producción
- **Rebotes del verificador:** 1. El DELETE enmascaraba cualquier excepción como 404; faltaba versionar el e2e; faltaba la trampa de foco. Corregido en T-087 con los tests en rojo primero.
- **Directiva de Pausa:** no
- **Drift / re-anchor:** no
- **Anclas movidas:** SPEC-002 `anchor_commit` → `48f0eac5bed2c1519399e2a595cf7815c2bb664b`
- **Gate:** rojo (20 ok · 0 warn · 1 error). El único fallo es `theme-tokens.test.ts`, del rediseño visual, fuera de alcance por decisión del usuario.
- **Docs actualizadas:** `docs/ARCHITECTURE.md`, `docs/CONTENT-MODEL.md`
- **Decisiones de diseño / límites de integración:**
  - "Eliminar" en la UI pasa a ser borrado físico definitivo; "Desactivar" sigue siendo reversible.
  - Se borra primero la fila y después el archivo. Si `rm` falla, queda un archivo huérfano registrado y la respuesta es 204.
  - Diálogo propio con el nombre del producto; Escape, clic en el fondo y Cancelar no envían nada.
  - RF-128 no se reprodujo en el build actual: se cubrió con aserciones de `refresh` y con e2e. La lentitud que se veía era probablemente la versión de producción anterior.
  - Evidencia e2e en `.harness/memory/evidence/2026-10-14-eliminar-producto.md`.
- **Próximo paso:** que el usuario confirme en producción eliminando un producto de prueba.

## [2026-10-14] SPEC-002 enmienda — avisos de escritura + subida de imágenes — implemented
- **Fase alcanzada:** implement (T-062..T-078; RF-121..RF-124 con test y Pass)
- **Rebotes del verificador:** 2 (1: `account/page.tsx` con fetch crudo, `saved.data.id`
  sin guardia, `readUpload` sin `realpath`, `deleteUpload` sin `path.sep` → T-077/T-078;
  2: 10 tests de ProductForm rotos por el rediseño `90041da` → selectores actualizados)
- **Directiva de Pausa:** no
- **Drift / re-anchor:** sí — los cambios de la enmienda quedaron commiteados por la
  sesión de rediseño dentro de `df9ab11` (mensaje "fix: add native CSS animations…").
- **Anclas movidas:** SPEC-002 `anchor_commit` → `0fb16f8b71ad1b1edf5ad15b26d358e7f28586c2`
- **Gate:** rojo (20 ok · 0 warn · 1 error) — único fallo `theme-tokens.test.ts` por el
  oklch con `°` de `8cb5e02` (rediseño visual, fuera de alcance por decisión del usuario)
- **Docs actualizadas:** `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`
- **Decisiones de diseño / límites de integración:** causa raíz triple — volumen
  `danme-uploads` con dueño root (EACCES), cliente que ignoraba la respuesta, y Next en
  producción indexando `public/` solo al arrancar (404 de lo subido) → `Dockerfile`
  crea `public/uploads` con dueño `nextjs`, wrapper `lib/admin/mutate.ts`, aviso flash
  por `sessionStorage` (no query string: un enlace podría falsear avisos), route handler
  `app/uploads/[...path]`. Verificado e2e en contenedor de prueba + danme_test.
- **Próximo paso:** con permiso del usuario, `chown -R 1001:1001` del volumen
  `danme-uploads` en producción y redeploy; verificar 0 EACCES y una subida real.

## [2026-09-20] SPEC-002 Panel de administración — implemented
- **Fase alcanzada:** implement (TASKS-002: 61/61 tareas, 20 RF con test y Pass)
- **Rebotes del verificador:** 0 (self-implementado; pendiente `verified` humano)
- **Directiva de Pausa:** no
- **Drift / re-anchor:** sí — `anchor_commit` de SPEC-002 apunta al cierre de
  Feature 001 (`d8c298a`); se resuelve al commitear esta feature y mover el ancla.
- **Anclas movidas:** ninguna todavía (pendiente commit)
- **Gate:** verde (`--full`: 20 ok · 1 warn [drift esperado, ver arriba] · 0 error)
- **Docs actualizadas:** `docs/CONTENT-MODEL.md`, `docs/ARCHITECTURE.md`,
  `docs/DEPLOYMENT.md`, `apps/web/README.md`
- **Decisiones de diseño / límites de integración:**
  **ADR-003** — de 1 admin a N admins mismo rol (sin RBAC), enmienda Constitución
  Art. 5, a petición del usuario (Carlos + Daniel, propietario del negocio).
  Resguardo anti-bloqueo del último admin **propuesto y rechazado explícitamente**
  por el usuario. Auth casera con `node:crypto` (scrypt + HMAC) — cero
  dependencias nuevas. Sesión stateless (sin tabla `Session`, revocación vía
  `AdminUser.active`). `proxy.ts` (Next.js 16 renombró `middleware.ts`, runtime
  Node.js por defecto) protege `/admin/**` y `/api/admin/**`. Imágenes: subida a
  disco local, volumen Docker `danme-uploads`. Verificado end-to-end manualmente
  (login, lockout, CRUD producto+imagen, settings, usuarios, logout) con capturas
  reales del panel.
- **Próximo paso:** commit (pendiente aprobación del usuario) → deploy en el
  servidor real → avisar cambio de password temporal a Carlos y Daniel.

## [2026-09-20] SPEC-001 Landing pública base — implemented
- **Fase alcanzada:** implement (TASKS-001: 37/37 tareas, 9 RF con test y Pass)
- **Rebotes del verificador:** 0 (self-implementado en una sesión; sin verificador adversarial separado — pendiente `verified` humano)
- **Directiva de Pausa:** no
- **Drift / re-anchor:** no (sin commits nuevos todavía — `anchor_commit` sigue en la Génesis, pendiente moverlo al commit de cierre)
- **Anclas movidas:** SPEC-001 `anchor_commit` → `f758dcb50fdd2918b7bc292f76bbd0b9fbabf22b`
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
