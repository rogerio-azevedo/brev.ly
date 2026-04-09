import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export const makeLink = async (
  overrides?: Partial<InferInsertModel<typeof schema.links>>
) => {
  const shortSlug = faker.string.alphanumeric({ length: 8 }).toLowerCase()

  const result = await db
    .insert(schema.links)
    .values({
      originalUrl: faker.internet.url(),
      shortUrl: shortSlug,
      accessCount: 0,
      createdAt: new Date(),
      ...overrides,
    })
    .returning()

  return result[0]
}
