import { randomUUID } from 'node:crypto'
import { createLink } from '@/app/functions/create-link'
import { ShortUrlAlreadyExists } from '@/app/functions/errors/short-url-already-exists'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

describe('createLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should create a link', async () => {
    const shortUrl = `s-${randomUUID().slice(0, 8)}`

    const sut = await createLink({
      originalUrl: 'https://example.com/page',
      shortUrl,
    })

    expect(isRight(sut)).toBe(true)
    const link = unwrapEither(sut)
    expect(link.shortUrl).toBe(shortUrl)
    expect(link.originalUrl).toBe('https://example.com/page')

    const rows = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))

    expect(rows).toHaveLength(1)
  })

  it('should return left when short URL already exists', async () => {
    const shortUrl = `dup-${randomUUID().slice(0, 8)}`

    await createLink({
      originalUrl: 'https://a.com',
      shortUrl,
    })

    const sut = await createLink({
      originalUrl: 'https://b.com',
      shortUrl,
    })

    expect(isRight(sut)).toBe(false)
    expect(unwrapEither(sut)).toBeInstanceOf(ShortUrlAlreadyExists)
  })
})
