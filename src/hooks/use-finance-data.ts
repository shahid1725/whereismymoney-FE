import { useQuery } from '@tanstack/react-query'
import { accountsApi } from '../features/accounts/accounts-api'
import { budgetsApi } from '../features/budgets/budgets-api'
import { categoriesApi } from '../features/categories/categories-api'
import { transactionsApi } from '../features/transactions/transactions-api'
import { queryKeys } from '../lib/query-client'

export const useAccounts = () => useQuery({ queryKey: queryKeys.accounts, queryFn: accountsApi.list })
export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: categoriesApi.list })
export const useTransactions = () => useQuery({ queryKey: queryKeys.transactions, queryFn: transactionsApi.list })
export const useBudgets = () => useQuery({ queryKey: queryKeys.budgets, queryFn: budgetsApi.list })
