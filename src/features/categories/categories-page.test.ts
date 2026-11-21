import { describe, expect, it } from 'vitest'
import type { Category } from '../../types/api'
import { categoriesForType } from './categories-page'

const categories: Category[] = [
  { id: 1, name: 'Salary', icon: 'wallet', is_default: false, type: 'income' },
  { id: 2, name: 'Food', icon: 'food', is_default: false, type: 'expense' }
]

it('filters categories by transaction type', () => {
  expect(categoriesForType(categories, 'expense').map((item) => item.name)).toEqual(['Food'])
  expect(categoriesForType(categories, 'income').map((item) => item.name)).toEqual(['Salary'])
})
