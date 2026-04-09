import { Spinner } from '@phosphor-icons/react'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { type VariantProps } from 'tailwind-variants'

import { buttonVariants } from '@/components/common/button-variants'
import { cn } from '@/lib/utils'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <Spinner className="size-5 animate-spin" aria-hidden />
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
