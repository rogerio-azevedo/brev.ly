import type { OriginalUrlResponse } from '@/types/link'

import { getOriginalUrl } from '@/services/links-service'

/**
 * O backend incrementa `accessCount` no mesmo GET que devolve a URL original,
 * para o contador não ser abortado quando o browser faz `location.replace`.
 *
 * Dedup por shortUrl evita requisições duplicadas no StrictMode do React.
 */
const inFlight = new Map<string, Promise<OriginalUrlResponse>>()

export function resolveShortUrlAndRecordAccessDeduped(
  shortUrl: string,
): Promise<OriginalUrlResponse> {
  const existing = inFlight.get(shortUrl)
  if (existing) {
    return existing
  }
  const promise = getOriginalUrl(shortUrl).finally(() => {
    inFlight.delete(shortUrl)
  })
  inFlight.set(shortUrl, promise)
  return promise
}
