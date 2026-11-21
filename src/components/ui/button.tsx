import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#0d6b5b] text-white hover:bg-[#095c4e] dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300',
        secondary: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
        danger: 'bg-rose-600 text-white hover:bg-rose-700'
      },
      size: { default: 'h-11', sm: 'min-h-9 px-3 text-sm', icon: 'size-11 p-0' }
    },
    defaultVariants: { variant: 'primary', size: 'default' }
  }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
