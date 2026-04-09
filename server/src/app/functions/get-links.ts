import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/shared/either'
import { asc, count, desc, ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const getLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().optional().default(20),
})

export type GetLinksInput = z.input<typeof getLinksInput>

export type GetLinksOutput = {
  links: {
    id: string
    originalUrl: string
    shortUrl: string
    accessCount: number
    createdAt: Date
  }[]
  total: number
}

export async function getLinks(
  input: GetLinksInput
): Promise<Either<never, GetLinksOutput>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } =
    getLinksInput.parse(input)

  const filter = searchQuery
    ? or(
        ilike(schema.links.shortUrl, `%${searchQuery}%`),
        ilike(schema.links.originalUrl, `%${searchQuery}%`)
      )
    : undefined

  const orderExpr =
    sortBy === 'createdAt' && sortDirection === 'asc'
      ? asc(schema.links.createdAt)
      : sortBy === 'createdAt' && sortDirection === 'desc'
        ? desc(schema.links.createdAt)
        : desc(schema.links.createdAt)

  const [links, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .where(filter)
      .orderBy(orderExpr)
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.links.id) })
      .from(schema.links)
      .where(filter),
  ])

  return makeRight({ links, total })
}
