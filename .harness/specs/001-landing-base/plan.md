---
id: PLAN-001
tipo: plan
feature: 001-landing-base
estado: implemented
aprobaciones:
  fase_2: { por: "Carlos", fecha: 2026-09-20 }
actualizado: 2026-09-20
---

# PLAN-001 · Landing pública base (responsive)

> Traduce SPEC-001 al patrón por capas fijado en la Constitución (Art. 1–2). Esta
> feature también hace de **scaffolding**: `apps/web/` no existe todavía.

## 0. Gates de simplicidad

- [x] Simplicity — solución más simple: Server Components leyendo Prisma directo,
      sin capa REST intermedia (no hay consumidor externo que la necesite).
- [x] Anti-Abstraction — sin repositorio genérico ni capa de "content provider"
      especulativa; una función por consulta real usada.
- [x] Integration-First — el contrato del modelo de datos (`schema.prisma`) se fija
      antes que los componentes de UI que lo consumen.

## 1. Cumplimiento constitucional

| Artículo | Cómo lo respeta este plan |
|---|---|
| Art. 1–2 (patrón) | `app/` (rutas) → `lib/services/` (casos de uso) → `lib/db/` (Prisma/Postgres). Lógica de negocio (filtrar disponibles, armar link de WhatsApp) vive en `lib/services/`, nunca en componentes. |
| Art. 3 (testing) | vitest + Testing Library. Cobertura por zona: servicios (unit), repositorio (contra Postgres de test), componentes (render + a11y básica). |
| Art. 1 (despliegue) | Contenedor Docker self-host. El acceso externo (reverse proxy) lo gestiona **Caddy desde otro sistema**, no esta feature — este plan solo nombra el contenedor/puerto de forma predecible y se coordina vía `caddy.json` en la raíz del repo (ver §2 Despliegue). |
| Art. 4 (persistencia) | Prisma + Postgres. `docker-compose.yml` con Postgres de dev. Migración inicial versionada + `seed.ts` con datos mockup (§3 de SPEC-001). |
| Art. 5 (seguridad) | Sin rutas `/api/**` en esta feature → sin superficie de auth que cubrir aquí. Se deja documentado en SPEC-001 §2 que Feature 002 debe traer auth de admin único. |
| Art. 6 (contratos) | Sin frontera REST/MCP en esta feature — se declara explícito, no se crea `contracts/`. |
| Art. 12 (anti-hipersistema) | 3 archivos de esta feature (`spec.md`, `plan.md`, `tasks.md`), sin artefactos extra. |

## 2. Arquitectura de la feature (patrón por capas)

### Modelo (`apps/web/prisma/schema.prisma`)
- `Product` y `SiteSettings` — ver SPEC-001 §3 para campos exactos.
- Migración inicial: `apps/web/prisma/migrations/0001_init/`.

### Repositorio (`apps/web/lib/db/`)
- `prisma.ts` — cliente Prisma singleton (evita agotar conexiones en dev/hot-reload).
- `products.repository.ts` — `findAvailableProducts(): Promise<Product[]>`.
- `site-settings.repository.ts` — `getSiteSettings(): Promise<SiteSettings>`.

### Servicio — casos de uso (`apps/web/lib/services/`)
- `content.service.ts`:
  - `getCatalog()` ← implementa RF-002, RF-007 (filtra `available`).
  - `getSiteSettings()` ← implementa RF-003, RF-004.
  - `buildWhatsAppLink(phone: string, message: string): string` ← implementa RF-003
    (formato `https://wa.me/<E.164>?text=<encoded>`).
  - `formatPrice(cents: number): string` ← formatea `priceCents` a MXN.

### Fronteras de entrada — UI (`apps/web/app/(public)/` y `apps/web/components/landing/`)
| Componente | Para qué | RF |
|---|---|---|
| `app/(public)/page.tsx` | Server Component, orquesta secciones, llama a `content.service` | RF-001 |
| `components/landing/Hero.tsx` | Sección hero (marca, tagline) | RF-001, RF-005 |
| `components/landing/Catalog.tsx` | Grid de productos + estado vacío | RF-002, RF-006, RF-007, RF-009 |
| `components/landing/ProductCard.tsx` | Ficha de producto + sellos NOM-051 + placeholder de imagen | RF-002, RF-006 |
| `components/landing/About.tsx` | Sección "Sobre DanMe" | RF-001 |
| `components/landing/Contact.tsx` | Botón WhatsApp + redes | RF-003, RF-004 |
| `components/landing/Footer.tsx` | Enlaces redes, marca | RF-004 |

### Fronteras de salida
Ninguna — sin llamadas a servicios externos en esta feature (Art. 5).

### Theming
- Next.js 16 scaffold usa **Tailwind v4** (config CSS-first, sin `tailwind.config.ts`
  por defecto). Los tokens de la paleta DanMe (SPEC-001 §5b) se declaran en
  `apps/web/app/globals.css` dentro de un bloque `@theme`, ninguno hardcodeado en
  componentes. *(Ajuste respecto al plan original, que asumía Tailwind v3
  `tailwind.config.ts` — detalle de herramienta, no cambia RF-005 ni su criterio.)*

