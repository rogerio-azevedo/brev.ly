import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { getOriginalUrl } from '@/app/functions/get-original-url'
import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getOriginalUrlRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links/:shortUrl',
    {
      schema: {
        summary:
          'Resolve short URL to original URL and record one access (atomic for clients)',
        tags: ['links'],
        params: z.object({
          shortUrl: z.string().min(1),
        }),
        response: {
          200: z.object({
            originalUrl: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await getOriginalUrl({ shortUrl })

      if (isRight(result)) {
        const inc = await incrementLinkAccess({ shortUrl })
        if (isLeft(inc)) {
          request.log.warn(
            { shortUrl },
            'incrementLinkAccess failed after resolve (link missing?)',
          )
        }
        return reply.status(200).send(result.right)
      }

      const error = unwrapEither(result)
      if (error instanceof LinkNotFound) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  )
}
