import { apiClient } from '../../lib/api-client'
import { assertOnline } from '../../lib/offline'
import type { Category, ListResponse, TransactionType } from '../../types/api'
import { unwrapList } from '../../types/api'

export interface CategoryInput { name: string; icon: string; type: TransactionType }

export const categoriesApi = {
  async list() {
    const { data } = await apiClient.get<ListResponse<Category>>('/api/categories/')
    return unwrapList(data)
  },
  async get(id: number) {
    const { data } = await apiClient.get<Category>(`/api/categories/${id}/`)
    return data
  },
  async create(input: CategoryInput) {
    assertOnline()
    const { data } = await apiClient.post<Category>('/api/categories/', input)
    return data
  },
  async update(id: number, input: CategoryInput) {
    assertOnline()
    const { data } = await apiClient.patch<Category>(`/api/categories/${id}/`, input)
    return data
  },
  async remove(id: number) {
    assertOnline()
    await apiClient.delete(`/api/categories/${id}/`)
  }
}
