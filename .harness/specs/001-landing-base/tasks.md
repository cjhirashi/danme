---
id: TASKS-001
tipo: tasks
feature: 001-landing-base
estado: implemented
actualizado: 2026-09-20
---

# TASKS-001 · Landing pública base (responsive)

## Reglas
- Cada tarea: ≤ 30 min, un solo propósito, `(cubre RF-NNN)`, zona del patrón (o `[doc]`).
- Orden por dependencias. **Test antes que código.**
- Cada fila de `plan.md §8` (Impacto en documentación) → una tarea `[doc]`.

## Tareas

### Scaffold
- [x] T-001 — Inicializar proyecto Next.js (App Router + TypeScript) en `apps/web/` [zona: scaffold]
- [x] T-002 — Test: `app/globals.css` expone los tokens de color DanMe (bloque @theme) con los hex de SPEC-001 §5b (cubre RF-005) [zona: test]
- [x] T-003 — Implementar el bloque @theme en `app/globals.css` con los tokens de la paleta DanMe (cubre RF-005) [zona: scaffold]
- [x] T-004 — Crear `docker-compose.yml` (Postgres dev + servicio web `danme-web` en puerto 3000; ver plan.md §2 Despliegue/Caddy) [zona: infra]
- [x] T-005 — Crear `.env.example` (`DATABASE_URL`, etc.) [zona: infra]

### Modelo de datos
- [x] T-006 — Escribir `schema.prisma` (`Product`, `SiteSettings`) (cubre RF-002, RF-003, RF-004, RF-006, RF-007, RF-008) [zona: modelo]
- [x] T-007 — Generar migración inicial `0001_init` (cubre RF-002, RF-003, RF-004) [zona: modelo]
- [x] T-008 — Escribir `seed.ts` con datos mockup (2 productos + `SiteSettings` con WhatsApp/tagline reales) (cubre RF-002, RF-003, RF-004) [zona: modelo]

### Servicios (`lib/services/content.service.ts`)
- [x] T-009 — Test unit: `getCatalog` filtra productos con `available=false` (cubre RF-007) [zona: test]
- [x] T-010 — Implementar `getCatalog` (cubre RF-002, RF-007) [zona: servicio]
- [x] T-011 — Test unit: `buildWhatsAppLink` arma URL `wa.me` con mensaje codificado (cubre RF-003) [zona: test]
- [x] T-012 — Implementar `buildWhatsAppLink` (cubre RF-003) [zona: servicio]
- [x] T-013 — Test unit: `formatPrice` formatea `priceCents` a MXN (cubre RF-002) [zona: test]
- [x] T-014 — Implementar `formatPrice` (cubre RF-002) [zona: servicio]
- [x] T-015 — Test unit: `getSiteSettings` (servicio) devuelve datos de `SiteSettings` (cubre RF-004) [zona: test]
- [x] T-016 — Implementar `getSiteSettings` (servicio) (cubre RF-004) [zona: servicio]

### Repositorio (`lib/db/`)
- [x] T-017 — Test: `products.repository.findAvailableProducts` contra Postgres de test (cubre RF-002, RF-007) [zona: test]
- [x] T-018 — Implementar `prisma.ts` (cliente singleton) + `products.repository.findAvailableProducts` (cubre RF-002) [zona: repositorio]
- [x] T-019 — Test: `site-settings.repository.getSiteSettings` contra Postgres de test (cubre RF-004) [zona: test]
- [x] T-020 — Implementar `site-settings.repository.getSiteSettings` (cubre RF-004) [zona: repositorio]
- [x] T-021 — Test: arranque falla explícito si `SiteSettings` no está sembrado (cubre RF-008) [zona: test]
- [x] T-022 — Implementar guard de arranque para RF-008 [zona: repositorio]

### Componentes (`components/landing/`)
- [x] T-023 — Test: `ProductCard` muestra placeholder si `imageUrl` es `null` (cubre RF-006) [zona: test]
- [x] T-024 — Implementar `ProductCard` (incluye sellos NOM-051) (cubre RF-002, RF-006) [zona: componente]
- [x] T-025 — Test: `Catalog` muestra estado vacío si no hay productos disponibles (cubre RF-009) [zona: test]
- [x] T-026 — Implementar `Catalog` (cubre RF-002, RF-007, RF-009) [zona: componente]
- [x] T-027 — Implementar `Hero` (cubre RF-001, RF-005) [zona: componente]
- [x] T-028 — Implementar `About` (cubre RF-001) [zona: componente]
- [x] T-029 — Implementar `Contact` (botón WhatsApp + enlaces de redes) (cubre RF-003, RF-004) [zona: componente]
- [x] T-030 — Implementar `Footer` (enlaces de redes) (cubre RF-004) [zona: componente]

### Página y SEO
- [x] T-031 — Implementar `app/(public)/page.tsx` orquestando las 5 secciones (cubre RF-001) [zona: ruta]
- [x] T-032 — Añadir metadatos SEO (title/description/Open Graph) por página (cubre RNF-002) [zona: ruta]

### Verificación
- [x] T-033 — Verificación manual responsive en mobile/tablet/desktop, evidencia de terminal/captura pegada (cubre RF-001, RNF-001) [zona: verificación]

### Documentación
- [x] T-034 — Crear `docs/ARCHITECTURE.md` [doc]
- [x] T-035 — Crear `docs/CONTENT-MODEL.md` [doc]
- [x] T-036 — Crear `apps/web/README.md` [doc]
- [x] T-037 — Crear `docs/DEPLOYMENT.md` (incluye coordinación con Caddy/`caddy.json`) [doc]

## Cobertura (el gate exige 100 %; `Estado` lo rellena el gate)
| RF / doc | Tareas | Test(s) | Estado |
|---|---|---|---|
| RF-001 | T-027, T-028, T-031, T-033 | verificación manual (T-033) | Pass |
| RF-002 | T-006, T-008, T-010, T-014, T-018, T-024, T-026 | T-009, T-017 | Pass |
| RF-003 | T-006, T-008, T-012, T-016, T-029 | T-011 | Pass |
| RF-004 | T-006, T-008, T-016, T-020, T-029, T-030 | T-015, T-019 | Pass |
| RF-005 | T-003, T-027 | T-002 | Pass |
| RF-006 | T-023, T-024 | T-023 | Pass |
| RF-007 | T-009, T-010, T-017, T-018, T-025, T-026 | T-009, T-017 | Pass |
| RF-008 | T-021, T-022 | T-021 | Pass |
| RF-009 | T-025, T-026 | T-025 | Pass |
| RNF-001 | T-033 | verificación manual | Pass |
| RNF-002 | T-032 | revisión manual | Pass |
| doc: architecture | T-034 | — | Pass |
| doc: content-model | T-035 | — | Pass |
| doc: readme | T-036 | — | Pass |
| doc: deployment | T-037 | — | Pass |

> Esta tabla **es** la trazabilidad de la feature (no hay `traceability-matrix.md`).
> Fila sin test, en `Fail` o `Pendiente` → el gate no abre.
