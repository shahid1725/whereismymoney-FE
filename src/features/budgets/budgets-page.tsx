import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CurrencyAmount } from '../../components/currency-amount'
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Select } from '../../components/ui/form-controls'
import { useBudgets, useCategories, useTransactions } from '../../hooks/use-finance-data'
import { applyFieldErrors, getErrorMessage } from '../../lib/api-error'
import { queryKeys } from '../../lib/query-client'
import { formatCurrency } from '../../lib/utils'
import type { Budget } from '../../types/api'
import { CategoryIcon } from '../categories/icon-registry'
import { budgetsApi, type BudgetInput } from './budgets-api'

const schema = z.object({ mode: z.enum(['overall', 'category']), category: z.number().nullable(), amount: z.string().trim().refine((value) => Number(value) > 0, 'Amount must be greater than zero'), month: z.number().int().min(1).max(12), year: z.number().int().min(2000).max(2200) }).superRefine((values, context) => { if (values.mode === 'category' && !values.category) context.addIssue({ code: 'custom', path: ['category'], message: 'Choose an expense category' }) })
type BudgetForm = z.infer<typeof schema>

export function toBudgetInput(values: BudgetForm): BudgetInput {
  return { amount: values.amount, month: values.month, year: values.year, category: values.mode === 'overall' ? null : values.category }
}

function BudgetDialog({ budget, period, open, onOpenChange }: { budget: Budget | null; period: { month: number; year: number }; open: boolean; onOpenChange: (open: boolean) => void }) {
  const categories = useCategories(); const client = useQueryClient()
  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm<BudgetForm>({ resolver: zodResolver(schema), defaultValues: { mode: 'overall', category: null, amount: '', month: period.month, year: period.year } })
  useEffect(() => { if (open) reset({ mode: budget?.category ? 'category' : 'overall', category: budget?.category ?? null, amount: budget?.amount ?? '', month: budget?.month ?? period.month, year: budget?.year ?? period.year }) }, [open, budget, period, reset])
  const mode = watch('mode')
  const mutation = useMutation({ mutationFn: (values: BudgetForm) => budget ? budgetsApi.update(budget.id, toBudgetInput(values)) : budgetsApi.create(toBudgetInput(values)), onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.budgets }); toast.success(budget ? 'Budget updated' : 'Budget created'); onOpenChange(false) }, onError: (error) => { if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error)) } })
  return <Dialog open={open} onOpenChange={onOpenChange} title={budget ? 'Edit budget' : 'Create a budget'} description="Set one overall monthly limit or a focused limit for an expense category.">
    <form className="grid gap-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Field label="Budget mode" error={errors.mode?.message}><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${mode === 'overall' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-slate-200 dark:border-emerald-200/10'}`}><input className="sr-only" type="radio" value="overall" {...register('mode')} />Overall month</label><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${mode === 'category' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-slate-200 dark:border-emerald-200/10'}`}><input className="sr-only" type="radio" value="category" {...register('mode')} />Category</label></div></Field>
      {mode === 'category' && <Field label="Expense category" error={errors.category?.message}><Select {...register('category', { setValueAs: (value: string) => value ? Number(value) : null })}><option value="">Choose category</option>{categories.data?.filter((item) => item.type === 'expense').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>}
      <Field label="Budget amount" error={errors.amount?.message}><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-500">₹</span><Input className="pl-8" inputMode="decimal" placeholder="5000.00" {...register('amount')} /></div></Field>
      <div className="grid grid-cols-2 gap-4"><Field label="Month" error={errors.month?.message}><Select {...register('month', { valueAsNumber: true })}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{format(new Date(2020, index), 'MMMM')}</option>)}</Select></Field><Field label="Year" error={errors.year?.message}><Input type="number" {...register('year', { valueAsNumber: true })} /></Field></div>
      <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save budget'}</Button></div>
    </form>
  </Dialog>
}

function BudgetProgress({ spent, budget }: { spent: number; budget: number }) {
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0
  const tone = percent >= 100 ? 'bg-rose-500' : percent >= 90 ? 'bg-orange-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'
  return <><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full transition-[width] ${tone}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div><div className="mt-2 flex justify-between text-sm"><span className="font-semibold">{percent}% used</span><span className="text-slate-500">{spent > budget ? `${formatCurrency(spent - budget)} over` : `${formatCurrency(budget - spent)} left`}</span></div></>
}

