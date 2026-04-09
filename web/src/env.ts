import { z } from 'zod'

const envSchema = z.object({
  VITE_BACKEND_URL: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : 'http://localhost:3333')),
  VITE_FRONTEND_URL: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : 'http://localhost:5173')),
})

export const env = envSchema.parse({
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
})
