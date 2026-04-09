import { LinkIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'

import { LinkRow } from '@/components/link-row'
import { linkQueryKeys } from '@/lib/query-keys'
import { getApiErrorMessage } from '@/services/api'
import { listLinks } from '@/services/links-service'

export const LINK_LIST_PAGE_SIZE = 200

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Carregando links">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          {i > 0 ? <div className="h-px w-full bg-border" aria-hidden /> : null}
          <div className="h-14 animate-pulse rounded bg-border/60" />
        </div>
      ))}
    </div>
  )
}

export function LinkList() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: linkQueryKeys.list(1, LINK_LIST_PAGE_SIZE),
    queryFn: () =>
      listLinks({
        page: 1,
        pageSize: LINK_LIST_PAGE_SIZE,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      }),
  })

  if (isPending) {
    return <ListSkeleton />
  }

  if (isError) {
    return (
      <div
        className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center"
        role="alert"
      >
        <p className="text-sm font-medium text-danger">
          {getApiErrorMessage(error, 'Erro ao carregar links')}
        </p>
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-primary underline"
          onClick={() => void refetch()}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const links = data.links

  if (links.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center text-center">
        <div className="mb-4 h-px w-full bg-border" aria-hidden />
        <LinkIcon
          className="mb-3 mt-8 size-8 text-muted"
          aria-hidden
        />
        <p className="mb-6 text-xs font-normal uppercase tracking-wide text-muted">
          Ainda não existem links cadastrados
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isFetching && !isPending ? (
        <p className="mb-2 text-xs text-muted" aria-live="polite">
          Atualizando lista…
        </p>
      ) : null}
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.id} className="mt-4 flex flex-col">
            <div className="mb-4 h-px w-full bg-border" aria-hidden />
            <LinkRow link={link} />
          </li>
        ))}
      </ul>
      {data.total > links.length ? (
        <p className="mt-4 text-center text-xs text-muted">
          Exibindo {links.length} de {data.total} links. Aumente o page size na
          listagem para ver todos.
        </p>
      ) : null}
    </div>
  )
}
