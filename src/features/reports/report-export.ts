import { format } from 'date-fns'
import type { Account, Budget, Category, Transaction, User } from '../../types/api'

export interface ReportData {
  user: User
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
}

export type ReportPeriod = { month: number; year: number } | null

function csvCell(value: string | number | null) {
  const text = value === null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function filterReportTransactions(transactions: Transaction[], period: ReportPeriod) {
  if (!period) return transactions
  return transactions.filter((item) => Number(item.date.slice(0, 4)) === period.year && Number(item.date.slice(5, 7)) === period.month)
}

export function createReportCsv(data: ReportData, period: ReportPeriod) {
  const categoryMap = new Map(data.categories.map((item) => [item.id, item.name]))
  const accountMap = new Map(data.accounts.map((item) => [item.id, item.name]))
  const transactions = filterReportTransactions(data.transactions, period)
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
  const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
  const rows: (string | number | null)[][] = [
    ['Where Is My Money? report'],
    ['Owner', data.user.name],
    ['Email', data.user.email],
    ['Period', period ? format(new Date(period.year, period.month - 1), 'MMMM yyyy') : 'All time'],
    ['Income', income.toFixed(2)],
    ['Expenses', expenses.toFixed(2)],
    ['Net cash flow', (income - expenses).toFixed(2)],
    [],
    ['Date', 'Type', 'Amount', 'Description', 'Category', 'Account'],
    ...transactions.map((item) => [item.date, item.type, item.amount, item.description, categoryMap.get(item.category) ?? 'Unknown', accountMap.get(item.account) ?? 'Unknown'])
  ]
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function createReportJson(data: ReportData, period: ReportPeriod) {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    period: period ?? 'all-time',
    user: data.user,
    accounts: data.accounts,
    categories: data.categories,
    transactions: filterReportTransactions(data.transactions, period),
    budgets: period ? data.budgets.filter((item) => item.month === period.month && item.year === period.year) : data.budgets
  }, null, 2)
}

export function downloadReport(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
