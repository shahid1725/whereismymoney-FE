import { cn, formatCurrency } from '../lib/utils'

export function CurrencyAmount({ amount, type, className }: { amount: number | string; type?: 'income' | 'expense' | 'neutral'; className?: string }) {
  const numeric = Number(amount) * (type === 'expense' ? -1 : 1)
  return <span className={cn('tabular-nums', type === 'income' && 'text-emerald-600 dark:text-emerald-400', type === 'expense' && 'text-rose-600 dark:text-rose-400', className)}>{formatCurrency(numeric, { sign: Boolean(type && type !== 'neutral') })}</span>
}
