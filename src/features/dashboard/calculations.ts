import { format, parseISO } from 'date-fns'
import type { Account, Budget, Category, Transaction } from '../../types/api'

export interface DashboardMetrics {
  balance: number
  income: number
  expenses: number
  cashFlow: number
  totalBudget: number
  budgetSpent: number
  categorySpending: { name: string; value: number }[]
  dailyFlow: { date: string; income: number; expense: number }[]
}

export function calculateDashboard(transactions: Transaction[], budgets: Budget[], categories: Category[], month: number, year: number): DashboardMetrics {
  const monthTransactions = transactions.filter((item) => {
    const date = parseISO(item.date)
    return date.getMonth() + 1 === month && date.getFullYear() === year
  })
  const income = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
  const expenses = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
  const balance = transactions.reduce((sum, item) => sum + Number(item.amount) * (item.type === 'income' ? 1 : -1), 0)
  const monthBudgets = budgets.filter((item) => item.month === month && item.year === year)
  const overall = monthBudgets.find((item) => item.category === null)
  const totalBudget = Number(overall?.amount ?? monthBudgets.reduce((sum, item) => sum + Number(item.amount), 0))
  const categoryMap = new Map(categories.map((item) => [item.id, item.name]))
  const spendingMap = new Map<string, number>()
  monthTransactions.filter((item) => item.type === 'expense').forEach((item) => {
    const name = categoryMap.get(item.category) ?? 'Other'
    spendingMap.set(name, (spendingMap.get(name) ?? 0) + Number(item.amount))
  })
  const dayMap = new Map<string, { date: string; income: number; expense: number }>()
  monthTransactions.forEach((item) => {
    const label = format(parseISO(item.date), 'd MMM')
    const current = dayMap.get(item.date) ?? { date: label, income: 0, expense: 0 }
    current[item.type] += Number(item.amount)
    dayMap.set(item.date, current)
  })
  return {
    balance,
    income,
    expenses,
    cashFlow: income - expenses,
    totalBudget,
    budgetSpent: expenses,
    categorySpending: [...spendingMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    dailyFlow: [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value)
  }
}

export function accountBalances(accounts: Account[], transactions: Transaction[]) {
  return accounts.map((account) => ({ ...account, balance: transactions.filter((item) => item.account === account.id).reduce((sum, item) => sum + Number(item.amount) * (item.type === 'income' ? 1 : -1), 0) }))
}
