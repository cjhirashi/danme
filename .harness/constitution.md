---
titulo: Constitución del arnés — danme
tipo: constitution
estado: draft
fecha: 2026-09-20
metodo: SDD Anchored (versión simplificada)
---

# Constitución — danme

Principios innegociables que toda `spec.md` y todo `plan.md` heredan y respetan. Se
valida **antes** de redactar cada spec. Cambiar un artículo exige un `ADR-`.

Separación estricta: `.harness/` = **cómo trabajamos** · `docs/` = **el producto**.

---

## Artículo 1 · Arquitectura

El proyecto sigue el patrón definido en la Génesis (ver Artículo 2 y
`decisions/ADR-001-adopcion-arnes-y-perfil.md`). Todo el desarrollo es conforme a ese
patrón; el gate verifica la conformidad. Cambiar de patrón exige un `ADR-` nuevo.

- **Despliegue:** contenedor Docker self-host (single-node), sin depender de un PaaS.
- **Patrón interno:** monolito modular, **por capas**: `app/` (rutas Next.js — landing
  pública + panel admin protegido) → `lib/services/` (casos de uso: gestión de
  contenido, auth) → `lib/db/` (Prisma, acceso a Postgres). La lógica de negocio vive
  en `lib/services/`, nunca en las rutas ni en los componentes de UI.
- **Ubicación del código de la app:** `apps/web/` (no en la raíz del repo), para no
  mezclar el código de producto con `.harness/`/`docs/` y dejar espacio a un futuro
  segundo servicio si aparece.
- Nada de dependencias nuevas de terceros sin justificación en un `plan.md`/`ADR-`.

## Artículo 2 · Perfil de arquitectura *(definido en la Génesis — ADR-001)*

```yaml
estilo_aplicacion: monolito-modular
patron_interno:    por-capas
patron_interno_adr: ADR-001
servicios:
  web: { stack: "Next.js (App Router) + TypeScript + Prisma", tipo: node, ruta: apps/web }
infraestructura: [postgres, docker]
topologia_agentes: ninguna
sustratos_integracion:
  - rest-http   # rutas /api internas del propio Next.js, consumidas solo por el panel admin
capas_transversales: [auth]
rutas:
  arnes: .harness/
  specs: .harness/specs/
  decisiones: .harness/decisions/
```

## Artículo 3 · Testing

- **TDD en la Fase 4** (test antes que código).
- Cobertura mínima **70%** por módulo tocado (umbral que el verificador exige);
  objetivo **85%** para código nuevo.
- Pruebas por zona del patrón: `lib/services/` (unitarias, lógica de negocio) ·
  `lib/db/` (repositorio, contra una Postgres de test) · `app/api/**` (integración,
  request→response) · componentes de UI (render + accesibilidad básica).
- **Verificación real, no autoreporte:** el servicio **arranca**, la ruta **responde**.
  Editar estado no es verificar. Evidencia = salida de terminal **pegada**, nunca
  "esperada".

## Artículo 4 · Persistencia

- **Postgres** gestionado por **Prisma** (schema + migraciones versionadas en el repo).
- Dev DB: contenedor Postgres vía `docker-compose` local, con `seed` de contenido de
  ejemplo para poder ver la landing sin pasar por el panel admin primero.
- Las migraciones se generan y commitean con `prisma migrate` — nunca se edita el
  schema de producción a mano.

## Artículo 5 · Seguridad

- Secretos (cadena de conexión, secreto de sesión) fuera del repo, vía `.env`
  (`.env.example` sí se commitea).
- **Un único usuario administrador.** Login con email+password (hash con bcrypt/argon2)
  y sesión vía cookie firmada httpOnly. Sin roles ni registro público en esta fase —
  añadir multiusuario exige spec + `ADR-` nuevo (cambia el modelo de auth).
- Las rutas `/admin/**` y `/api/admin/**` verifican sesión en cada request; nunca
  confiar en que el cliente oculte el enlace.
- Sin llamadas a APIs externas de pago en esta fase. Cualquier integración futura
  (analítica, envío de email, etc.) requiere autorización explícita del usuario en el
  `plan.md` que la introduzca.

