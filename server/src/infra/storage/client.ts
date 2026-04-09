import { env, isR2Configured } from '@/env'
import { S3Client } from '@aws-sdk/client-s3'

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null

  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = env.CLOUDFLARE_ACCESS_KEY_ID
  const secretAccessKey = env.CLOUDFLARE_ACCESS_SECRET_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) return null

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}
