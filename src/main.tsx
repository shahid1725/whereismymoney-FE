import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { App } from './app/App'
import { AuthProvider } from './features/auth/auth-context'
import { queryClient } from './lib/query-client'
import { PwaUpdater } from './components/pwa-updater'
import { applyTheme, getStoredTheme } from './lib/theme'
import './index.css'

applyTheme(getStoredTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <PwaUpdater />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
