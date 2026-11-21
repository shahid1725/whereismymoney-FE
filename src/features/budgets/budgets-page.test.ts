import { describe, expect, it } from 'vitest'
import { toBudgetInput } from './budgets-page'

describe('budget input mapping', () => {
  it('creates an overall monthly budget with a null category', () => expect(toBudgetInput({ mode: 'overall', category: 3, amount: '5000', month: 11, year: 2026 })).toEqual({ category: null, amount: '5000', month: 11, year: 2026 }))
  it('creates a category budget with its category id', () => expect(toBudgetInput({ mode: 'category', category: 3, amount: '2000', month: 11, year: 2026 })).toEqual({ category: 3, amount: '2000', month: 11, year: 2026 }))
})
