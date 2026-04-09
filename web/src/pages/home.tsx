import { useQuery } from '@tanstack/react-query'

import { AppLogo } from '@/components/app-logo'
import { CreateLinkForm } from '@/components/create-link-form'
import { ExportCsvButton } from '@/components/export-csv-button'
import { LinkList, LINK_LIST_PAGE_SIZE } from '@/components/link-list'
import { linkQueryKeys } from '@/lib/query-keys'
import { listLinks } from '@/services/links-service'

export function Home() {
  const { data } = useQuery({
    queryKey: linkQueryKeys.list(1, LINK_LIST_PAGE_SIZE),
    queryFn: () =>
      listLinks({
        page: 1,
        pageSize: LINK_LIST_PAGE_SIZE,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      }),
  })

  const noLinks = !data || data.links.length === 0

  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden px-3 py-4 lg:max-h-none lg:min-h-dvh lg:h-auto lg:justify-center lg:overflow-visible lg:py-20">
      <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 lg:self-center lg:gap-8">
        <div className="flex shrink-0 justify-center lg:justify-start">
          <AppLogo />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-5 lg:grid-cols-[2fr_3fr] lg:grid-rows-1 lg:items-start">
          <div className="min-w-0 shrink-0">
            <CreateLinkForm />
          </div>

          <section
            aria-labelledby="links-heading"
            className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-surface p-6 lg:h-fit lg:max-h-[700px] lg:p-8"
          >
            <div className="mb-5 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="links-heading"
                className="font-sans text-lg font-bold text-foreground-secondary"
              >
                Meus links
              </h2>
              <ExportCsvButton disabled={noLinks} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <LinkList />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
