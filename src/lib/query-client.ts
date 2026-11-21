import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false }
  }
})

export const queryKeys = {
  me: ['auth', 'me'] as const,
  accounts: ['accounts'] as const,
  categories: ['categories'] as const,
  transactions: ['transactions'] as const,
  budgets: ['budgets'] as const
}
