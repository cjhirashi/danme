---
id: ADR-001
tipo: adr
estado: accepted
fecha: 2026-09-20
---

# ADR-001 · Adopción del arnés SDD Anchored + perfil de arquitectura

## Contexto y planteamiento del problema

`danme` es un proyecto nuevo (greenfield): una landing page pública con diseño
responsive y un panel de administración para editar su contenido (textos, imágenes,
secciones), gestionado por un único administrador. No hay código previo. Hace falta
decidir el patrón de arquitectura, el stack y el estilo de despliegue antes de escribir
la primera spec, y dejar operativo el arnés SDD Anchored (`.harness/`) que gobernará el
desarrollo de aquí en adelante.

## Decisión

Adoptamos el arnés SDD Anchored (versión simplificada, ver `harness/reference/`) y
elegimos:

- **Monolito modular** con **Next.js (App Router) + TypeScript**, código en
  `apps/web/`. Un solo repo, un solo deploy: la landing se sirve estática/ISR y el
  panel admin vive como rutas protegidas del mismo app.
- **Patrón interno por capas** (rutas → `lib/services/` → `lib/db/`), sin puertos
  hexagonales — el dominio (gestión de contenido de una landing) no justifica esa
  ceremonia.
- **Postgres gestionado por Prisma** para persistir el contenido editable.
- **Docker self-host** como estilo de despliegue (contenedor propio, posible
  integración futura con la infra existente del usuario detrás de Caddy — pendiente de
  spec de deploy, no se decide aquí).
- **Un único administrador**, auth simple (email+password, sesión por cookie), sin
  roles ni registro público.

## Opciones consideradas

- **Next.js monolito** — un solo deploy, menor complejidad operativa, encaja con el
  alcance (una landing + un panel). **Elegida.**
- **React SPA + backend separado** — descartada: dos piezas que desplegar y versionar
  por separado sin que el alcance actual lo justifique.
- **Patrón hexagonal** — descartada para esta fase: el dominio es simple (contenido de
  una landing), los puertos/adaptadores añadirían indirección sin beneficio medible.
  Revisar vía `ADR-` si el proyecto crece en lógica de negocio.
- **Persistencia — SQLite** — descartada: no es compatible de forma directa con
  contenedores efímeros/orquestación futura; Postgres es igual de simple de operar en
  Docker y evita una migración posterior.
- **Persistencia — Headless CMS externo** — descartada: el usuario quiere un panel de
  administración propio, no delegar el contenido a un servicio de terceros.
- **Deploy — Vercel** — descartada explícitamente por el usuario a favor de self-host.

## Consecuencias

- **Buenas:** una sola base de código y un solo pipeline de deploy; patrón por capas de
  baja fricción; reutiliza convenciones ya usadas en otros proyectos del usuario
  (Postgres, Docker).
- **Coste / malas:** el usuario asume la infraestructura de deploy (TLS, proceso,
  reinicios) en vez de delegarla a un PaaS — se abordará con su propia spec de
  `docs/DEPLOYMENT.md` antes de la primera puesta en producción. Si el proyecto
  creciera en complejidad de dominio, el patrón por capas podría quedarse corto y
  requerir revisión (nuevo `ADR-`).

## Enlaces

- Afecta a: Artículo 1 y Artículo 2 de la Constitución.
- Relacionado: ADR-002 (adopción del especialista `experto-ux-ui`).
