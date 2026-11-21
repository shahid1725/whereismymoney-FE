import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenService } from './token-service'

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}


const baseURL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') || undefined

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { Accept: 'application/json' }
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenService.getRefresh()
  if (!refresh) throw new Error('No refresh token')
  const response = await axios.post<{ access: string }>(
    `${baseURL ?? ''}/api/auth/refresh/`,
    { refresh },
    { timeout: 15_000, headers: { 'Content-Type': 'application/json' } }
  )
  tokenService.setTokens(response.data.access)
  return response.data.access
}

apiClient.interceptors.request.use((config) => {
  const access = tokenService.getAccess()
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequestConfig | undefined
    const url = request?.url ?? ''
    const isAuthEndpoint = url.includes('/api/auth/login/') || url.includes('/api/auth/register/') || url.includes('/api/auth/refresh/')
    if (error.response?.status !== 401 || !request || request._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    request._retry = true
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const access = await refreshPromise
      request.headers.Authorization = `Bearer ${access}`
      return apiClient(request)
    } catch (refreshError) {
      tokenService.clear()
      window.dispatchEvent(new Event('auth:logout'))
      if (window.location.pathname !== '/login') window.location.assign('/login')
      return Promise.reject(refreshError)
    }
  }
)

export function resetRefreshStateForTests() {
  refreshPromise = null
}
