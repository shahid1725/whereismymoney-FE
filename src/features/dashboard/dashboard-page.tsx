import { format, parseISO } from 'date-fns'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Download, Plus, Target, TrendingUp, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CurrencyAmount } from '../../components/currency-amount'
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Select } from '../../components/ui/form-controls'
import { useAccounts, useBudgets, useCategories, useTransactions } from '../../hooks/use-finance-data'
import { formatCurrency } from '../../lib/utils'
import { CategoryIcon } from '../categories/icon-registry'
import { accountBalances, calculateDashboard } from './calculations'
import { useAuth } from '../auth/auth-context'
import { ReportExportDialog } from '../reports/report-export-dialog'

const chartColors = ['#0d6b5b', '#34d399', '#84cc16', '#0ea5a4', '#f59e0b', '#64748b']

export function DashboardPage() {
  const now = new Date()
  const auth = useAuth()
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [exportOpen, setExportOpen] = useState(false)
  const [year, month] = period.split('-').map(Number) as [number, number]
  const accounts = useAccounts(); const categories = useCategories(); const transactions = useTransactions(); const budgets = useBudgets()
  const loading = accounts.isLoading || categories.isLoading || transactions.isLoading || budgets.isLoading
  const error = accounts.error || categories.error || transactions.error || budgets.error
  const metrics = useMemo(() => calculateDashboard(transactions.data ?? [], budgets.data ?? [], categories.data ?? [], month, year), [transactions.data, budgets.data, categories.data, month, year])
  const balances = useMemo(() => accountBalances(accounts.data ?? [], transactions.data ?? []), [accounts.data, transactions.data])
  const recent = [...(transactions.data ?? [])].sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)).slice(0, 5)
  const categoryMap = new Map((categories.data ?? []).map((item) => [item.id, item]))
  const budgetPercent = metrics.totalBudget > 0 ? Math.round((metrics.budgetSpent / metrics.totalBudget) * 100) : 0
  if (loading) return <div className="grid gap-6"><LoadingSkeleton rows={1} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><LoadingSkeleton rows={4} /></div></div>
  if (error) return <ErrorState message="Your dashboard data is temporarily unavailable." onRetry={() => { void accounts.refetch(); void categories.refetch(); void transactions.refetch(); void budgets.refetch() }} />

  const summaries = [
    { label: 'Total balance', value: metrics.balance, icon: WalletCards, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
    { label: 'Income', value: metrics.income, icon: ArrowDownLeft, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
    { label: 'Expenses', value: metrics.expenses, icon: ArrowUpRight, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
    { label: 'Net cash flow', value: metrics.cashFlow, icon: TrendingUp, tone: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300' }
  ]
  return <div className="grid gap-7">
    <PageHeader eyebrow="Money overview" title="Your finances, at a glance" description="Live totals calculated from your accounts, transactions and budgets." actions={<><Select aria-label="Dashboard month" value={period} onChange={(event) => setPeriod(event.target.value)}>{Array.from({ length: 12 }, (_, offset) => { const date = new Date(now.getFullYear(), now.getMonth() - offset, 1); const value = format(date, 'yyyy-MM'); return <option key={value} value={value}>{format(date, 'MMMM yyyy')}</option> })}</Select><Button variant="secondary" onClick={() => setExportOpen(true)}><Download className="size-4" />Export</Button><Button asChild><Link to="/transactions/new"><Plus className="size-4" />Quick add</Link></Button></>} />
    <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, value, icon: Icon, tone }) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span></div><CurrencyAmount amount={value} className="mt-4 block text-2xl font-bold tracking-tight text-slate-950 dark:text-white" /><p className="mt-1 text-xs text-slate-500">{label === 'Total balance' ? 'Across all recorded activity' : format(new Date(year, month - 1), 'MMMM yyyy')}</p></Card>)}</section>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
      <Card className="p-5 sm:p-6"><div className="mb-5"><h2 className="text-lg font-bold">Income vs expense</h2><p className="text-sm text-slate-500">Daily movement this month</p></div><div className="h-72" role="img" aria-label={`Daily income and expenses. Income ${formatCurrency(metrics.income)}, expenses ${formatCurrency(metrics.expenses)}.`}>{metrics.dailyFlow.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={metrics.dailyFlow}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} /><XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Legend /><Bar dataKey="income" name="Income" fill="#059669" radius={[5,5,0,0]} /><Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-500">No transactions for this month yet.</div>}</div></Card>
      <Card className="p-5 sm:p-6"><div className="mb-3 flex items-start justify-between"><div><h2 className="text-lg font-bold">Monthly budget</h2><p className="text-sm text-slate-500">Total spending progress</p></div><Target className="size-5 text-emerald-700 dark:text-emerald-300" /></div>{metrics.totalBudget > 0 ? <><div className="mt-6 flex items-end justify-between"><CurrencyAmount amount={metrics.budgetSpent} className="text-2xl font-bold" /><span className="text-sm text-slate-500">of {formatCurrency(metrics.totalBudget)}</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-950/5 dark:bg-emerald-200/10"><div className={`h-full rounded-full ${budgetPercent >= 100 ? 'bg-rose-500' : budgetPercent >= 90 ? 'bg-orange-500' : budgetPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span className="font-semibold">{budgetPercent}% used</span><span className="text-slate-500">{formatCurrency(Math.max(metrics.totalBudget - metrics.budgetSpent, 0))} left</span></div></> : <div className="grid min-h-48 place-items-center text-center"><div><p className="font-semibold">No monthly budget yet</p><p className="mt-1 text-sm text-slate-500">Set a limit to track progress here.</p><Button asChild size="sm" variant="secondary" className="mt-4"><Link to="/budgets">Set budget</Link></Button></div></div>}</Card>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-bold">Spending by category</h2><p className="text-sm text-slate-500">Where this month’s expenses went</p><div className="h-72" role="img" aria-label={metrics.categorySpending.map((item) => `${item.name}: ${formatCurrency(item.value)}`).join(', ') || 'No category spending'}>{metrics.categorySpending.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={metrics.categorySpending} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>{metrics.categorySpending.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Legend /></PieChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-500">No expense data to chart.</div>}</div></Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent transactions</h2><p className="text-sm text-slate-500">Your latest activity</p></div><Button asChild size="sm" variant="ghost"><Link to="/transactions">View all</Link></Button></div>{recent.length ? <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{recent.map((item) => { const category = categoryMap.get(item.category); return <div key={item.id} className="flex items-center gap-3 py-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><CategoryIcon name={category?.icon ?? 'other'} /></span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.description || category?.name || 'Transaction'}</p><p className="text-xs text-slate-500">{format(parseISO(item.date), 'd MMM yyyy')} · {category?.name ?? 'Uncategorized'}</p></div><CurrencyAmount amount={item.amount} type={item.type} className="font-semibold" /></div> })}</div> : <EmptyState title="No transactions yet" description="Add your first income or expense to bring this dashboard to life." action={<Button asChild size="sm"><Link to="/transactions/new">Add transaction</Link></Button>} />}</Card>
    </div>
    <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Your accounts</h2><p className="text-sm text-slate-500">Balances calculated from recorded transactions</p></div><Button asChild size="sm" variant="ghost"><Link to="/accounts">Manage</Link></Button></div>{balances.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{balances.map((account) => <Card key={account.id} className="flex items-center gap-4 p-5">{account.img ? <img src={account.img} alt="" className="size-12 rounded-2xl object-cover" /> : <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><CreditCard className="size-6" /></span>}<div className="min-w-0"><p className="truncate text-sm text-slate-500">{account.name}</p><CurrencyAmount amount={account.balance} className="text-lg font-bold" /></div></Card>)}</div> : <EmptyState title="No accounts yet" description="Add a bank, card or cash account to start tracking balances." action={<Button asChild size="sm"><Link to="/accounts">Add account</Link></Button>} />}</section>
    {auth.user && <ReportExportDialog user={auth.user} open={exportOpen} onOpenChange={setExportOpen} />}
  </div>
}
