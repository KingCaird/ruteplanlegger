import { useEffect, useState } from 'react'

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<BeforeInstallPromptChoice>
}

export function usePwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
    }

    setInstallPrompt(null)
  }

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    install,
  }
}
