import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient, resetRefreshStateForTests } from './api-client'
import { tokenService } from './token-service'

function response(config: InternalAxiosRequestConfig, status = 200): AxiosResponse {
  return { data: {}, status, statusText: status === 200 ? 'OK' : 'Unauthorized', headers: {}, config }
}

describe('API authentication', () => {
  afterEach(() => { vi.restoreAllMocks(); tokenService.clear(); resetRefreshStateForTests() })
  it('attaches the access token', async () => {
    tokenService.setTokens('access-token', 'refresh-token')
    const result = await apiClient.get('/api/accounts/', { adapter: async (config) => response(config) })
    expect(result.config.headers.Authorization).toBe('Bearer access-token')
  })
  it('refreshes once and retries the original request', async () => {
    tokenService.setTokens('expired', 'refresh-token')
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { access: 'fresh' } })
    let calls = 0
    const result = await apiClient.get('/api/accounts/', { adapter: async (config) => {
      calls += 1
      if (calls === 1) throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, response(config, 401))
      return response(config)
    } })
    expect(calls).toBe(2)
    expect(result.config.headers.Authorization).toBe('Bearer fresh')
  })
  it('clears tokens when refresh fails', async () => {
    tokenService.setTokens('expired', 'expired-refresh')
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh expired'))
    const assign = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { pathname: '/login', assign } })
    const headers = new AxiosHeaders()
    const config = { headers, url: '/api/accounts/', method: 'get' } as InternalAxiosRequestConfig
    await expect(apiClient.get('/api/accounts/', { adapter: async () => { throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, response(config, 401)) } })).rejects.toThrow('refresh expired')
    expect(tokenService.hasSession()).toBe(false)
  })
})
