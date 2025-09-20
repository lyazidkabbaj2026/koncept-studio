'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconDownload, IconX, IconDeviceMobile, IconBrowser } from '@tabler/icons-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        window.location.search.includes('pwa=true')

    setIsInstalled(isStandalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      toast.success('Application installée avec succès! 🎉')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show prompt after delay if not installed
    if (!isStandalone) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        toast.success('Installation en cours...')
      } else {
        toast.info('Installation annulée')
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } else {
      // Manual install instructions
      toast.info('Utilisez le menu de votre navigateur pour installer l\'application')
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('installPromptDismissed', Date.now().toString())
    }
  }

  // Don't render on server-side
  if (!isClient) {
    return null
  }

  // Don't show if already installed or recently dismissed
  const dismissedTime = localStorage.getItem('installPromptDismissed')
  const recentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000 // 24h

  if (isInstalled || !showInstallPrompt || recentlyDismissed) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-2 border-primary/20 md:max-w-md md:left-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconDeviceMobile className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Installer l'Application</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <IconX className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Installez Koncept Studio pour une expérience native et les notifications push
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconBrowser className="w-4 h-4" />
          <span>Accès rapide depuis votre écran d'accueil</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 gap-2"
            size="sm"
          >
            <IconDownload className="w-4 h-4" />
            Installer
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            size="sm"
          >
            Plus tard
          </Button>
        </div>

        {!deferredPrompt && (
          <p className="text-xs text-muted-foreground">
            💡 Si le bouton ne fonctionne pas, utilisez le menu ⋮ de votre navigateur → "Ajouter à l'écran d'accueil"
          </p>
        )}
      </CardContent>
    </Card>
  )
}