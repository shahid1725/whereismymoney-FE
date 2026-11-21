import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Dialog({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; className?: string }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] data-[state=open]:animate-in" />
      <DialogPrimitive.Content className={cn('fixed inset-x-3 bottom-3 z-50 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(520px,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 dark:border-slate-700 dark:bg-slate-900', className)}>
        <div className="mb-5 pr-10"><DialogPrimitive.Title className="text-xl font-bold text-slate-950 dark:text-white">{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</DialogPrimitive.Description>}</div>
        {children}
        <DialogPrimitive.Close aria-label="Close dialog" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="size-5" /></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
}
