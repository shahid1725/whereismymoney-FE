import axios from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { formatApiError } from './utils'

type ApiErrorBody = Record<string, string | string[] | undefined>

export function getErrorMessage(error: unknown): string {
  if (!navigator.onLine) return 'You are offline. Reconnect to continue.'
  if (!axios.isAxiosError(error)) return formatApiError(error)
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (!error.response) return 'The server is unavailable. Check your connection and try again.'
  const status = error.response.status
  const body = error.response.data
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'The requested item could not be found.'
  if (status >= 500) return 'The server had a problem. Please try again shortly.'
  return formatApiError(body)
}

export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  if (!axios.isAxiosError<ApiErrorBody>(error) || error.response?.status !== 400 || !error.response.data) return false
  let mapped = false
  Object.entries(error.response.data).forEach(([field, messages]) => {
    if (field === 'detail' || messages === undefined) return
    const message = Array.isArray(messages) ? messages[0] : messages
    if (message) {
      setError(field as Path<T>, { type: 'server', message })
      mapped = true
    }
  })
  return mapped
}
