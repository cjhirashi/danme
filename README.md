# danme

Sitio de **danme** (chicharrones por sabor): landing pública responsive y un panel de
administración para un único administrador que edita productos y ajustes del sitio (incluida la
subida de imágenes).

- **Producción:** `danme.cjhirashi.com`, detrás del proxy de `cjhirashi-srv` (red `net-danme`, contrato `caddy.json`).
- **Stack:** Next.js (App Router, TypeScript) en `apps/web/` · Prisma + PostgreSQL · Docker self-host.

## Estructura

```
danme/
├── apps/web/              # Monolito Next.js por capas
│   ├── app/               # Rutas: (public) landing y admin/ panel
│   ├── components/ lib/   # UI y lógica
│   ├── prisma/            # Esquema (fuente de verdad del modelo de contenido) y seed
│   └── tests/ e2e/        # Unitarias, de componentes, de BD y Playwright
├── docs/                  # ARCHITECTURE.md · CONTENT-MODEL.md · DEPLOYMENT.md
├── docker-compose.yml     # web + postgres (volumen danme-uploads para las imágenes subidas)
├── caddy.json             # Contrato con cjhirashi-srv
└── .harness/              # Arnés de desarrollo (SDD Anchored)
```

## Desarrollo local

```bash
cd apps/web
cp .env.example .env          # rellena DATABASE_URL y SESSION_SECRET
npm install
npm run dev                   # http://localhost:3000
npm run db:seed               # datos iniciales
npm test                      # unitarias y de componentes (vitest)
npm run test:db               # pruebas contra la BD de prueba (.env.test)
npm run type-check && npm run lint
```

Despliegue, variables de entorno y el volumen de imágenes: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
Capas y decisiones: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Campos editables desde el panel:
[`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md). Reglas de trabajo para agentes: [`AGENTS.md`](AGENTS.md).
