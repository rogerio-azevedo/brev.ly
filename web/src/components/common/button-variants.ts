import { tv } from 'tailwind-variants'

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary:
        'bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary',
      secondary:
        'border border-border bg-gray-200 text-foreground hover:bg-surface focus-visible:outline-border-strong',
      danger:
        'bg-danger text-white hover:opacity-90 focus-visible:outline-danger',
      ghost:
        'text-muted hover:bg-surface hover:text-foreground focus-visible:outline-border',
    },
    size: {
      md: 'min-h-11 px-4 py-2.5',
      sm: 'min-h-9 px-3 py-1.5 text-xs',
      icon: 'size-10 min-h-10 min-w-10 p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
