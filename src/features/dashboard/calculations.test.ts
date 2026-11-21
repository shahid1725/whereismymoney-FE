import { describe, expect, it } from 'vitest'
import { calculateDashboard } from './calculations'
import type { Budget, Category, Transaction } from '../../types/api'

const base = { user: 1, created_at: '2026-11-21T00:00:00Z', updated_at: '2026-11-21T00:00:00Z' }
const transactions: Transaction[] = [
  { ...base, id: 1, category: 1, account: 1, type: 'income', amount: '50000.00', description: 'Salary', date: '2026-11-01' },
  { ...base, id: 2, category: 2, account: 1, type: 'expense', amount: '5000.00', description: 'Food', date: '2026-11-05' },
  { ...base, id: 3, category: 2, account: 1, type: 'expense', amount: '1000.00', description: 'Old', date: '2026-10-05' }
]
const categories: Category[] = [{ id: 1, name: 'Salary', icon: 'wallet', is_default: false, type: 'income' }, { id: 2, name: 'Food', icon: 'food', is_default: false, type: 'expense' }]
const budgets: Budget[] = [{ ...base, id: 1, category: null, amount: '10000.00', month: 11, year: 2026 }]

describe('dashboard calculations', () => {
  it('calculates selected-month metrics without fake data', () => {
    const result = calculateDashboard(transactions, budgets, categories, 11, 2026)
    expect(result.balance).toBe(44000)
    expect(result.income).toBe(50000)
    expect(result.expenses).toBe(5000)
    expect(result.cashFlow).toBe(45000)
    expect(result.totalBudget).toBe(10000)
    expect(result.categorySpending).toEqual([{ name: 'Food', value: 5000 }])
  })
})
