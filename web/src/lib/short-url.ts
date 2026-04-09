import { env } from '@/env'

/** URL pública do link encurtado (mesma origem do SPA). */
export function buildShortLinkUrl(shortUrl: string): string {
  const base = env.VITE_FRONTEND_URL.replace(/\/$/, '')
  return `${base}/${encodeURIComponent(shortUrl)}`
}
