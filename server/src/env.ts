import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  CLOUDFLARE_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDFLARE_ACCESS_KEY_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional()
  ),
  CLOUDFLARE_ACCESS_SECRET_KEY: z.preprocess((v) => {
    const primary = emptyToUndefined(v)
    if (primary !== undefined) return primary
    return emptyToUndefined(process.env.CLOUDFLARE_SECRET_ACCESS_KEY)
  }, z.string().optional()),
  CLOUDFLARE_BUCKET: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDFLARE_PUBLIC_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional()
  ),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)

export function isR2Configured(): boolean {
  return !!(
    env.CLOUDFLARE_ACCOUNT_ID &&
    env.CLOUDFLARE_ACCESS_KEY_ID &&
    env.CLOUDFLARE_ACCESS_SECRET_KEY &&
    env.CLOUDFLARE_BUCKET &&
    env.CLOUDFLARE_PUBLIC_URL
  )
}
