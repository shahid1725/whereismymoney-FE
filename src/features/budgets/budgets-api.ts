import { apiClient } from '../../lib/api-client'
import { assertOnline } from '../../lib/offline'
import type { Budget, ListResponse } from '../../types/api'
import { unwrapList } from '../../types/api'

export interface BudgetInput {
  category: number | null
  amount: string
  month: number
  year: number
}

export const budgetsApi = {
  async list() {
    const { data } = await apiClient.get<ListResponse<Budget>>('/api/budgets/')
    return unwrapList(data)
  },
  async get(id: number) {
    const { data } = await apiClient.get<Budget>(`/api/budgets/${id}/`)
    return data
  },
  async create(input: BudgetInput) {
    assertOnline()
    const { data } = await apiClient.post<Budget>('/api/budgets/', input)
    return data
  },
  async update(id: number, input: BudgetInput) {
    assertOnline()
    const { data } = await apiClient.patch<Budget>(`/api/budgets/${id}/`, input)
    return data
  },
  async remove(id: number) {
    assertOnline()
    await apiClient.delete(`/api/budgets/${id}/`)
  }
}
