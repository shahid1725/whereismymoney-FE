import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui/button'

export function PwaUpdater() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return <div role="status" className="fixed bottom-24 right-4 z-[80] max-w-sm rounded-2xl bg-slate-950 p-4 text-white shadow-2xl lg:bottom-6"><p className="font-semibold">A fresh version is ready</p><p className="mt-1 text-sm text-slate-300">Update now to get the latest improvements.</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => updateServiceWorker(true)}>Update app</Button><Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setNeedRefresh(false)}>Later</Button></div></div>
}
