# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/src/infra/db/migrations ./src/infra/db/migrations
COPY --from=builder --chown=appuser:nodejs /app/drizzle.config.ts ./
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules

USER appuser

EXPOSE 3333

CMD ["sh", "-c", "pnpm db:migrate && node dist/server.js"]
