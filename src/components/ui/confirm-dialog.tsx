import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Dialog } from './dialog'

export function ConfirmDialog({ open, onOpenChange, title = 'Delete this item?', description, onConfirm, busy }: { open: boolean; onOpenChange: (open: boolean) => void; title?: string; description: string; onConfirm: () => void; busy?: boolean }) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
    <div className="mb-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><p>This action cannot be undone.</p></div>
    <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</Button></div>
  </Dialog>
}
