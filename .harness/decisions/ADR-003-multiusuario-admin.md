---
id: ADR-003
tipo: adr
estado: accepted
fecha: 2026-09-20
---

# ADR-003 · De un único administrador a N administradores (mismo rol)

## Contexto y planteamiento del problema

ADR-001 (Art. 5 de la Constitución) fijó **un único usuario administrador**, sin
roles ni registro público, para el panel de contenido. Al iniciar la Feature 002
(panel admin), el usuario pidió **2 cuentas**: la suya (`cjhirashi@gmail.com`,
quien encargó y opera el proyecto) y la del propietario del negocio DanMe (Daniel),
quien administrará el contenido del día a día (productos, configuración del sitio).
Esto contradice el Art. 5 tal como está escrito — exige una decisión explícita antes
de que la spec de Feature 002 lo dé por hecho.

## Decisión

Pasamos de **1 administrador fijo** a **N administradores, todos con el mismo rol**
(sin RBAC diferenciado):

- Cualquier cuenta admin puede: editar `Product`, editar `SiteSettings`, cambiar su
  propia contraseña, y **crear/editar/desactivar otras cuentas admin** desde una
  pantalla de "Usuarios" dentro del panel.
- Sigue **sin registro público** — una cuenta nueva solo la puede crear otra cuenta
  admin ya autenticada (nunca un formulario abierto).
- Alta inicial (arranque en frío, sin admins todavía): seed/`.env`
  (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) crea la primera cuenta (`cjhirashi@gmail.com`).
  De ahí en adelante, altas nuevas se hacen desde el panel, no por seed.
- Modelo de datos: tabla `AdminUser` (no más una constante de un solo usuario) con
  `email`, `passwordHash`, `active`, timestamps. Sesión sigue siendo cookie firmada
  httpOnly (sin cambios ahí).

## Opciones consideradas

- **N administradores, mismo rol (sin RBAC)** — cubre el caso real (2 personas
  necesitan editar) sin la complejidad de modelar permisos granulares que nadie
  pidió. **Elegida** — confirmado explícitamente por el usuario: "mismos permisos".
- **RBAC con roles diferenciados** (p. ej. superadmin vs. editor de contenido) —
  descartada: el usuario confirmó que ambas cuentas necesitan los mismos permisos;
  añadir una tabla de roles/permisos sería complejidad sin requisito real detrás
  (viola Constitución Art. 12, anti-hipersistema).
- **Mantener 1 solo admin, compartir la misma credencial entre las 2 personas** —
  descartada: sin trazabilidad de quién hizo qué cambio, y el usuario pidió
  explícitamente 2 cuentas separadas.

## Consecuencias

- **Buenas:** cubre el caso de uso real (Carlos + Daniel) sin sobre-diseñar
  permisos; alta de nuevas cuentas queda auto-gestionada desde el panel a futuro
  (no requiere volver a tocar el seed ni pedir ayuda técnica).
- **Coste / malas:** el modelo de datos de auth pasa de "constante/env" a una tabla
  real (`AdminUser`) con su propio CRUD — Feature 002 crece un poco de alcance
  (pantalla de Usuarios) respecto a lo mínimo de "solo login". Sin RBAC, cualquier
  admin puede desactivar a cualquier otro admin (incluido a sí mismo) — se acepta
  este riesgo por ser 2 personas de confianza en un proyecto personal; si esto deja
  de ser cierto, requiere un ADR nuevo para introducir RBAC.

## Enlaces

- Afecta a: Constitución Art. 5 (enmienda), Feature 002 (panel admin, spec por
  escribir)
- Relacionado: ADR-001 (decisión original de un único admin)
