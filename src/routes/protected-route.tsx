import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  if (auth.isRestoring) return <div className="grid min-h-screen place-items-center bg-[#f3f8f5] dark:bg-[#061713]"><div role="status" className="grid place-items-center gap-3 text-sm text-slate-500"><LoaderCircle className="size-7 animate-spin text-emerald-700 dark:text-emerald-300" />Restoring your session…</div></div>
  if (!auth.isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
