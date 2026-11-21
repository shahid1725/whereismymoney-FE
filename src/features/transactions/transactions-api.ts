import { apiClient } from '../../lib/api-client'
import { assertOnline } from '../../lib/offline'
import type { ListResponse, Transaction, TransactionType } from '../../types/api'
import { unwrapList } from '../../types/api'

export interface TransactionInput {
  category: number
  account: number
  type: TransactionType
  amount: string
  description: string
  date: string
}

export const transactionsApi = {
  async list() {
    const { data } = await apiClient.get<ListResponse<Transaction>>('/api/transactions/')
    return unwrapList(data)
  },
  async get(id: number) {
    const { data } = await apiClient.get<Transaction>(`/api/transactions/${id}/`)
    return data
  },
  async create(input: TransactionInput) {
    assertOnline()
    const { data } = await apiClient.post<Transaction>('/api/transactions/', input)
    return data
  },
  async update(id: number, input: TransactionInput) {
    assertOnline()
    const { data } = await apiClient.patch<Transaction>(`/api/transactions/${id}/`, input)
    return data
  },
  async remove(id: number) {
    assertOnline()
    await apiClient.delete(`/api/transactions/${id}/`)
  }
}
