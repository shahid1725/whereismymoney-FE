import { apiClient } from '../../lib/api-client'
import { assertOnline } from '../../lib/offline'
import type { Account, ListResponse } from '../../types/api'
import { unwrapList } from '../../types/api'

export interface AccountInput { name: string; img?: File | null }

function accountFormData(input: AccountInput) {
  const formData = new FormData()
  formData.append('name', input.name)
  if (input.img) formData.append('img', input.img)
  return formData
}

export const accountsApi = {
  async list() {
    const { data } = await apiClient.get<ListResponse<Account>>('/api/accounts/')
    return unwrapList(data)
  },
  async get(id: number) {
    const { data } = await apiClient.get<Account>(`/api/accounts/${id}/`)
    return data
  },
  async create(input: AccountInput) {
    assertOnline()
    const { data } = await apiClient.post<Account>('/api/accounts/', accountFormData(input))
    return data
  },
  async update(id: number, input: AccountInput) {
    assertOnline()
    const { data } = await apiClient.patch<Account>(`/api/accounts/${id}/`, accountFormData(input))
    return data
  },
  async remove(id: number) {
    assertOnline()
    await apiClient.delete(`/api/accounts/${id}/`)
  }
}
