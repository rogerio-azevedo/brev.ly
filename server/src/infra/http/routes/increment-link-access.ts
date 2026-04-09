import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async server => {
  server.put(
    '/links/increment/:shortUrl',
    {
      schema: {
        summary: 'Increment access count for a short link',
        tags: ['links'],
        params: z.object({
          shortUrl: z.string().min(1),
        }),
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await incrementLinkAccess({ shortUrl })

      if (isRight(result)) {
        return reply.status(204).send(null)
      }

      const error = unwrapEither(result)
      if (error instanceof LinkNotFound) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  )
}
