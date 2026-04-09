import { Spinner } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { getApiErrorMessage, isAxiosApiError } from '@/services/api'
import { resolveShortUrlAndRecordAccessDeduped } from '@/services/resolve-short-url-deduped'

export function RedirectPage() {
  const { shortUrl } = useParams<{ shortUrl: string }>()
  const navigate = useNavigate()

  const query = useQuery({
    queryKey: ['resolve-short-url', shortUrl],
    queryFn: () => {
      if (!shortUrl) {
        throw new Error('shortUrl is required')
      }
      return resolveShortUrlAndRecordAccessDeduped(shortUrl)
    },
    enabled: Boolean(shortUrl),
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.isSuccess && query.data?.originalUrl) {
      window.location.replace(query.data.originalUrl)
    }
  }, [query.isSuccess, query.data])

  useEffect(() => {
    if (!query.isError || !query.error) return
    if (isAxiosApiError(query.error) && query.error.response?.status === 404) {
      navigate('/not-found', { replace: true })
      return
    }
    toast.error(
      getApiErrorMessage(query.error, 'Não foi possível abrir o link'),
    )
    navigate('/', { replace: true })
  }, [query.isError, query.error, navigate])

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-border px-3 py-8">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-lg bg-surface px-8 py-12 sm:px-12">
        <img
          src="/brevly-icon.svg"
          alt=""
          className="size-12"
          width={48}
          height={48}
        />
        <h1 className="text-center text-xl font-semibold text-foreground-secondary">
          Redirecionando…
        </h1>
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner
            className="size-10 animate-spin text-primary"
            aria-hidden
          />
          <p className="text-sm text-muted">
            O link será aberto automaticamente em alguns instantes.
          </p>
          <p className="text-sm text-muted">
            Não foi redirecionado?{' '}
            <Link
              to="/"
              className="font-medium text-primary underline underline-offset-2"
            >
              Acesse aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
