import { createLink } from '@/app/functions/create-link'
import { ShortUrlAlreadyExists } from '@/app/functions/errors/short-url-already-exists'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const SHORT_URL_REGEX = /^[a-zA-Z0-9-]+$/

const linkSchema = z.object({
  id: z.string().uuid(),
  originalUrl: z.string(),
  shortUrl: z.string(),
  accessCount: z.number(),
  createdAt: z.date(),
})

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create a short link',
        tags: ['links'],
        body: z.object({
          original_url: z.string().url(),
          short_url: z.string().min(1).max(50).regex(SHORT_URL_REGEX),
        }),
        response: {
          201: linkSchema,
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { original_url, short_url } = request.body

      const result = await createLink({
        originalUrl: original_url,
        shortUrl: short_url,
      })

      if (isRight(result)) {
        return reply.status(201).send(result.right)
      }

      const error = unwrapEither(result)
      if (error instanceof ShortUrlAlreadyExists) {
        return reply.status(409).send({ message: error.message })
      }

      throw error
    }
  )
}
