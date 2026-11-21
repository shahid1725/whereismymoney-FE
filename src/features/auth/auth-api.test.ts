import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api-client'
import { authApi } from './auth-api'

describe('authApi', () => {
  afterEach(() => vi.restoreAllMocks())
  it('sends the documented login payload and endpoint', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { access: 'a', refresh: 'r' } })
    await expect(authApi.login({ email: 'john@example.com', password: 'strong-password' })).resolves.toEqual({ access: 'a', refresh: 'r' })
    expect(post).toHaveBeenCalledWith('/api/auth/login/', { email: 'john@example.com', password: 'strong-password' })
  })
  it('sends the documented register payload and endpoint', async () => {
    const payload = { name: 'John Doe', email: 'john@example.com', password: 'strong-password' }
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 1, name: payload.name, email: payload.email } })
    await authApi.register(payload)
    expect(post).toHaveBeenCalledWith('/api/auth/register/', payload)
  })
})
