import { env } from '@/env'
import { getR2Client } from '@/infra/storage/client'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function getFileFromStorage(key: string) {
  const client = getR2Client()
  if (!client || !env.CLOUDFLARE_BUCKET) {
    throw new Error('Storage is not configured')
  }

  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_BUCKET,
    Key: key,
  })

  const response = await client.send(command)

  if (!response.Body) {
    throw new Error('File not found')
  }

  return {
    body: response.Body,
    contentType: response.ContentType || 'application/octet-stream',
    contentLength: response.ContentLength,
  }
}
