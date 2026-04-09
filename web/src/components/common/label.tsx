import { type LabelHTMLAttributes, forwardRef } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'

const labelVariants = tv({
  base: 'mb-1.5 block text-sm font-medium text-foreground-secondary',
  variants: {
    error: {
      true: 'text-danger',
      false: '',
    },
  },
  defaultVariants: {
    error: false,
  },
})

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> &
  VariantProps<typeof labelVariants>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants({ error }), className)}
      {...props}
    />
  ),
)

Label.displayName = 'Label'