export function BudgetsPage() {
  const now = new Date(); const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`); const [year, month] = period.split('-').map(Number) as [number, number]
  const budgets = useBudgets(); const categories = useCategories(); const transactions = useTransactions(); const client = useQueryClient()
  const [editing, setEditing] = useState<Budget | null>(null); const [open, setOpen] = useState(false); const [deleting, setDeleting] = useState<Budget | null>(null)
  const current = useMemo(() => (budgets.data ?? []).filter((item) => item.month === month && item.year === year), [budgets.data, month, year]); const overall = current.find((item) => item.category === null); const categoryBudgets = current.filter((item) => item.category !== null)
  const monthExpenses = (transactions.data ?? []).filter((item) => item.type === 'expense' && Number(item.date.slice(0,4)) === year && Number(item.date.slice(5,7)) === month)
  const spentFor = (category: number | null) => monthExpenses.filter((item) => category === null || item.category === category).reduce((sum, item) => sum + Number(item.amount), 0)
  const categoryMap = new Map((categories.data ?? []).map((item) => [item.id, item])); const loading = budgets.isLoading || categories.isLoading || transactions.isLoading; const error = budgets.error || categories.error || transactions.error
  const remove = useMutation({ mutationFn: budgetsApi.remove, onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.budgets }); toast.success('Budget deleted'); setDeleting(null) }, onError: (err) => toast.error(getErrorMessage(err)) })
  return <div className="grid gap-7"><PageHeader eyebrow="Spending plan" title="Budgets" description="Set practical monthly limits and see warning signals before spending gets away from you." actions={<><Select aria-label="Budget month" value={period} onChange={(event) => setPeriod(event.target.value)}>{Array.from({ length: 24 }, (_, offset) => { const date = new Date(now.getFullYear(), now.getMonth() - 12 + offset, 1); const value = format(date, 'yyyy-MM'); return <option key={value} value={value}>{format(date, 'MMMM yyyy')}</option> })}</Select><Button onClick={() => { setEditing(null); setOpen(true) }}><Plus className="size-4" />Create budget</Button></>} />
    {loading ? <LoadingSkeleton rows={4} /> : error ? <ErrorState message={getErrorMessage(error)} onRetry={() => void budgets.refetch()} /> : <><section><h2 className="mb-3 text-lg font-bold">Overall monthly budget</h2>{overall ? <Card className="p-6"><div className="flex items-start gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Target className="size-6" /></span><div className="min-w-0 flex-1"><p className="text-sm text-slate-500">{format(new Date(year, month - 1), 'MMMM yyyy')}</p><div className="mt-1 flex flex-wrap items-baseline justify-between gap-2"><CurrencyAmount amount={spentFor(null)} className="text-2xl font-bold" /><span className="text-sm text-slate-500">spent of {formatCurrency(overall.amount)}</span></div><BudgetProgress spent={spentFor(null)} budget={Number(overall.amount)} /></div><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Edit overall budget" onClick={() => { setEditing(overall); setOpen(true) }}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="text-rose-600" aria-label="Delete overall budget" onClick={() => setDeleting(overall)}><Trash2 className="size-4" /></Button></div></div></Card> : <Card className="border-dashed p-7 text-center"><p className="font-semibold">No overall limit for this month</p><p className="mt-1 text-sm text-slate-500">Category budgets can still be used independently.</p><Button className="mt-4" size="sm" variant="secondary" onClick={() => setOpen(true)}>Set overall budget</Button></Card>}</section>
      <section><div className="mb-3"><h2 className="text-lg font-bold">Category budgets</h2><p className="text-sm text-slate-500">Focused limits for specific types of spending</p></div>{categoryBudgets.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{categoryBudgets.map((budget) => { const category = categoryMap.get(budget.category!); const spent = spentFor(budget.category); return <Card key={budget.id} className="p-5"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><CategoryIcon name={category?.icon ?? 'other'} /></span><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{category?.name ?? 'Unknown category'}</h3><p className="text-sm text-slate-500">{formatCurrency(spent)} of {formatCurrency(budget.amount)}</p></div><Button size="icon" variant="ghost" aria-label="Edit budget" onClick={() => { setEditing(budget); setOpen(true) }}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="text-rose-600" aria-label="Delete budget" onClick={() => setDeleting(budget)}><Trash2 className="size-4" /></Button></div><BudgetProgress spent={spent} budget={Number(budget.amount)} /></Card> })}</div> : <EmptyState title="No category budgets" description="Create focused limits for categories such as food, shopping or travel." action={<Button size="sm" onClick={() => setOpen(true)}>Create category budget</Button>} />}</section></>}
    <BudgetDialog budget={editing} period={{ month, year }} open={open} onOpenChange={setOpen} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(value) => !value && setDeleting(null)} title="Delete this budget?" description="Your transactions are not affected, but this spending limit will be removed." busy={remove.isPending} onConfirm={() => deleting && remove.mutate(deleting.id)} />
  </div>
}
