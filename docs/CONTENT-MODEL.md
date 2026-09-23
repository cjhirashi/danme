# Modelo de contenido — danme

> Se actualiza cuando cambia el schema de Prisma o qué campos son editables desde el
> panel admin (ver `.harness/constitution.md` Art. 11).

Fuente de verdad: `apps/web/prisma/schema.prisma`. Este documento es la lectura
orientada a negocio de ese schema.

## `Product` — cada sabor de chicharrón

| Campo | Tipo | Quién lo edita | Notas |
|---|---|---|---|
| `name` | string | admin (`/admin/products`) | Nombre visible |
| `flavorSlug` | string (único) | admin, solo al crear | No editable después de creado |
| `description` | string | admin | Texto corto en la ficha de producto |
| `priceCents` | int | admin | Precio en centavos MXN |
| `presentation` | string | admin | p. ej. "190g" |
| `imageUrl` | string? | admin (subida de archivo) | `null` → la UI muestra placeholder ("Imagen pendiente") |
| `available` | boolean | admin (toggle) | `false` → no aparece en el catálogo público. "Eliminar" en la UI = esto, no hay borrado físico |
| `nomExcesoCalorias` / `nomExcesoSodio` | boolean | admin | Sellos de advertencia NOM-051, se muestran en la ficha |

## `SiteSettings` — configuración global (singleton, fila `id: "default"`)

| Campo | Tipo | Quién lo edita | Notas |
|---|---|---|---|
| `brandName` | string | admin (`/admin/settings`) | "DanMe" |
| `tagline` | string | admin | — |
| `aboutText` | string | admin | Cuerpo de la sección "Sobre `{brandName}`" de la landing |
| `whatsappNumber` | string | admin | Usado para armar el link `wa.me` de contacto |
| `instagramUrl` / `facebookUrl` | string? | admin | `null` → el enlace no se muestra |
| `logoUrl` | string? | admin (subida de archivo) | `null` → placeholder |

## `AdminUser` — cuentas del panel (SPEC-002, ADR-003)

N cuentas, **mismo rol** (sin RBAC — ver ADR-003). Cualquier cuenta admin puede
editar `Product`/`SiteSettings` y gestionar otras cuentas.

| Campo | Tipo | Notas |
|---|---|---|
| `email` | string (único) | login |
| `passwordHash` | string | `scrypt` (sal por usuario), nunca se expone en ninguna respuesta |
| `active` | boolean | `false` → no puede iniciar sesión; sesión existente se invalida en la siguiente request |
| `failedLoginAttempts` / `lockedUntil` | int / datetime? | bloqueo temporal tras 5 intentos fallidos (15 min) |

Alta: la primera cuenta se siembra vía `.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`); las
siguientes se crean desde `/admin/users` (nunca registro público).

## Imágenes subidas (`Product.imageUrl`, `SiteSettings.logoUrl`)

Se guardan en disco (`apps/web/public/uploads/{products,settings}/`), servidas
como estáticos por Next.js bajo `/uploads/**`. JPG/PNG/WebP, máx 5MB. El volumen
Docker `danme-uploads` las persiste entre rebuilds — ver `docs/DEPLOYMENT.md`.

## Seed

`apps/web/prisma/seed.ts` — corre con `npm run db:seed` (o `npx prisma db seed`).
Idempotente (`upsert` por clave única). Requiere `ADMIN_EMAIL`/`ADMIN_PASSWORD` en
el entorno para sembrar las cuentas admin.
