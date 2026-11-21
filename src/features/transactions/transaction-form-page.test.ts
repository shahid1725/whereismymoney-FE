import { expect, it } from 'vitest'
import { validateCategoryType } from './transaction-form-page'

it('requires transaction and category types to match', () => {
  expect(validateCategoryType('expense', 'expense')).toBe(true)
  expect(validateCategoryType('income', 'expense')).toBe(false)
  expect(validateCategoryType(undefined, 'income')).toBe(false)
})
