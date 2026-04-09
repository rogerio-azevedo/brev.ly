import type { Config } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for Drizzle config')
}

export default {
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: 'postgresql',
  schema: './src/infra/db/schemas/*',
  out: './src/infra/db/migrations',
} satisfies Config
