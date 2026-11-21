import { format } from 'date-fns'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Field, Select } from '../../components/ui/form-controls'
import { useAccounts, useBudgets, useCategories, useTransactions } from '../../hooks/use-finance-data'
import type { User } from '../../types/api'
import { createReportCsv, createReportJson, downloadReport, type ReportPeriod } from './report-export'

export function ReportExportDialog({ user, open, onOpenChange }: { user: User; open: boolean; onOpenChange: (open: boolean) => void }) {
  const now = new Date()
  const [period, setPeriod] = useState(format(now, 'yyyy-MM'))
  const accounts = useAccounts(); const categories = useCategories(); const transactions = useTransactions(); const budgets = useBudgets()
  const loading = accounts.isLoading || categories.isLoading || transactions.isLoading || budgets.isLoading
  const data = { user, accounts: accounts.data ?? [], categories: categories.data ?? [], transactions: transactions.data ?? [], budgets: budgets.data ?? [] }
  const selectedPeriod: ReportPeriod = period === 'all' ? null : { year: Number(period.slice(0, 4)), month: Number(period.slice(5, 7)) }
  const basename = `money-report-${period === 'all' ? 'all-time' : period}`
  const exportFile = (formatType: 'csv' | 'json') => {
    if (formatType === 'csv') downloadReport(createReportCsv(data, selectedPeriod), `${basename}.csv`, 'text/csv;charset=utf-8')
    else downloadReport(createReportJson(data, selectedPeriod), `${basename}.json`, 'application/json')
    toast.success(`${formatType.toUpperCase()} report exported`)
    onOpenChange(false)
  }
  return <Dialog open={open} onOpenChange={onOpenChange} title="Export your report" description="Download a private copy of your money data. The file is created in this browser.">
    <div className="grid gap-5">
      <Field label="Report period"><Select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">All time</option>{Array.from({ length: 24 }, (_, offset) => { const date = new Date(now.getFullYear(), now.getMonth() - offset, 1); const value = format(date, 'yyyy-MM'); return <option key={value} value={value}>{format(date, 'MMMM yyyy')}</option> })}</Select></Field>
      <div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={loading} onClick={() => exportFile('csv')} className="group rounded-2xl border border-slate-200 p-5 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-200/10 dark:hover:border-emerald-400 dark:hover:bg-emerald-400/10"><FileSpreadsheet className="size-6 text-emerald-700 dark:text-emerald-300" /><strong className="mt-4 block">Spreadsheet CSV</strong><span className="mt-1 block text-sm text-slate-500">Easy to open in Excel or Google Sheets.</span></button><button type="button" disabled={loading} onClick={() => exportFile('json')} className="group rounded-2xl border border-slate-200 p-5 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-200/10 dark:hover:border-emerald-400 dark:hover:bg-emerald-400/10"><FileJson className="size-6 text-emerald-700 dark:text-emerald-300" /><strong className="mt-4 block">Data backup JSON</strong><span className="mt-1 block text-sm text-slate-500">A structured copy of the selected data.</span></button></div>
      <div className="flex justify-end"><Button variant="secondary" onClick={() => onOpenChange(false)}><Download className="size-4" />Close</Button></div>
    </div>
  </Dialog>
}
