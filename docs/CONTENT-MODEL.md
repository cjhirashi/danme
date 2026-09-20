# Modelo de contenido — danme

> Se actualiza cuando cambia el schema de Prisma o qué campos son editables desde el
> panel admin (ver `.harness/constitution.md` Art. 11).

Fuente de verdad: `apps/web/prisma/schema.prisma`. Este documento es la lectura
orientada a negocio de ese schema — qué administra el sitio y qué administrará el
panel admin (Feature 002, futura).

## `Product` — cada sabor de chicharrón

| Campo | Tipo | Quién lo edita hoy | Notas |
|---|---|---|---|
| `name` | string | seed | Nombre visible, p. ej. "Chicharrón de chile habanero" |
| `flavorSlug` | string (único) | seed | Identificador estable del sabor |
| `description` | string | seed | Texto corto en la ficha de producto |
| `priceCents` | int | seed (**mockup**) | Precio en centavos MXN — Feature 002 lo hará editable |
| `presentation` | string | seed | p. ej. "190g" |
| `imageUrl` | string? | seed | `null` → la UI muestra placeholder ("Imagen pendiente") |
| `available` | boolean | seed | `false` → no aparece en el catálogo público |
| `nomExcesoCalorias` / `nomExcesoSodio` | boolean | seed | Sellos de advertencia NOM-051, se muestran en la ficha |

## `SiteSettings` — configuración global (singleton, fila `id: "default"`)

| Campo | Tipo | Quién lo edita hoy | Notas |
|---|---|---|---|
| `brandName` | string | seed | "DanMe" |
| `tagline` | string | seed | "Producto artesanal — by Daniel" |
| `whatsappNumber` | string | seed (**mockup**) | Usado para armar el link `wa.me` de contacto |
| `instagramUrl` / `facebookUrl` | string? | seed (**mockup**) | `null` → el enlace no se muestra |
| `logoUrl` | string? | seed | `null` → placeholder |

## Por qué "mockup" en algunos campos

`priceCents`, `whatsappNumber`, `instagramUrl` y `facebookUrl` se cargan hoy vía
`prisma/seed.ts` con valores reales de marca donde se tenían (WhatsApp, tagline) y
valores de ejemplo donde no (precio). Cuando se implemente el panel admin
(Feature 002, con autenticación de un único usuario), estos campos pasan a
gestionarse desde ahí — **el schema no cambia**, solo se añade la UI de edición.

## Seed

`apps/web/prisma/seed.ts` — corre con `npm run db:seed` (o `npx prisma db seed`).
Idempotente (`upsert` por clave única).
