import { CircleDollarSign, FolderKanban, LayoutDashboard, LogOut, Plus, ReceiptText, Target, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useLocalProfile } from '../features/profile/profile-storage'
import { useOnlineStatus } from '../hooks/use-online-status'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/profile', label: 'Profile', icon: UserRound }
]

function Brand() {
  return <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#0d6b5b] text-white shadow-sm shadow-emerald-900/20 dark:bg-emerald-400 dark:text-emerald-950"><CircleDollarSign className="size-6" /></span><span><strong className="block leading-tight text-slate-950 dark:text-white">Where Is My Money?</strong><small className="text-slate-500 dark:text-emerald-100/60">Personal finance</small></span></div>
}

export function AppShell() {
  const auth = useAuth()
  const profile = useLocalProfile(auth.user)
  const navigate = useNavigate()
  const online = useOnlineStatus()
  return <div className="app-grid min-h-screen bg-[#f3f8f5] text-slate-900 dark:bg-[#061713] dark:text-slate-100">
    {!online && <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[70] bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-amber-950">You’re offline. Viewing is available, but changes are paused.</div>}
    <aside className={cn('fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-emerald-950/10 bg-white/95 p-6 backdrop-blur-xl lg:flex lg:flex-col dark:border-emerald-200/10 dark:bg-[#081d18]/95', !online && 'top-9')}>
      <Brand />
      <Button asChild className="mt-8"><NavLink to="/transactions/new"><Plus className="size-4" />Add transaction</NavLink></Button>
      <nav aria-label="Primary" className="mt-8 grid gap-1">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-300/10', isActive && 'bg-[#0d6b5b] text-white shadow-sm shadow-emerald-950/20 dark:bg-emerald-400 dark:text-emerald-950')}><Icon className="size-5" />{label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-emerald-950/10 pt-5 dark:border-emerald-200/10"><NavLink to="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-emerald-50 dark:hover:bg-emerald-300/10">{profile.image ? <img src={profile.image} alt="" className="size-10 rounded-xl object-cover" /> : <span className="grid size-10 place-items-center rounded-xl bg-[#0d6b5b] text-sm font-bold text-white dark:bg-emerald-400 dark:text-emerald-950">{profile.name.slice(0, 1).toUpperCase()}</span>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{profile.name}</span><span className="block truncate text-xs text-slate-500">{profile.email}</span></span></NavLink><Button className="mt-2 w-full justify-start" variant="ghost" onClick={() => { auth.logout(); navigate('/login') }}><LogOut className="size-4" />Sign out</Button></div>
    </aside>
    <div className={cn('lg:pl-72', !online && 'pt-9')}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-emerald-950/10 bg-white/85 px-4 backdrop-blur-xl lg:hidden dark:border-emerald-200/10 dark:bg-[#061713]/85"><Brand /><Button asChild size="icon" aria-label="Add transaction"><NavLink to="/transactions/new"><Plus className="size-5" /></NavLink></Button></header>
      <main className="page-enter mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-9 lg:pb-10"><Outlet /></main>
    </div>
    <nav aria-label="Mobile navigation" className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-emerald-950/10 bg-white/95 px-1 pt-2 backdrop-blur-xl lg:hidden dark:border-emerald-200/10 dark:bg-[#081d18]/95">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[0.7rem] font-semibold text-slate-500', isActive && 'text-emerald-700 dark:text-emerald-300')}><Icon className="size-5" /><span>{label}</span></NavLink>)}</nav>
  </div>
}
