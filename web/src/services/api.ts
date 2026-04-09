import axios, { type AxiosError } from 'axios'
import qs from 'qs'

import { env } from '@/env'
import type { ApiMessageBody } from '@/types/link'

export const api = axios.create({
  baseURL: env.VITE_BACKEND_URL,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true }),
})

export type ApiErrorPayload = ApiMessageBody & { status?: number }

export function isAxiosApiError(
  error: unknown,
): error is AxiosError<ApiMessageBody> {
  return axios.isAxiosError(error) && error.response !== undefined
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosApiError(error)) {
    const msg = error.response?.data?.message
    if (typeof msg === 'string' && msg.length > 0) {
      return msg
    }
  }
  return fallback
}
