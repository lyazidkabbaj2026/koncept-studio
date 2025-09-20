'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MobileDebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    isStandalone: false,
    serviceWorkerSupported: false,
    notificationsSupported: false,
    permission: 'default' as NotificationPermission,
    userAgent: '',
    displayMode: '',
    serviceWorkerState: 'unknown',
  })

  useEffect(() => {
    const checkEnvironment = async () => {
      // Check if PWA is running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://') ||
                          window.location.href.includes('?pwa=true') ||
                          sessionStorage.getItem('isPWA') === 'true'

      // Check service worker support
      const serviceWorkerSupported = 'serviceWorker' in navigator

      // Check notification support
      const notificationsSupported = 'Notification' in window

      // Get permission status
      const permission = notificationsSupported ? Notification.permission : 'denied'

      // Get display mode
      const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' :
                         window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
                         window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser'

      // Check service worker state
      let serviceWorkerState = 'not-supported'
      if (serviceWorkerSupported) {
        try {
          const registration = await navigator.serviceWorker.ready
          serviceWorkerState = registration ? 'ready' : 'not-ready'
        } catch {
          serviceWorkerState = 'error'
        }
      }

      setDebugInfo({
        isStandalone,
        serviceWorkerSupported,
        notificationsSupported,
        permission,
        userAgent: navigator.userAgent,
        displayMode,
        serviceWorkerState,
      })
    }

    checkEnvironment()
  }, [])

  const getBadgeVariant = (condition: boolean) => {
    return condition ? 'default' : 'destructive'
  }

  const getPermissionBadge = () => {
    switch (debugInfo.permission) {
      case 'granted': return <Badge variant="default">Granted</Badge>
      case 'denied': return <Badge variant="destructive">Denied</Badge>
      default: return <Badge variant="secondary">Default</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-lg">🔍 Mobile PWA Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>PWA Standalone:</span>
              <Badge variant={getBadgeVariant(debugInfo.isStandalone)}>
                {debugInfo.isStandalone ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Service Worker:</span>
              <Badge variant={getBadgeVariant(debugInfo.serviceWorkerSupported)}>
                {debugInfo.serviceWorkerState}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Notifications:</span>
              <Badge variant={getBadgeVariant(debugInfo.notificationsSupported)}>
                {debugInfo.notificationsSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Permission:</span>
              {getPermissionBadge()}
            </div>

            <div className="flex justify-between items-center">
              <span>Display Mode:</span>
              <Badge variant="outline">{debugInfo.displayMode}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Platform:</span>
              <Badge variant="outline">
                {debugInfo.userAgent.includes('iPhone') ? 'iOS' :
                 debugInfo.userAgent.includes('Android') ? 'Android' :
                 debugInfo.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground font-mono break-all">
            {debugInfo.userAgent}
          </p>
        </div>

        {!debugInfo.isStandalone && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Not running as PWA. Install the app for best notification experience.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}