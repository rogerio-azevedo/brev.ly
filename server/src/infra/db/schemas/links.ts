import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const links = pgTable(
  'links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    originalUrl: text('original_url').notNull(),
    shortUrl: varchar('short_url', { length: 50 }).notNull().unique(),
    accessCount: integer('access_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [index('links_created_at_idx').on(table.createdAt)]
)

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
