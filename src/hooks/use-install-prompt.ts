import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setPrompt(event as BeforeInstallPromptEvent) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  return { canInstall: Boolean(prompt), install: async () => { if (!prompt) return false; await prompt.prompt(); const result = await prompt.userChoice; if (result.outcome === 'accepted') setPrompt(null); return result.outcome === 'accepted' } }
}