## Artículo 6 · Contratos y errores

- Las rutas `/api/**` son **internas** (solo las consume el propio panel admin), por lo
  que no se exige un contrato OpenAPI formal mientras no tengan otro consumidor. Aun
  así, toda respuesta de error usa forma **Problem Details (RFC 9457)** de forma
  consistente, para no tener que migrarlo después.
- Si en el futuro una ruta se expone a un tercero, esa ruta pasa a requerir su
  `openapi.yaml` (activa el bloque de contrato del gate) — vía `ADR-`.

## Artículo 7 · Observabilidad

- Logging estructurado mínimo (nivel info/error) en las rutas `/api/**` y en los
  `services` de auth/contenido. Sin métricas ni tracing en esta fase — proyecto de un
  solo servicio, un solo administrador; se revisita si crece.

## Artículo 8 · Gates y aprobaciones

- **Value Captain:** Carlos. **Tech Lead:** Carlos. (Mismo rol — proyecto personal.)
- 2 puntos de aprobación humana: tras **Specify** y tras **Plan**. La **IA no
  autoaprueba**.

## Artículo 9 · Convenciones

- Idioma: código (nombres, comentarios) en **inglés**; specs/docs/interacción con el
  usuario en **español**.
- IDs: `RF-`/`RNF-`/`T-` (por feature) · `ADR-` (proyecto). Estables; número reservado
  al crear el archivo.
- Ramas y carpetas de feature: `NNN-slug` kebab-case, ≤ 5 palabras.
- Commits: **Conventional Commits** + sufijo `(RF-NNN)`.
- Tests anotados con su `RF-`: comentario `// RF-NNN` junto al `describe`/`it`.

## Artículo 10 · Regla de raíz (prohibido el parche)

- Toda corrección ataca la **causa raíz**, nunca el síntoma. Sin *workarounds*, sin
  código-tirita, sin `TODO`/`FIXME` sin ticket.
- Diferir la causa raíz es válido **sólo** como `RF-`/`RNF-`/`ADR-` explícito en el
  backlog, con justificación — nunca como código que se queda.
- El verificador rechaza la entrega cuya solución no explique y ataque la causa.

## Artículo 11 · Mapa de documentación del proyecto

| Documento | Ruta | Se actualiza cuando cambia… |
|---|---|---|
| Arquitectura del producto | `docs/ARCHITECTURE.md` | estructura de `apps/web/`, capas, decisiones de diseño |
| Modelo de contenido (qué administra el panel) | `docs/CONTENT-MODEL.md` | schema de Prisma / entidades editables |
| README del servicio web | `apps/web/README.md` | comandos, setup local, variables de entorno |
| Deploy / infra | `docs/DEPLOYMENT.md` | Dockerfile, docker-compose, variables de entorno, puertos |

> Aún no existen — se crean junto con la primera spec que toque cada superficie. Las
> decisiones **del arnés** van en `.harness/decisions/`, no aquí.

## Artículo 12 · Anti-hipersistema

1. **3 archivos por feature** (`spec.md`, `plan.md`, `tasks.md`) + `contracts/` si
   aplica. Añadir un tipo de artefacto exige un `ADR-`.
2. El método vive en **`method.md`** (1 archivo). No crece sin podar.
3. **Un gate por frontera real.** Nada "por si acaso".
4. **Un canon por hecho.** Cero duplicación entre `AGENTS.md`, esta Constitución y `docs/`.
5. **Estado en disco, no en el chat.**
6. **Rúbrica primero.** Lo trivial no toca el arnés.

---

## Hazards conocidos del código

*(ninguno — proyecto greenfield, sin código heredado todavía)*

## Historial de enmiendas

| Fecha | Artículo | Cambio | ADR |
|---|---|---|---|
| 2026-09-20 | — | Constitución inicial (Génesis: Next.js monolito + Postgres/Prisma + Docker self-host + admin single-user) | ADR-001 |
| 2026-09-20 | 8 (agentes) | Adopción de `experto-ux-ui` (proyecto con frontend) | ADR-002 |
