export type Theme = 'light' | 'dark' | 'system'

export function getStoredTheme(): Theme {
  const value = localStorage.getItem('wimm.theme')
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('wimm.theme', theme)
}
