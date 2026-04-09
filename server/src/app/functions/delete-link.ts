import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const deleteLinkInput = z.object({
  shortUrl: z.string().min(1),
})

export type DeleteLinkInput = z.input<typeof deleteLinkInput>

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<LinkNotFound, void>> {
  const { shortUrl } = deleteLinkInput.parse(input)

  const result = await db
    .delete(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning({ id: schema.links.id })

  if (result.length === 0) {
    return makeLeft(new LinkNotFound())
  }

  return makeRight(undefined)
}
