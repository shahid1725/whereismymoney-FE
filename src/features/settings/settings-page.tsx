import { Download, LogOut, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useAuth } from '../auth/auth-context'
import { useInstallPrompt } from '../../hooks/use-install-prompt'
import { applyTheme, getStoredTheme } from '../../lib/theme'

export function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme() === 'dark' ? 'dark' : 'light')
  const auth = useAuth(); const navigate = useNavigate(); const installer = useInstallPrompt()
  useEffect(() => { applyTheme(theme) }, [theme])
  return <div className="grid gap-7"><PageHeader eyebrow="Preferences" title="Settings" description="Choose how the app looks, install it on this device, or manage your session." />
    <div className="grid gap-5 lg:grid-cols-2"><Card className="p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Palette className="size-5" /></span><div><h2 className="font-bold">Appearance</h2><p className="text-sm text-slate-500">Choose a clean white or dark interface</p></div></div><div className="mt-5 grid grid-cols-2 gap-3">{([{ value: 'light', label: 'White', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }] as const).map(({ value, label, icon: Icon }) => <button type="button" key={value} aria-pressed={theme === value} onClick={() => setTheme(value)} className={`grid min-h-28 place-items-center rounded-2xl border p-3 text-sm font-semibold ${theme === value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-slate-200 hover:bg-emerald-50 dark:border-emerald-200/10 dark:hover:bg-emerald-300/10'}`}><Icon className="size-5" />{label}</button>)}</div></Card>
      <Card className="p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Download className="size-5" /></span><div><h2 className="font-bold">Install the app</h2><p className="text-sm text-slate-500">Get a focused, full-screen experience</p></div></div><p className="mt-5 text-sm text-slate-600 dark:text-slate-300">Install Where Is My Money? from a supported browser. Your secure financial requests are never stored by the service worker.</p><Button className="mt-4" variant="secondary" disabled={!installer.canInstall} onClick={async () => { const installed = await installer.install(); if (installed) toast.success('App installed') }}>{installer.canInstall ? 'Install app' : 'Already installed or not supported'}</Button></Card>
      <Card className="p-6"><h2 className="font-bold">Currency</h2><p className="mt-1 text-sm text-slate-500">Formatting is currently configured for India.</p><dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800"><div><dt className="text-slate-500">Locale</dt><dd className="mt-1 font-semibold">en-IN</dd></div><div><dt className="text-slate-500">Currency</dt><dd className="mt-1 font-semibold">INR (₹)</dd></div></dl></Card>
      <Card className="p-6"><h2 className="font-bold">Account session</h2><p className="mt-1 text-sm text-slate-500">Signed in as {auth.user?.email}</p><Button className="mt-5" variant="danger" onClick={() => { auth.logout(); navigate('/login') }}><LogOut className="size-4" />Sign out on this device</Button></Card>
    </div>
  </div>
}
