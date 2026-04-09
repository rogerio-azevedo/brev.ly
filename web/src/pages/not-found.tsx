import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/common/button-variants'
import { cn } from '@/lib/utils'

export function NotFound() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-border px-3 py-8">
      <div className="flex max-w-[580px] flex-col items-center gap-6 rounded-lg bg-surface px-8 py-12 sm:px-12">
        <img
          src="/404.svg"
          alt=""
          className="h-20 w-48 max-w-full"
          width={192}
          height={80}
        />
        <h1 className="text-center text-xl font-semibold text-foreground-secondary">
          Link não encontrado
        </h1>
        <p className="text-center text-sm text-muted">
          O link que você está tentando acessar não existe, foi removido ou é
          uma URL inválida. Saiba mais em{' '}
          <Link
            to="/"
            className="font-medium text-primary underline underline-offset-2"
          >
            brev.ly
          </Link>
        </p>
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: 'primary' }),
            'inline-flex items-center justify-center no-underline',
          )}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
