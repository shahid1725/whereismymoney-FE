import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Select } from '../../components/ui/form-controls'
import { useCategories } from '../../hooks/use-finance-data'
import { applyFieldErrors, getErrorMessage } from '../../lib/api-error'
import { queryKeys } from '../../lib/query-client'
import type { Category } from '../../types/api'
import { categoriesApi, type CategoryInput } from './categories-api'
import { CategoryIcon, iconOptions } from './icon-registry'

const schema = z.object({ name: z.string().trim().min(1, 'Category name is required'), icon: z.string().min(1), type: z.enum(['income', 'expense']) })
type CategoryForm = z.infer<typeof schema>

export function categoriesForType(categories: Category[], type: 'income' | 'expense') {
  return categories.filter((category) => category.type === type)
}

function CategoryDialog({ category, open, onOpenChange }: { category: Category | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const client = useQueryClient()
  const { register, handleSubmit, reset, setError, watch, setValue, formState: { errors } } = useForm<CategoryForm>({ resolver: zodResolver(schema), defaultValues: { name: '', icon: 'wallet', type: 'expense' } })
  useEffect(() => { if (open) reset({ name: category?.name ?? '', icon: category?.icon ?? 'wallet', type: category?.type ?? 'expense' }) }, [open, category, reset])
  const selectedIcon = watch('icon')
  const mutation = useMutation({ mutationFn: (values: CategoryInput) => category ? categoriesApi.update(category.id, values) : categoriesApi.create(values), onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.categories }); toast.success(category ? 'Category updated' : 'Category created'); onOpenChange(false) }, onError: (error) => { if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error)) } })
  return <Dialog open={open} onOpenChange={onOpenChange} title={category ? 'Edit category' : 'Create category'} description="Choose the type carefully—transactions must use a category of the same type.">
    <form className="grid gap-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Field label="Type" error={errors.type?.message}><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${watch('type') === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40' : 'border-slate-200 dark:border-slate-700'}`}><input className="sr-only" type="radio" value="expense" {...register('type')} />Expense</label><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${watch('type') === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}`}><input className="sr-only" type="radio" value="income" {...register('type')} />Income</label></div></Field>
      <Field label="Name" error={errors.name?.message}><Input placeholder="Groceries" {...register('name')} /></Field>
      <Field label="Icon" error={errors.icon?.message}><div className="grid grid-cols-8 gap-2">{iconOptions.map((icon) => <button key={icon} type="button" aria-label={`Use ${icon} icon`} aria-pressed={selectedIcon === icon} onClick={() => setValue('icon', icon, { shouldValidate: true })} className={`grid aspect-square place-items-center rounded-xl border ${selectedIcon === icon ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-slate-200 hover:bg-emerald-50 dark:border-emerald-200/10 dark:hover:bg-emerald-300/10'}`}><CategoryIcon name={icon} /></button>)}</div></Field>
      <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save category'}</Button></div>
    </form>
  </Dialog>
}

export function CategoriesPage() {
  const query = useCategories(); const client = useQueryClient()
  const [search, setSearch] = useState(''); const [editing, setEditing] = useState<Category | null>(null); const [open, setOpen] = useState(false); const [deleting, setDeleting] = useState<Category | null>(null)
  const filtered = useMemo(() => (query.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [query.data, search])
  const remove = useMutation({ mutationFn: categoriesApi.remove, onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.categories }); toast.success('Category deleted'); setDeleting(null) }, onError: (error) => toast.error(getErrorMessage(error)) })
  const section = (type: 'income' | 'expense') => { const items = categoriesForType(filtered, type); return <section><div className="mb-3 flex items-center gap-2"><span className={`size-2 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} /><h2 className="text-lg font-bold capitalize">{type} categories</h2><span className="text-sm text-slate-500">{items.length}</span></div>{items.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((category) => <Card key={category.id} className="flex items-center gap-3 p-4"><span className={`grid size-11 place-items-center rounded-xl ${type === 'income' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'bg-rose-50 text-rose-700 dark:bg-rose-950'}`}><CategoryIcon name={category.icon} /></span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{category.name}</p><p className="text-xs text-slate-500">{category.is_default ? 'Default category' : 'Custom category'}</p></div><Button size="icon" variant="ghost" aria-label={`Edit ${category.name}`} onClick={() => { setEditing(category); setOpen(true) }}><Pencil className="size-4" /></Button>{!category.is_default && <Button size="icon" variant="ghost" aria-label={`Delete ${category.name}`} className="text-rose-600" onClick={() => setDeleting(category)}><Trash2 className="size-4" /></Button>}</Card>)}</div> : <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">No matching {type} categories.</p>}</section> }
  return <div className="grid gap-7"><PageHeader eyebrow="Transaction labels" title="Categories" description="Keep income and expenses organized with consistent, easy-to-scan labels." actions={<Button onClick={() => { setEditing(null); setOpen(true) }}><Plus className="size-4" />Create category</Button>} />
    <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" aria-label="Search categories" /></div>
    {query.isLoading ? <LoadingSkeleton rows={4} /> : query.error ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data?.length ? <div className="grid gap-8">{section('expense')}{section('income')}</div> : <EmptyState title="No categories yet" description="Create income and expense categories before recording transactions." action={<Button onClick={() => setOpen(true)}>Create category</Button>} />}
    <CategoryDialog category={editing} open={open} onOpenChange={setOpen} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(value) => !value && setDeleting(null)} title={`Delete ${deleting?.name ?? 'category'}?`} description="Categories used by transactions or budgets are protected and cannot be deleted." busy={remove.isPending} onConfirm={() => deleting && remove.mutate(deleting.id)} />
  </div>
}
