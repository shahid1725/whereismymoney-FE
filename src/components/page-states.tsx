import type { LucideIcon } from 'lucide-react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return <div aria-label="Loading" className="grid gap-3" role="status">{Array.from({ length: rows }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}<span className="sr-only">Loading content</span></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <Card className="grid place-items-center p-8 text-center"><AlertCircle className="mb-3 size-8 text-rose-500" /><h2 className="font-bold">We couldn’t load this</h2><p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>{onRetry && <Button className="mt-4" variant="secondary" onClick={onRetry}>Try again</Button>}</Card>
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return <Card className="grid place-items-center border-dashed p-10 text-center"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Icon className="size-6" /></div><h2 className="font-bold">{title}</h2><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</Card>
}
