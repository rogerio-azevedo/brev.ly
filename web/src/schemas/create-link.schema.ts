import { z } from 'zod'

const SHORT_URL_REGEX = /^[a-zA-Z0-9-]+$/

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'Informe a URL original')
    .url('Informe uma URL válida'),
  shortUrl: z
    .string()
    .min(1, 'Informe o encurtamento')
    .max(50, 'Máximo de 50 caracteres')
    .regex(
      SHORT_URL_REGEX,
      'Use apenas letras, números e hífen (sem espaços)',
    ),
})

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>