### Despliegue / coordinación con Caddy (fuera de esta feature, pero condiciona `docker-compose.yml`)
- El reverse proxy (Caddy) y el acceso externo al contenedor **no los implementa
  esta feature** — los gestiona un sistema externo.
- Ese sistema externo crea/gestiona `caddy.json` en la **raíz del repo** (fuera de
  `apps/web/`, fuera de `.harness/`). Cuando exista, este proyecto debe declarar ahí:
  nombre del contenedor del servicio web y puerto interno expuesto.
- El sistema externo indicará **qué red Docker** debe usar `apps/web` para ser
  alcanzable por Caddy — `docker-compose.yml` debe unir el servicio `web` a esa red
  externa (`external: true`), además de su red interna con Postgres.
- Mientras `caddy.json` no exista: `docker-compose.yml` nombra el contenedor de forma
  predecible (`danme-web`) y expone el puerto `3000`, sin asumir una red externa
  todavía — se ajusta en cuanto el otro sistema la indique (no bloquea esta feature).
- `docs/DEPLOYMENT.md` (§8) documenta este punto de coordinación explícitamente.

## 3. Modelo de datos

- `schema.prisma`: `Product` (id, name, flavorSlug, description, priceCents,
  presentation, imageUrl?, available, nomExcesoCalorias, nomExcesoSodio),
  `SiteSettings` (id fijo/singleton, brandName, tagline, whatsappNumber,
  instagramUrl?, facebookUrl?, logoUrl?).
- Orden de migración: una sola migración inicial (`0001_init`) — ambas tablas se
  crean juntas, no hay dependencia entre ellas.
- `seed.ts`: 1 fila `SiteSettings` (WhatsApp `722 649 9807`, tagline real de marca) +
  2 filas `Product` (habanero, serrano) con precio mockup ($150 MXN) — ver registro
  de decisiones SPEC-001 §6 (precio real se cargará desde el admin panel, Feature 002).

## 4. Contratos

Ninguno — declarado explícito en SPEC-001 §2 y Art. 6 (sin `/api/**` en esta
feature, sin consumidor externo).

## 5. Estrategia de pruebas (por zona del patrón)

| Zona | Qué se prueba | Herramienta |
|---|---|---|
| `lib/services/content.service.ts` | `getCatalog` filtra no-disponibles (RF-007); `buildWhatsAppLink` arma URL correcta con encoding (RF-003); `formatPrice` formatea MXN | vitest (unit) |
| `lib/db/*.repository.ts` | consultas devuelven forma esperada contra Postgres de test (docker-compose) | vitest + Postgres de test |
| `components/landing/*` | render sin crash, `ProductCard` muestra placeholder si `imageUrl` es `null` (RF-006), `Catalog` muestra estado vacío si no hay productos (RF-009), atributos de accesibilidad básicos (alt en imágenes, landmarks) | vitest + Testing Library |
| Responsive (RF-001, RNF-001) | verificación manual en 3 breakpoints con el navegador (`/verify` o similar) — no hay gate automático de CSS en esta fase | manual, documentado en evidencia de cierre |

## 6. Secuenciación de archivos

Tests antes que código, por capa (de adentro hacia afuera):
1. Scaffold del proyecto (`package.json`, `next.config`, `tsconfig`, `tailwind.config`,
   `docker-compose.yml`, `.env.example`) — sin lógica, sin test.
2. `schema.prisma` + migración inicial + `seed.ts`.
3. Tests de `lib/services/content.service.ts` (deben fallar) → implementación.
4. Tests de `lib/db/*.repository.ts` (deben fallar) → implementación.
5. Tests de componentes (`ProductCard`, `Catalog`) (deben fallar) → implementación.
6. `app/(public)/page.tsx` orquestando todo → verificación manual responsive.

## 7. Seguimiento de complejidad

| Excepción a la simplicidad | Justificación |
|---|---|
| Tailwind CSS (dependencia nueva) | Constitución exige "nada de dependencias nuevas sin justificación en plan.md" — Tailwind es estándar de facto para responsive utility-first en Next.js, evita CSS-in-JS o hojas de estilo manuales que serían más código para el mismo resultado (RF-001, RF-005). |

## 8. Impacto en documentación (Art. 11 — obligatorio)

| Documento | Ruta | Qué cambia | Tarea |
|---|---|---|---|
| Arquitectura del producto | `docs/ARCHITECTURE.md` | **Se crea** — estructura inicial de `apps/web/` (capas, carpetas) | `[doc]` T-arch |
| Modelo de contenido | `docs/CONTENT-MODEL.md` | **Se crea** — schema `Product`/`SiteSettings`, qué campos serán editables por el admin panel (Feature 002) | `[doc]` T-content-model |
| README del servicio web | `apps/web/README.md` | **Se crea** — comandos (`dev`, `build`, `test`), setup local, variables de entorno | `[doc]` T-readme |
| Deploy / infra | `docs/DEPLOYMENT.md` | **Se crea** — Dockerfile, `docker-compose.yml`, variables de entorno, puertos, y el punto de coordinación con el sistema externo de Caddy (`caddy.json`, nombre de contenedor, red) | `[doc]` T-deploy |
