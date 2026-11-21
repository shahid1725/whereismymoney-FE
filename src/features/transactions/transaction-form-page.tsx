import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input, Select, Textarea } from '../../components/ui/form-controls'
import { useAccounts, useCategories } from '../../hooks/use-finance-data'
import { applyFieldErrors, getErrorMessage } from '../../lib/api-error'
import { queryKeys } from '../../lib/query-client'
import type { TransactionType } from '../../types/api'
import { transactionsApi, type TransactionInput } from './transactions-api'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  account: z.number().int().positive('Choose an account'),
  category: z.number().int().positive('Choose a category'),
  amount: z.string().trim().refine((value) => Number(value) > 0, 'Amount must be greater than zero'),
  date: z.iso.date('Choose a valid date'),
  description: z.string().trim().max(240, 'Keep the description under 240 characters')
})
type TransactionForm = z.infer<typeof schema>

export function validateCategoryType(categoryType: TransactionType | undefined, transactionType: TransactionType) {
  return categoryType === transactionType
}

export function TransactionFormPage() {
  const { id } = useParams(); const transactionId = id ? Number(id) : null; const navigate = useNavigate(); const client = useQueryClient()
  const accounts = useAccounts(); const categories = useCategories()
  const transaction = useQuery({ queryKey: ['transactions', transactionId], queryFn: () => transactionsApi.get(transactionId!), enabled: Boolean(transactionId) })
  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm<TransactionForm>({ resolver: zodResolver(schema), defaultValues: { type: 'expense', account: 0, category: 0, amount: '', date: new Date().toISOString().slice(0, 10), description: '' } })
  useEffect(() => { if (transaction.data) reset({ type: transaction.data.type, account: transaction.data.account, category: transaction.data.category, amount: transaction.data.amount, date: transaction.data.date, description: transaction.data.description }) }, [transaction.data, reset])
  const type = watch('type')
  const matchingCategories = (categories.data ?? []).filter((item) => item.type === type)
  const mutation = useMutation({ mutationFn: (values: TransactionInput) => transactionId ? transactionsApi.update(transactionId, values) : transactionsApi.create(values), onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.transactions }); toast.success(transactionId ? 'Transaction updated' : 'Transaction added'); navigate('/transactions') }, onError: (error) => { if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error)) } })
  const loading = accounts.isLoading || categories.isLoading || (transactionId && transaction.isLoading)
  const loadError = accounts.error || categories.error || transaction.error
  if (loading) return <LoadingSkeleton rows={4} />
  if (loadError) return <ErrorState message={getErrorMessage(loadError)} />
  return <div className="grid gap-7"><PageHeader eyebrow={transactionId ? 'Edit activity' : 'Record activity'} title={transactionId ? 'Edit transaction' : 'Add transaction'} description="Capture the essentials quickly. Categories automatically stay aligned with the transaction type." actions={<Button asChild variant="secondary"><Link to="/transactions"><ArrowLeft className="size-4" />Back</Link></Button>} />
    <Card className="mx-auto w-full max-w-3xl p-5 sm:p-7"><form className="grid gap-6" onSubmit={handleSubmit((values) => { const selected = categories.data?.find((item) => item.id === values.category); if (!validateCategoryType(selected?.type, values.type)) { setError('category', { message: 'Category type must match the transaction type.' }); return } mutation.mutate(values) })}>
      <Field label="Transaction type" error={errors.type?.message}><div className="grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold ${type === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40' : 'border-slate-200 dark:border-slate-700'}`}><input className="sr-only" type="radio" value="expense" {...register('type')} />Expense</label><label className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold ${type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}`}><input className="sr-only" type="radio" value="income" {...register('type')} />Income</label></div></Field>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Account" error={errors.account?.message}><Select {...register('account', { valueAsNumber: true })}><option value={0}>Choose account</option>{accounts.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field><Field label="Category" error={errors.category?.message}><Select {...register('category', { valueAsNumber: true })}><option value={0}>Choose {type} category</option>{matchingCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Amount" error={errors.amount?.message}><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-500">₹</span><Input className="pl-8 text-lg font-semibold" inputMode="decimal" placeholder="0.00" {...register('amount')} /></div></Field><Field label="Date" error={errors.date?.message}><div className="relative"><Input type="date" className="pr-10" {...register('date')} /><CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /></div></Field></div>
      <Field label="Description" error={errors.description?.message} hint="Optional, but useful for finding this later."><Textarea placeholder="What was this for?" {...register('description')} /></Field>
      <div className="flex justify-end gap-3"><Button asChild variant="secondary"><Link to="/transactions">Cancel</Link></Button><Button type="submit" disabled={mutation.isPending}><Save className="size-4" />{mutation.isPending ? 'Saving…' : 'Save transaction'}</Button></div>
    </form></Card>
  </div>
}
