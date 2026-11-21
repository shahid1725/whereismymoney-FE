import { apiClient } from '../../lib/api-client'
import type { TokenPair, User } from '../../types/api'

export interface LoginInput { email: string; password: string }
export interface RegisterInput extends LoginInput { name: string }

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await apiClient.post<TokenPair>('/api/auth/login/', input)
    return data
  },
  async register(input: RegisterInput) {
    const { data } = await apiClient.post<User>('/api/auth/register/', input)
    return data
  },
  async me() {
    const { data } = await apiClient.get<User>('/api/auth/me/')
    return data
  }
}
