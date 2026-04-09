import { randomUUID } from 'node:crypto'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { getOriginalUrl } from '@/app/functions/get-original-url'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

describe('getOriginalUrl', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should return original URL without changing access count', async () => {
    const link = await makeLink({
      originalUrl: 'https://target.example',
      accessCount: 5,
    })

    const sut = await getOriginalUrl({ shortUrl: link.shortUrl })

    expect(isRight(sut)).toBe(true)
    if (isRight(sut)) {
      expect(sut.right.originalUrl).toBe('https://target.example')
    }

    const [row] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, link.shortUrl))

    expect(row?.accessCount).toBe(5)
  })

  it('should return LinkNotFound when missing', async () => {
    const sut = await getOriginalUrl({ shortUrl: `x-${randomUUID()}` })

    expect(isRight(sut)).toBe(false)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFound)
  })
})
