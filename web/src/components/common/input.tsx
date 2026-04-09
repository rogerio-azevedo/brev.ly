import { Warning } from '@phosphor-icons/react'
import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'

const inputVariants = tv({
  base: 'w-full rounded-lg border bg-surface-elevated px-3 py-3.5 font-mono text-sm text-foreground shadow-sm transition-colors placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    error: {
      true: 'border-danger focus-visible:outline-danger',
      false: 'border-border focus-visible:outline-primary',
    },
  },
  defaultVariants: {
    error: false,
  },
})

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    errorMessage?: string
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, id: idProp, ...props }, ref) => {
    const uid = useId()
    const id = idProp ?? uid
    const errorId = `${id}-error`
    const hasError = Boolean(error) || Boolean(errorMessage)
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? errorId : undefined}
          className={cn(inputVariants({ error: hasError }), className)}
          {...props}
        />
        {errorMessage ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-danger" role="alert">
            <Warning className="size-3.5" weight="bold" />
            <p id={errorId} className="text-xs font-medium">
              {errorMessage}
            </p>
          </div>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
