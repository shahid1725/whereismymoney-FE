import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { queryKeys } from '../../lib/query-client'
import { tokenService } from '../../lib/token-service'
import type { User } from '../../types/api'
import { authApi } from './auth-api'

interface AuthContextValue {
  user: User | null
  isRestoring: boolean
  isAuthenticated: boolean
  setSession: (access: string, refresh: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const me = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    enabled: tokenService.hasSession(),
    retry: false
  })

  const logout = () => {
    tokenService.clear()
    queryClient.removeQueries({ queryKey: queryKeys.me })
  }

  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  })

  const value = useMemo<AuthContextValue>(() => ({
    user: me.data ?? null,
    isRestoring: tokenService.hasSession() && me.isLoading,
    isAuthenticated: Boolean(me.data),
    async setSession(access, refresh) {
      tokenService.setTokens(access, refresh)
      await me.refetch()
    },
    logout
  }), [me.data, me.isLoading, queryClient])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
