import { z } from 'zod'

const SHORT_URL_REGEX = /^[a-zA-Z0-9-]+$/

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'Informe uma url válida.')
    .url('Informe uma url válida.'),
  shortUrl: z
    .string()
    .min(1, 'Informe uma url minúscula e sem espaço/caracter especial.')
    .max(50, 'Máximo de 50 caracteres')
    .regex(
      SHORT_URL_REGEX,
      'Informe uma url minúscula e sem espaço/caracter especial.',
    ),
})

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>
