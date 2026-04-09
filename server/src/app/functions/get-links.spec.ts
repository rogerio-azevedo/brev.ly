import { randomUUID } from 'node:crypto'
import { getLinks } from '@/app/functions/get-links'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import dayjs from 'dayjs'
import { beforeEach, describe, expect, it } from 'vitest'

describe('getLinks', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should list links with total', async () => {
    const pattern = randomUUID()
    await makeLink({ shortUrl: `${pattern}-1` })
    await makeLink({ shortUrl: `${pattern}-2` })
    await makeLink({ shortUrl: `${pattern}-3` })

    const sut = await getLinks({
      searchQuery: pattern,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toBe(3)
    expect(unwrapEither(sut).links).toHaveLength(3)
  })

  it('should paginate', async () => {
    const pattern = randomUUID()
    await makeLink({ shortUrl: `${pattern}-a` })
    await makeLink({ shortUrl: `${pattern}-b` })
    await makeLink({ shortUrl: `${pattern}-c` })

    let sut = await getLinks({
      searchQuery: pattern,
      page: 1,
      pageSize: 2,
    })

    expect(unwrapEither(sut).total).toBe(3)
    expect(unwrapEither(sut).links).toHaveLength(2)

    sut = await getLinks({
      searchQuery: pattern,
      page: 2,
      pageSize: 2,
    })

    expect(unwrapEither(sut).total).toBe(3)
    expect(unwrapEither(sut).links).toHaveLength(1)
  })

  it('should sort by createdAt asc and desc', async () => {
    const pattern = randomUUID()

    const link1 = await makeLink({
      shortUrl: `${pattern}-1`,
      createdAt: new Date(),
    })
    const link2 = await makeLink({
      shortUrl: `${pattern}-2`,
      createdAt: dayjs().subtract(1, 'day').toDate(),
    })

    let sut = await getLinks({
      searchQuery: pattern,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })

    expect(unwrapEither(sut).links.map(l => l.id)).toEqual([link1.id, link2.id])

    sut = await getLinks({
      searchQuery: pattern,
      sortBy: 'createdAt',
      sortDirection: 'asc',
    })

    expect(unwrapEither(sut).links.map(l => l.id)).toEqual([link2.id, link1.id])
  })
})
