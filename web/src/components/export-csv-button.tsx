import { DownloadSimple } from '@phosphor-icons/react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { Button } from '@/components/common/button'
import { getApiErrorMessage } from '@/services/api'
import { exportLinksCsv } from '@/services/links-service'
import { cn } from '@/lib/utils'

type ExportCsvButtonProps = {
  disabled?: boolean
}

export function ExportCsvButton({ disabled }: ExportCsvButtonProps) {
  const mutation = useMutation({
    mutationFn: () => exportLinksCsv(),
    onSuccess: (data) => {
      window.open(data.reportUrl, '_blank', 'noopener,noreferrer')
      toast.success('Relatório CSV gerado')
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          'Não foi possível gerar o CSV. Verifique se o export está configurado no servidor.',
        ),
      )
    },
  })

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="w-full sm:w-auto"
      loading={mutation.isPending}
      disabled={disabled}
      onClick={() => mutation.mutate()}
    >
      <DownloadSimple
        className={cn('size-4', disabled && 'text-muted')}
        weight="bold"
        aria-hidden
      />
      Baixar CSV
    </Button>
  )
}
