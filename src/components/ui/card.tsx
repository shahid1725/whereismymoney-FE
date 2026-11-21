import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[1.35rem] border border-emerald-950/10 bg-white dark:border-emerald-200/10 dark:bg-[#0a211c]', className)} {...props} />
}
