FROM node:20-alpine AS base

RUN npm i -g pnpm@8

FROM base AS dependencies

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM base AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod

FROM node:20-alpine AS deploy

WORKDIR /usr/src/app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=build --chown=appuser:nodejs /usr/src/app/dist ./dist
COPY --from=build --chown=appuser:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /usr/src/app/package.json ./package.json

# Copy migrations and config for db:migrate
COPY --from=build --chown=appuser:nodejs /usr/src/app/src/infra/db/migrations ./src/infra/db/migrations
COPY --from=build --chown=appuser:nodejs /usr/src/app/drizzle.config.ts ./

USER appuser

EXPOSE 3333

# Run migrations and then start the server
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/server.js"]
