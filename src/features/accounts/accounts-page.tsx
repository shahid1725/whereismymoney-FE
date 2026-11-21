import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/page-states'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input } from '../../components/ui/form-controls'
import { useAccounts } from '../../hooks/use-finance-data'
import { applyFieldErrors, getErrorMessage } from '../../lib/api-error'
import { queryKeys } from '../../lib/query-client'
import type { Account } from '../../types/api'
import { accountsApi, type AccountInput } from './accounts-api'

const schema = z.object({ name: z.string().trim().min(1, 'Account name is required'), img: z.instanceof(File).nullable().optional() })
type AccountForm = z.infer<typeof schema>

function AccountDialog({ account, open, onOpenChange }: { account: Account | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const client = useQueryClient()
  const [preview, setPreview] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm<AccountForm>({ resolver: zodResolver(schema), defaultValues: { name: '', img: null } })
  useEffect(() => { if (open) { reset({ name: account?.name ?? '', img: null }); setPreview(account?.img ?? null) } }, [open, account, reset])
  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])
  const mutation = useMutation({
    mutationFn: (values: AccountInput) => account ? accountsApi.update(account.id, values) : accountsApi.create(values),
    onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.accounts }); toast.success(account ? 'Account updated' : 'Account added'); onOpenChange(false) },
    onError: (error) => { if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error)) }
  })
  return <Dialog open={open} onOpenChange={onOpenChange} title={account ? 'Edit account' : 'Add an account'} description="Use a clear name and an optional image to identify it quickly.">
    <form className="grid gap-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <div className="flex items-center gap-4"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">{preview ? <img src={preview} alt="Selected account preview" className="size-full object-cover" /> : <CreditCard className="size-8 text-slate-400" />}</div><label className="cursor-pointer"><span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"><ImagePlus className="size-4" />Choose image</span><input className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0] ?? null; setValue('img', file, { shouldValidate: true }); if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); setPreview(file ? URL.createObjectURL(file) : account?.img ?? null) }} /></label></div>
      <Field label="Account name" error={errors.name?.message}><Input placeholder="Main Bank" {...register('name')} /></Field>
      <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save account'}</Button></div>
    </form>
  </Dialog>
}

export function AccountsPage() {
  const query = useAccounts()
  const client = useQueryClient()
  const [editing, setEditing] = useState<Account | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const remove = useMutation({ mutationFn: accountsApi.remove, onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.accounts }); toast.success('Account deleted'); setDeleting(null) }, onError: (error) => toast.error(getErrorMessage(error)) })
  return <div className="grid gap-7"><PageHeader eyebrow="Money sources" title="Accounts" description="Manage the banks, cards and cash accounts your transactions belong to." actions={<Button onClick={() => { setEditing(null); setFormOpen(true) }}><Plus className="size-4" />Add account</Button>} />
    {query.isLoading ? <LoadingSkeleton rows={3} /> : query.error ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data?.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{query.data.map((account) => <Card key={account.id} className="group p-5"><div className="flex items-start gap-4">{account.img ? <img src={account.img} alt="" className="size-14 rounded-2xl object-cover" /> : <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><CreditCard className="size-7" /></span>}<div className="min-w-0 flex-1"><h2 className="truncate text-lg font-bold">{account.name}</h2><p className="text-sm text-slate-500">Account</p></div><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${account.name}`} onClick={() => { setEditing(account); setFormOpen(true) }}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${account.name}`} className="text-rose-600" onClick={() => setDeleting(account)}><Trash2 className="size-4" /></Button></div></div></Card>)}</div> : <EmptyState title="No accounts yet" description="Add your first bank, card or cash account to start recording transactions." action={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" />Add account</Button>} />}
    <AccountDialog account={editing} open={formOpen} onOpenChange={setFormOpen} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title={`Delete ${deleting?.name ?? 'account'}?`} description="Accounts referenced by transactions are protected and the server will keep them safe." busy={remove.isPending} onConfirm={() => deleting && remove.mutate(deleting.id)} />
  </div>
}
