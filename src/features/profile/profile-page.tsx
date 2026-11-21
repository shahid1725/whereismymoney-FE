import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Download, ImagePlus, LogOut, Mail, Moon, Settings, Sun, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input } from '../../components/ui/form-controls'
import { useAccounts } from '../../hooks/use-finance-data'
import { applyTheme, getStoredTheme } from '../../lib/theme'
import { useAuth } from '../auth/auth-context'
import { ReportExportDialog } from '../reports/report-export-dialog'
import { getLocalProfile, saveLocalProfile, useLocalProfile } from './profile-storage'

const schema = z.object({ name: z.string().trim().min(2, 'Enter at least 2 characters'), email: z.email('Enter a valid email address'), image: z.string().nullable() })
type ProfileForm = z.infer<typeof schema>

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
}

export function ProfileAvatar({ className = 'size-12' }: { className?: string }) {
  const auth = useAuth(); const profile = useLocalProfile(auth.user)
  return profile.image ? <img src={profile.image} alt="" className={`${className} rounded-2xl object-cover`} /> : <span className={`${className} grid place-items-center rounded-2xl bg-[#0d6b5b] text-sm font-bold text-white dark:bg-emerald-400 dark:text-emerald-950`}>{initials(profile.name)}</span>
}

export function ProfilePage() {
  const auth = useAuth(); const navigate = useNavigate(); const accounts = useAccounts(); const profile = useLocalProfile(auth.user)
  const [exportOpen, setExportOpen] = useState(false)
  const [quickTheme, setQuickTheme] = useState<'light' | 'dark'>(() => getStoredTheme() === 'dark' ? 'dark' : 'light')
  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<ProfileForm>({ resolver: zodResolver(schema), defaultValues: profile })
  useEffect(() => reset(getLocalProfile(auth.user)), [auth.user, reset])
  const image = watch('image')
  const user = auth.user
  if (!user) return null
  return <div className="grid gap-7"><PageHeader eyebrow="Your space" title="Profile" description="Personalize your experience, manage accounts and take your data with you." actions={<Button onClick={() => setExportOpen(true)}><Download className="size-4" />Export report</Button>} />
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="overflow-hidden"><div className="line-grid-dark relative min-h-40 border-b border-emerald-200/10 bg-[#08231d] p-6 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(52,211,153,0.24),transparent_45%)]" /><div className="relative flex items-end gap-4 pt-10"><ProfileAvatar className="size-20" /><div className="min-w-0"><h2 className="truncate text-xl font-bold">{profile.name}</h2><p className="mt-1 flex items-center gap-2 truncate text-sm text-emerald-50/70"><Mail className="size-4" />{profile.email}</p></div></div></div><div className="p-5"><p className="text-sm leading-relaxed text-slate-500">Your photo, display name and contact email are saved only on this device. Your server login remains <strong className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</strong> because the current API is read-only.</p></div></Card>
      <Card className="p-5 sm:p-6"><div className="mb-5"><h2 className="text-lg font-bold">Personal details</h2><p className="text-sm text-slate-500">Used to personalize this browser.</p></div><form className="grid gap-5" onSubmit={handleSubmit(async (values) => { saveLocalProfile(user.id, values); toast.success('Profile updated on this device') })}>
        <div className="flex items-center gap-4"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">{image ? <img src={image} alt="Profile preview" className="size-full object-cover" /> : <UserRound className="size-8 text-slate-400" />}</div><label className="cursor-pointer"><span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5"><ImagePlus className="size-4" />Choose photo</span><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 1_000_000) { setError('image', { message: 'Use an image smaller than 1 MB.' }); return } const reader = new FileReader(); reader.onload = () => setValue('image', typeof reader.result === 'string' ? reader.result : null, { shouldDirty: true }); reader.readAsDataURL(file) }} /></label>{image && <Button type="button" variant="ghost" onClick={() => setValue('image', null)}>Remove</Button>}</div>
        {errors.image?.message && <p role="alert" className="text-sm text-rose-600">{errors.image.message}</p>}
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Display name" error={errors.name?.message}><Input autoComplete="name" {...register('name')} /></Field><Field label="Contact email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></Field></div>
        <div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>Save profile</Button></div>
      </form></Card>
    </div>
    <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Accounts</h2><p className="text-sm text-slate-500">Banks, cards and cash connected to your transactions.</p></div><Button asChild variant="secondary" size="sm"><Link to="/accounts">Manage accounts</Link></Button></div>{accounts.isLoading ? <LoadingSkeleton rows={2} /> : accounts.error ? <ErrorState message="Accounts are unavailable right now." onRetry={() => void accounts.refetch()} /> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(accounts.data ?? []).slice(0, 4).map((account) => <Card key={account.id} className="flex items-center gap-3 p-4">{account.img ? <img src={account.img} alt="" className="size-11 rounded-xl object-cover" /> : <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><CreditCard className="size-5" /></span>}<div className="min-w-0"><p className="truncate font-semibold">{account.name}</p><p className="text-sm text-slate-500">Account</p></div></Card>)}<Link to="/accounts" className="grid min-h-20 place-items-center rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-emerald-200/15 dark:text-slate-300 dark:hover:text-emerald-300">+ Add or manage</Link></div>}</section>
    <div className="grid gap-4 md:grid-cols-3"><Card className="p-5"><Settings className="size-5 text-emerald-700 dark:text-emerald-300" /><h2 className="mt-4 font-bold">Settings</h2><p className="mt-1 text-sm text-slate-500">Currency, installation and appearance.</p><Button asChild className="mt-4" size="sm" variant="secondary"><Link to="/settings">Open settings</Link></Button></Card><Card className="p-5"><div className="flex gap-2"><button type="button" aria-label="Use light theme" aria-pressed={quickTheme === 'light'} onClick={() => { setQuickTheme('light'); applyTheme('light'); toast.success('Light theme applied') }} className={`grid size-10 place-items-center rounded-xl border ${quickTheme === 'light' ? 'border-emerald-500 text-emerald-700' : 'border-slate-200 dark:border-emerald-200/10'}`}><Sun className="size-5" /></button><button type="button" aria-label="Use dark theme" aria-pressed={quickTheme === 'dark'} onClick={() => { setQuickTheme('dark'); applyTheme('dark'); toast.success('Dark theme applied') }} className={`grid size-10 place-items-center rounded-xl border ${quickTheme === 'dark' ? 'border-emerald-500 text-emerald-500' : 'border-slate-200 dark:border-emerald-200/10'}`}><Moon className="size-5" /></button></div><h2 className="mt-4 font-bold">Light or dark</h2><p className="mt-1 text-sm text-slate-500">Switch instantly, or fine-tune it in settings.</p></Card><Card className="p-5"><LogOut className="size-5 text-rose-500" /><h2 className="mt-4 font-bold">Sign out</h2><p className="mt-1 text-sm text-slate-500">Clear your secure session on this device.</p><Button className="mt-4" size="sm" variant="danger" onClick={() => { auth.logout(); navigate('/login') }}><LogOut className="size-4" />Sign out</Button></Card></div>
    <ReportExportDialog user={user} open={exportOpen} onOpenChange={setExportOpen} />
  </div>
}
