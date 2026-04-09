import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const getOriginalUrlInput = z.object({
  shortUrl: z.string().min(1),
})

export type GetOriginalUrlInput = z.input<typeof getOriginalUrlInput>

export async function getOriginalUrl(
  input: GetOriginalUrlInput
): Promise<Either<LinkNotFound, { originalUrl: string }>> {
  const { shortUrl } = getOriginalUrlInput.parse(input)

  const [link] = await db
    .select({ originalUrl: schema.links.originalUrl })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFound())
  }

  return makeRight({ originalUrl: link.originalUrl })
}
