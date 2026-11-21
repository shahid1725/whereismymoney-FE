import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const currencyConfig = {
  locale: 'en-IN',
  currency: 'INR'
} as const

export function formatCurrency(value: number | string, options?: { sign?: boolean }) {
  const amount = typeof value === 'string' ? Number(value) : value
  const formatted = new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.currency,
    maximumFractionDigits: 2
  }).format(Math.abs(Number.isFinite(amount) ? amount : 0))
  if (!options?.sign || amount === 0) return formatted
  return `${amount > 0 ? '+' : '−'}${formatted}`
}

export function formatApiError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    if (typeof record.detail === 'string') return record.detail
    const first = Object.values(record)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
    if (typeof first === 'string') return first
  }
  return 'Something went wrong. Please try again.'
}
