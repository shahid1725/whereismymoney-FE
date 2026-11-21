import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn('h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 placeholder:text-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white', className)} {...props} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn('min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-950 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white', className)} {...props} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <div className="relative"><select ref={ref} className={cn('h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-base text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white', className)} {...props}>{children}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /></div>
})

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{label}</span>{children}{error ? <span role="alert" className="text-sm font-normal text-rose-600 dark:text-rose-400">{error}</span> : hint ? <span className="text-sm font-normal text-slate-500">{hint}</span> : null}</label>
}
