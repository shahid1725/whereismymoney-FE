import { describe, expect, it } from 'vitest'
import type { ReportData } from './report-export'
import { createReportCsv, filterReportTransactions } from './report-export'

const data: ReportData = {
  user: { id: 1, name: 'Asha Rao', email: 'asha@example.com' },
  accounts: [{ id: 1, name: 'Main Bank', img: null }],
  categories: [{ id: 2, name: 'Food', icon: 'food', is_default: false, type: 'expense' }],
  budgets: [],
  transactions: [
    { id: 1, user: 1, account: 1, category: 2, type: 'expense', amount: '125.50', description: 'Lunch', date: '2026-11-21', created_at: '', updated_at: '' },
    { id: 2, user: 1, account: 1, category: 2, type: 'expense', amount: '80.00', description: 'Old lunch', date: '2026-10-21', created_at: '', updated_at: '' }
  ]
}

describe('report export', () => {
  it('filters transactions to the selected month', () => {
    expect(filterReportTransactions(data.transactions, { month: 11, year: 2026 })).toHaveLength(1)
  })

  it('creates a readable CSV with summary and resolved names', () => {
    const csv = createReportCsv(data, { month: 11, year: 2026 })
    expect(csv).toContain('"November 2026"')
    expect(csv).toContain('"Expenses","125.50"')
    expect(csv).toContain('"Lunch","Food","Main Bank"')
    expect(csv).not.toContain('Old lunch')
  })
})
