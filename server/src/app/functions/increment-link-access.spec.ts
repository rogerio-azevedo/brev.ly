import { randomUUID } from 'node:crypto'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

describe('incrementLinkAccess', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should increment access count by one', async () => {
    const link = await makeLink({
      originalUrl: 'https://target.example',
      accessCount: 0,
    })

    const sut = await incrementLinkAccess({ shortUrl: link.shortUrl })

    expect(isRight(sut)).toBe(true)

    const [row] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, link.shortUrl))

    expect(row?.accessCount).toBe(1)
  })

  it('should increment multiple times cumulatively', async () => {
    const link = await makeLink({
      originalUrl: 'https://target.example',
      accessCount: 10,
    })

    await incrementLinkAccess({ shortUrl: link.shortUrl })
    const sut = await incrementLinkAccess({ shortUrl: link.shortUrl })

    expect(isRight(sut)).toBe(true)

    const [row] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, link.shortUrl))

    expect(row?.accessCount).toBe(12)
  })

  it('should return LinkNotFound when missing', async () => {
    const sut = await incrementLinkAccess({ shortUrl: `x-${randomUUID()}` })

    expect(isRight(sut)).toBe(false)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFound)
  })
})
