import { randomUUID } from 'node:crypto'
import { exportLinksToCsv } from '@/app/functions/export-links-to-csv'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import * as upload from '@/infra/storage/upload-file-to-storage'
import { isRight } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('exportLinksToCsv', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
    vi.restoreAllMocks()
  })

  it('should export links to CSV and return report URL', async () => {
    let capturedCsv = ''

    vi.spyOn(upload, 'uploadFileToStorage').mockImplementation(async opts => {
      const chunks: Buffer[] = []
      for await (const chunk of opts.contentStream) {
        chunks.push(Buffer.from(chunk))
      }
      capturedCsv = Buffer.concat(chunks).toString('utf-8')
      return {
        key: `${randomUUID()}.csv`,
        url: 'https://example.com/file.csv',
      }
    })

    const pattern = randomUUID()
    const link1 = await makeLink({ shortUrl: `${pattern}-1` })
    const link2 = await makeLink({ shortUrl: `${pattern}-2` })

    const sut = await exportLinksToCsv({ searchQuery: pattern })

    expect(isRight(sut)).toBe(true)
    if (!isRight(sut)) {
      throw new Error('expected exportLinksToCsv to succeed')
    }
    expect(sut.right.reportUrl).toBe('https://example.com/file.csv')

    const lines = capturedCsv.trim().split('\n')
    expect(lines[0]).toContain('ID')
    expect(lines[0]).toContain('URL Original')
    expect(lines[0]).toContain('Código Curto')
    expect(lines[0]).toContain('Quantidade de Acessos')
    expect(lines[0]).toContain('Data de Criação')
    expect(lines.length).toBeGreaterThanOrEqual(3)

    const dataLines = lines.slice(1).map(line => line.split(','))
    const shortUrls = dataLines.map(cols => cols[2])
    expect(shortUrls).toEqual(
      expect.arrayContaining([link1.shortUrl, link2.shortUrl])
    )
    expect(capturedCsv).toContain(link1.id)
    expect(capturedCsv).toContain(link2.id)
  })
})
