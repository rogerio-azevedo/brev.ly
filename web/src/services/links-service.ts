import { api } from '@/services/api'
import type {
  ExportCsvResponse,
  Link,
  LinksPaginatedResponse,
  OriginalUrlResponse,
} from '@/types/link'

export type ListLinksParams = {
  page?: number
  pageSize?: number
  searchQuery?: string
  sortBy?: 'createdAt'
  sortDirection?: 'asc' | 'desc'
}

export async function listLinks(
  params: ListLinksParams = {},
): Promise<LinksPaginatedResponse> {
  const { data } = await api.get<LinksPaginatedResponse>('/links', { params })
  return data
}

export async function createLink(body: {
  original_url: string
  short_url: string
}): Promise<Link> {
  const { data } = await api.post<Link>('/links', body)
  return data
}

export async function deleteLink(shortUrl: string): Promise<void> {
  await api.delete<{ ok: true }>(`/links/${encodeURIComponent(shortUrl)}`)
}

export async function getOriginalUrl(
  shortUrl: string,
): Promise<OriginalUrlResponse> {
  const { data } = await api.get<OriginalUrlResponse>(
    `/links/${encodeURIComponent(shortUrl)}`,
  )
  return data
}

export async function incrementLinkAccess(shortUrl: string): Promise<void> {
  await api.put(`/links/increment/${encodeURIComponent(shortUrl)}`, {
    responseType: 'text',
  })
}

export async function exportLinksCsv(params?: {
  searchQuery?: string
}): Promise<ExportCsvResponse> {
  const { data } = await api.post<ExportCsvResponse>(
    '/links/export-csv',
    {},
    { params },
  )
  return data
}
