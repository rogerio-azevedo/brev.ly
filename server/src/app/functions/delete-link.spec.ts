import { randomUUID } from 'node:crypto'
import { deleteLink } from '@/app/functions/delete-link'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

describe('deleteLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should delete an existing link', async () => {
    const link = await makeLink()

    const sut = await deleteLink({ shortUrl: link.shortUrl })

    expect(isRight(sut)).toBe(true)

    const rows = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, link.shortUrl))

    expect(rows).toHaveLength(0)
  })

  it('should return LinkNotFound when missing', async () => {
    const sut = await deleteLink({ shortUrl: `missing-${randomUUID()}` })

    expect(isRight(sut)).toBe(false)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFound)
  })
})
