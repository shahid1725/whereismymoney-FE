import { CircleDollarSign, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AuthLayout({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return <main className="min-h-screen bg-[#f3f8f5] p-4 sm:p-8 dark:bg-[#061713]">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-xl shadow-emerald-950/10 sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr] dark:border-emerald-200/10 dark:bg-[#0a211c]">
      <section className="line-grid-dark relative hidden overflow-hidden bg-[#08231d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-36 size-80 rounded-full border-[48px] border-emerald-400/30" />
        <Link to="/" className="relative flex items-center gap-3 text-lg font-bold"><span className="grid size-10 place-items-center rounded-xl bg-emerald-300/15"><CircleDollarSign className="size-6" /></span>Where Is My Money?</Link>
        <div className="relative max-w-md"><p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300"><Sparkles className="size-4" />Money, made clear</p><h2 className="text-4xl font-bold leading-tight tracking-[-0.04em]">Know where every rupee goes—with less effort.</h2><p className="mt-5 text-lg text-emerald-50/70">A focused daily money companion for accounts, spending, budgets and the bigger picture.</p></div>
        <p className="relative flex items-center gap-2 text-sm text-emerald-50/70"><ShieldCheck className="size-5" />Your financial data stays behind your secure account.</p>
      </section>
      <section className="grid content-center p-6 sm:p-12 lg:p-14"><div className="mx-auto w-full max-w-md"><Link to="/" className="mb-10 flex items-center gap-2 font-bold text-emerald-700 lg:hidden dark:text-emerald-300"><CircleDollarSign className="size-7" />Where Is My Money?</Link><h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{title}</h1><p className="mt-2 text-slate-500">{description}</p><div className="mt-8">{children}</div></div></section>
    </div>
  </main>
}
