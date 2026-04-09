import { ShortUrlAlreadyExists } from '@/app/functions/errors/short-url-already-exists'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const SHORT_URL_REGEX = /^[a-zA-Z0-9-]+$/

const createLinkInput = z.object({
  originalUrl: z.string().url(),
  shortUrl: z.string().min(1).max(50).regex(SHORT_URL_REGEX),
})

export type CreateLinkInput = z.input<typeof createLinkInput>

export async function createLink(
  input: CreateLinkInput
): Promise<Either<ShortUrlAlreadyExists, typeof schema.links.$inferSelect>> {
  const { originalUrl, shortUrl } = createLinkInput.parse(input)

  const [existing] = await db
    .select({ id: schema.links.id })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)
  if (existing) {
    return makeLeft(new ShortUrlAlreadyExists())
  }

  const [link] = await db
    .insert(schema.links)
    .values({
      originalUrl,
      shortUrl,
    })
    .returning()

  return makeRight(link)
}
