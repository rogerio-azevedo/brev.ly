import { Copy, Trash } from '@phosphor-icons/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { Button } from '@/components/common/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { buildShortLinkUrl } from '@/lib/short-url'
import { getApiErrorMessage, isAxiosApiError } from '@/services/api'
import { deleteLink, incrementLinkAccess } from '@/services/links-service'
import type { Link } from '@/types/link'

const accessFormatter = new Intl.NumberFormat('pt-BR')

function formatAccessCount(count: number): string {
  if (count === 1) return '1 acesso'
  return `${accessFormatter.format(count)} acessos`
}

type LinkRowProps = {
  link: Link
  onRefetch: () => void
}

export function LinkRow({ link, onRefetch }: LinkRowProps) {
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const shortHref = buildShortLinkUrl(link.shortUrl)

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink(link.shortUrl),
    onSuccess: () => {
      toast.success('Link removido')
      setConfirmOpen(false)
    },
    onError: (err) => {
      if (isAxiosApiError(err) && err.response?.status === 404) {
        toast.success('Link removido')
        setConfirmOpen(false)
        return
      }
      toast.error(getApiErrorMessage(err, 'Não foi possível remover o link'))
    },
    onSettled: () => {
      onRefetch()
    },
  })

  async function handleLinkClick(e: React.MouseEvent) {
    e.preventDefault()

    try {
      await incrementLinkAccess(link.shortUrl)

      window.open(link.originalUrl, '_blank', 'noreferrer')

      onRefetch()
    } catch {
      window.open(shortHref, '_blank', 'noreferrer')
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortHref)
      setCopied(true)
      toast.success('Copiado para a área de transferência')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 max-w-[50%] flex-1 flex-col gap-1 sm:max-w-none">
          <p className="truncate text-sm font-semibold text-primary">
            <a
              href={shortHref}
              onClick={handleLinkClick}
              className="hover:underline"
            >
              {shortHref}
            </a>
          </p>
          <p
            className="truncate text-xs text-muted"
            title={link.originalUrl}
          >
            {link.originalUrl}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-sm text-muted">{formatAccessCount(link.accessCount)}</p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => void handleCopy()}
              aria-label={copied ? 'Copiado' : 'Copiar link encurtado'}
            >
              <Copy className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              aria-label="Remover link"
            >
              <Trash className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir link"
        description="Você tem certeza que deseja excluir o link?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  )
}
