const ACCESS_KEY = 'wimm.access'
const REFRESH_KEY = 'wimm.refresh'

export const tokenService = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
  hasSession: () => Boolean(localStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY))
}
