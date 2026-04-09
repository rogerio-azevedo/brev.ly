import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const incrementLinkAccessInput = z.object({
  shortUrl: z.string().min(1),
})

export type IncrementLinkAccessInput = z.input<typeof incrementLinkAccessInput>

export async function incrementLinkAccess(
  input: IncrementLinkAccessInput
): Promise<Either<LinkNotFound, void>> {
  const { shortUrl } = incrementLinkAccessInput.parse(input)

  const [row] = await db
    .update(schema.links)
    .set({ accessCount: sql`${schema.links.accessCount} + 1` })
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning({ id: schema.links.id })

  if (!row) {
    return makeLeft(new LinkNotFound())
  }

  return makeRight(undefined)
}
