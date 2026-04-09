import { randomUUID } from 'node:crypto'
import { PassThrough, Transform, type Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { CsvExportNotConfigured } from '@/app/functions/errors/csv-export-not-configured'
import { isR2Configured } from '@/env'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { stringify } from 'csv-stringify'
import { desc, ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const exportLinksToCsvInput = z.object({
  searchQuery: z.string().optional(),
})

export type ExportLinksToCsvInput = z.input<typeof exportLinksToCsvInput>

/** Linhas do cursor `pg` usam nomes físicos das colunas (snake_case), não as chaves do `.select()` do Drizzle. */
function rowFromPgCursor(chunk: unknown): {
  original_url: string
  short_url: string
  access_count: number
  created_at: Date
} {
  const r = chunk as Record<string, unknown>
  const originalUrl = r.original_url ?? r.originalUrl
  const shortUrl = r.short_url ?? r.shortUrl
  const accessCount = r.access_count ?? r.accessCount
  const createdRaw = r.created_at ?? r.createdAt

  if (typeof originalUrl !== 'string' || typeof shortUrl !== 'string') {
    throw new TypeError('CSV export: linha inválida (URL ausente)')
  }
  const access =
    typeof accessCount === 'number'
      ? accessCount
      : Number(accessCount ?? 0)
  const createdAt =
    createdRaw instanceof Date
      ? createdRaw
      : new Date(String(createdRaw ?? ''))
  if (Number.isNaN(createdAt.getTime())) {
    throw new TypeError('CSV export: data de criação inválida')
  }
  return {
    original_url: originalUrl,
    short_url: shortUrl,
    access_count: access,
    created_at: createdAt,
  }
}

type LinksCsvExportStream = {
  contentStream: Readable
  fileName: string
  completion: Promise<void>
}

function startLinksCsvExport(
  input: ExportLinksToCsvInput
): LinksCsvExportStream {
  const { searchQuery } = exportLinksToCsvInput.parse(input)

  const filter = searchQuery
    ? or(
        ilike(schema.links.shortUrl, `%${searchQuery}%`),
        ilike(schema.links.originalUrl, `%${searchQuery}%`)
      )
    : undefined

  const { sql: sqlText, params } = db
    .select({
      originalUrl: schema.links.originalUrl,
      shortUrl: schema.links.shortUrl,
      accessCount: schema.links.accessCount,
      createdAt: schema.links.createdAt,
    })
    .from(schema.links)
    .where(filter)
    .orderBy(desc(schema.links.createdAt))
    .toSQL()

  const cursor = pg.unsafe(sqlText, params as string[]).cursor(2)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'original_url', header: 'URL original' },
      { key: 'short_url', header: 'URL encurtada' },
      { key: 'access_count', header: 'Contagem de acessos' },
      { key: 'created_at', header: 'Data de criação' },
    ],
  })

  const contentStream = new PassThrough()

  const completion = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _encoding, callback) {
        try {
          for (const chunk of chunks) {
            const row = rowFromPgCursor(chunk)
            this.push({
              original_url: row.original_url,
              short_url: row.short_url,
              access_count: row.access_count,
              created_at: row.created_at.toISOString(),
            })
          }
          callback()
        } catch (err) {
          callback(err instanceof Error ? err : new Error(String(err)))
        }
      },
    }),
    csv,
    contentStream
  ).catch((err: unknown) => {
    contentStream.destroy(err instanceof Error ? err : new Error(String(err)))
    throw err
  })

  const fileName = `${randomUUID()}-links.csv`

  return { contentStream, fileName, completion }
}

export async function exportLinksToCsv(
  input: ExportLinksToCsvInput
): Promise<Either<CsvExportNotConfigured, { reportUrl: string }>> {
  if (!isR2Configured()) {
    return makeLeft(new CsvExportNotConfigured())
  }

  const { contentStream, fileName, completion } = startLinksCsvExport(input)

  const uploadPromise = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName,
    contentStream,
  })

  const [uploadResult] = await Promise.all([uploadPromise, completion])

  return makeRight({
    reportUrl: uploadResult.url,
  })
}
