---
id: SPEC-001
tipo: spec
feature: 001-landing-base
estado: implemented
# --- anclaje (fusionado; ver method.md §9) ---
anchor_commit: ce8aa73f40d4703e2e232e5402c6787a36a6a303
anchor_mode: advisory
covers:
  - apps/web/app/(public)/**
  - apps/web/app/globals.css
  - apps/web/app/layout.tsx
  - apps/web/components/landing/**
  - apps/web/lib/db/**
  - apps/web/lib/services/**
  - apps/web/prisma/**
  - apps/web/tests/**
  - apps/web/Dockerfile
  - apps/web/prisma.config.ts
  - docker-compose.yml
  - docs/ARCHITECTURE.md
  - docs/CONTENT-MODEL.md
  - docs/DEPLOYMENT.md
  - apps/web/README.md
# --- aprobaciones humanas ---
aprobaciones:
  fase_1: { por: "Carlos", fecha: 2026-09-20 }
  fase_2: { por: "Carlos", fecha: 2026-09-20 }
actualizado: 2026-09-20
---

# SPEC-001 · Landing pública base (responsive)

> Producida en Fase 1 por elicitación interactiva con el usuario (`method.md §3`).

## 1. Contexto del dominio

DanMe vende chicharrón de chile artesanal (100% caseros, sin conservadores, hecho en
México) en presentación de frasco de vidrio de 190g, actualmente en dos sabores
(habanero, serrano). El negocio no tiene tienda física ni venta en línea con
checkout: los pedidos se cierran por WhatsApp. Esta feature entrega una landing
pública responsive que presenta la marca y el catálogo, y sirve como base de
contenido que la Feature 002 (panel admin) hará editable sin cambiar el modelo.

Límites del sistema: aplicación Next.js (App Router) en `apps/web/`, Postgres vía
Prisma como única fuente de contenido (sin CMS externo). Sin dependencia de APIs de
terceros en esta fase (Constitución Art. 5).

## 2. Alcance

### En alcance
- Landing pública de una sola página con 5 secciones: Hero, Catálogo de productos,
  Sobre DanMe, Contacto, Footer.
- Diseño responsive en 3 breakpoints (mobile / tablet / desktop), sin scroll
  horizontal en ninguno.
- Paleta de marca DanMe aplicada de forma consistente (tokens §5, extraídos de
  material de marca real).
- Contenido servido desde Postgres/Prisma (`Product`, `SiteSettings`), poblado por
  seed con datos mockup — mismo modelo de datos que consumirá el panel admin
  (Feature 002) para hacerlo editable.
- Botón de contacto por WhatsApp (deep link con mensaje prellenado) y enlaces a
  Instagram/Facebook, todos leídos de `SiteSettings`.
- Sellos de advertencia NOM-051 (exceso calorías / exceso sodio) en cada ficha de
  producto.
- Metadatos SEO básicos por página (title, meta description, Open Graph) — buena
  práctica, sin criterio de aceptación formal (no bloquea el gate).

### Fuera de alcance
- Autenticación y panel de administración (UI de edición de contenido) — Feature 002.
  Cuando se implemente, **debe** tener autenticación de un único usuario admin
  (Constitución Art. 5) — esta spec no la implementa, solo dimensiona el modelo de
  datos para que Feature 002 lo consuma.
- Carrito de compra, checkout, pagos en línea — explícitamente descartado por el
  modelo de negocio (informativo + contacto, confirmado por el usuario).
- Ubicación física / mapa — el negocio no tiene tienda física.
- Rutas `/api/**` — no son necesarias: los Server Components de Next.js leen Prisma
  directamente (sin frontera REST que cubrir con contrato en esta feature).

## 3. Modelo de datos y contratos de E/S

Sin fronteras REST/MCP en esta feature (landing pública sin panel de edición
todavía) — la única frontera es de persistencia:

| Frontera | Dirección | Tipo | Contrato |
|---|---|---|---|
| `Product` | lectura | Prisma → Postgres | `apps/web/prisma/schema.prisma` |
| `SiteSettings` | lectura | Prisma → Postgres | `apps/web/prisma/schema.prisma` |

**`Product`**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `name` | string | p. ej. "Chicharrón de chile habanero" |
| `flavorSlug` | string | `habanero` \| `serrano` — extensible a futuros sabores |
| `description` | string | texto corto, editable a futuro |
| `priceCents` | int | mockup ahora; editable vía admin (Feature 002) |
| `presentation` | string | p. ej. "190g" |
| `imageUrl` | string \| null | `null` → placeholder visual (RF-006) |
| `available` | boolean | oculta/muestra en catálogo |
| `nomExcesoCalorias` | boolean | sello NOM-051 |
| `nomExcesoSodio` | boolean | sello NOM-051 |

**`SiteSettings`** (singleton — una sola fila)

| Campo | Tipo | Notas |
|---|---|---|
| `brandName` | string | "DanMe" |
| `tagline` | string | "Producto artesanal — by Daniel" |
| `whatsappNumber` | string | formato E.164, mockup ahora |
| `instagramUrl` | string \| null | mockup (`#`) si no se provee |
| `facebookUrl` | string \| null | mockup (`#`) si no se provee |
| `logoUrl` | string \| null | `null` → placeholder visual |

Sin sobre de error RFC 9457 en esta feature (no hay rutas `/api/**` públicas que lo
requieran — Art. 6).

## 4. Criterios de aceptación (EARS)

- **RF-001** — El sistema DEBE mostrar una landing responsive con las secciones
  Hero, Catálogo, Sobre DanMe, Contacto y Footer en los breakpoints mobile (<768px),
  tablet (768–1024px) y desktop (>1024px), sin scroll horizontal en ninguno.
- **RF-002** — El sistema DEBE renderizar el catálogo leyendo los productos
  sembrados en Postgres vía Prisma (nombre, sabor, precio, presentación,
  disponibilidad, imagen, sellos NOM-051).
- **RF-003** — CUANDO el usuario pulsa el botón de contacto, el sistema DEBE abrir
  WhatsApp (`wa.me`) con un mensaje prellenado, usando el número configurado en
  `SiteSettings`.
- **RF-004** — El sistema DEBE mostrar enlaces a Instagram y Facebook en el footer,
  leídos de `SiteSettings`.
- **RF-005** — El sistema DEBE aplicar los tokens de la paleta DanMe (§5) de forma
  consistente en toda la landing (fondo, acentos, texto).
- **RF-006** — SI `Product.imageUrl` o `SiteSettings.logoUrl` es `null` ENTONCES el
  sistema DEBE mostrar un placeholder visual sin romper el layout.
- **RF-007** — DONDE `Product.available` es `false`, el sistema NO DEBE mostrar ese
  producto en el catálogo.

## 5. Casos límite y manejo de errores

- **RF-008** — SI `SiteSettings` no tiene fila sembrada ENTONCES el sistema DEBE
  fallar el build/arranque de forma explícita (seed es prerequisito documentado, no
  un fallback silencioso en runtime) — evita violar Art. 10 (regla de raíz) con un
  parche de contenido vacío en producción.
- **RF-009** — SI el catálogo no tiene productos disponibles ENTONCES el sistema
  DEBE mostrar un estado vacío explícito en la sección Catálogo (no una sección
  rota o ausente).

## 5b. Paleta de marca DanMe (tokens de diseño)

Extraídos por muestreo de píxeles del material de marca real (frascos, logo,
etiquetas) provisto por el usuario — no inventados:

| Token | Hex | Uso |
|---|---|---|
| `--color-verde-danme` | `#416E51` | Color primario de marca (fondo etiqueta/logo) |
| `--color-verde-oscuro` | `#123322` | Secciones de contraste/hero oscuro |
| `--color-ambar` | `#FEBD59` | Acento — variante habanero |
| `--color-naranja-quemado` | `#DF6C2B` | Acento — variante serrano |
| `--color-crema` | `#E3C392` | Fondo cálido / tarjetas claras |
| `--color-negro` | `#000000` | Texto |
| `--color-blanco` | `#FFFFFF` | Texto sobre fondos oscuros |

## 6. Registro de decisiones y descartes

| Decisión | Justificación | Alternativa descartada | ADR |
|---|---|---|---|
| Landing primero, admin panel como Feature 002 | Permite ver resultado visible antes; ambas features comparten el mismo modelo de datos (`Product`, `SiteSettings`) | Panel admin primero | — |
| Modelo informativo + contacto (sin carrito) | Confirmado por el usuario: el negocio cierra pedidos por WhatsApp | Catálogo + pedido WhatsApp integrado · e-commerce completo (habría requerido ADR por Art. 5, pagos) | — |
| Contenido de marca (nombre, tagline, badges) tomado literal de imágenes reales del usuario; datos de instancia (precio, WhatsApp, redes) como seed mockup editable después | El usuario proporcionó material de marca real a mitad de la elicitación; precios/contactos se gestionarán desde el admin panel (Feature 002) | Placeholders genéricos para todo · esperar todo el contenido real antes de avanzar | — |
| Paleta de diseño extraída por muestreo de las imágenes de marca (no aproximada a ojo ni esperada indefinidamente) | Grounded en material real, evita re-trabajo de theming en Feature 002 | Paleta provisional inventada · posponer todo el theming | — |
| Sin rutas `/api/**` en esta feature | La landing pública solo lee (Server Components); Art. 6 solo exige contrato en fronteras con consumidor externo | Exponer endpoint REST desde ya | — |
| Sellos NOM-051 en la ficha de producto del sitio web | Confirmado por el usuario — transparencia/consistencia con el empaque físico | Omitirlos en el sitio (solo empaque) | — |
| Admin panel (Feature 002) DEBE tener autenticación de un único usuario | Confirmado por el usuario; ya mandatado por Constitución Art. 5 | — | ADR-001 |

## 7. Requisitos no funcionales (RNF)

- **RNF-001** — El layout DEBE ser responsive en mobile/tablet/desktop sin scroll
  horizontal (medible: 0 overflow-x en los 3 breakpoints de referencia).
- **RNF-002** — Las páginas DEBEN incluir metadatos SEO básicos (title, meta
  description, Open Graph) — verificación manual, sin gate automático en esta fase.

## Marcadores abiertos

*(ninguno — `[NEEDS CLARIFICATION] = 0`)*
