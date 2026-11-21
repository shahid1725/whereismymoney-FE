export type TransactionType = 'income' | 'expense'

export interface User {
  id: number
  name: string
  email: string
}

export interface Account {
  id: number
  name: string
  img: string | null
}

export interface Category {
  id: number
  name: string
  icon: string
  is_default: boolean
  type: TransactionType
}

export interface Transaction {
  id: number
  category: number
  account: number
  user: number
  type: TransactionType
  amount: string
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: number
  user: number
  category: number | null
  amount: string
  month: number
  year: number
  created_at: string
  updated_at: string
}

export interface TokenPair {
  refresh: string
  access: string
}

export type ListResponse<T> = T[] | { results: T[] }

export function unwrapList<T>(value: ListResponse<T>): T[] {
  return Array.isArray(value) ? value : value.results
}
