FROM node:24-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts exige DATABASE_URL para resolver (no para conectar) —
# `generate` y `build` no tocan la base de datos, el valor real llega en runtime.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
# El servidor standalone de Next.js usa $HOSTNAME para el bind del socket. Docker
# fija HOSTNAME al hostname del contenedor por defecto, que en un contenedor con
# más de una red (net-danme + net-danme-db) resuelve a una sola IP — el server
# quedaba inalcanzable desde la otra red. 0.0.0.0 = escuchar en todas.
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
