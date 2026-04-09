export type Link = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export type LinksPaginatedResponse = {
  links: Link[]
  total: number
}

export type OriginalUrlResponse = {
  originalUrl: string
}

export type ExportCsvResponse = {
  reportUrl: string
}

export type ApiMessageBody = {
  message?: string
}
