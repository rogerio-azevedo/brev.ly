import { CsvExportNotConfigured } from '@/app/functions/errors/csv-export-not-configured'
import { exportLinksToCsv } from '@/app/functions/export-links-to-csv'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const exportLinksToCsvRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links/export-csv',
    {
      schema: {
        summary: 'Export links as CSV to object storage',
        tags: ['links'],
        querystring: z.object({
          searchQuery: z.string().optional(),
        }),
        response: {
          200: z.object({
            reportUrl: z.string(),
          }),
          503: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { searchQuery } = request.query

      const result = await exportLinksToCsv({
        searchQuery,
      })

      if (isRight(result)) {
        return reply.status(200).send({
          reportUrl: result.right.reportUrl,
        })
      }

      const error = unwrapEither(result)
      if (error instanceof CsvExportNotConfigured) {
        return reply.status(503).send({ message: error.message })
      }

      throw error
    }
  )
}
