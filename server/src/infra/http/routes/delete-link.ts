import { deleteLink } from '@/app/functions/delete-link'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { isLeft, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const deleteLinkRoute: FastifyPluginAsyncZod = async server => {
  server.delete(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Delete a link by short URL',
        tags: ['links'],
        params: z.object({
          shortUrl: z.string().min(1),
        }),
        response: {
          // 200 + JSON evita 204 com corpo serializado (Zod/Fastify) que quebra clientes HTTP/Axios.
          200: z.object({ ok: z.literal(true) }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await deleteLink({ shortUrl })

      if (isLeft(result)) {
        const error = unwrapEither(result)
        if (error instanceof LinkNotFound) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }

      return reply.status(200).send({ ok: true as const })
    }
  )
}
