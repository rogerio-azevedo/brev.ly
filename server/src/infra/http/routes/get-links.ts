import { getLinks } from '@/app/functions/get-links'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const linkSchema = z.object({
  id: z.string().uuid(),
  originalUrl: z.string(),
  shortUrl: z.string(),
  accessCount: z.number(),
  createdAt: z.date(),
})

export const getLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'List links with pagination',
        tags: ['links'],
        querystring: z.object({
          searchQuery: z.string().optional(),
          sortBy: z.enum(['createdAt']).optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
          page: z.coerce.number().min(1).default(1),
          pageSize: z.coerce.number().optional().default(20),
        }),
        response: {
          200: z.object({
            links: z.array(linkSchema),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, searchQuery, sortBy, sortDirection } =
        request.query

      const result = await getLinks({
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortDirection,
      })

      const { links, total } = unwrapEither(result)

      return reply.status(200).send({ links, total })
    }
  )
}
