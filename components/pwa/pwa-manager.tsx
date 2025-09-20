'use client'

import { useEffect } from 'react'
import { notificationService } from '@/lib/services/notification.service'
import { toast } from 'sonner'

export function PWAManager() {
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Only run in production PWA context
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            window.location.search.includes('pwa=true')

        if (isStandalone) {
          console.log('🚀 PWA detected, initializing services...')

          // Initialize notification service
          await notificationService.init()

          // Check if Service Worker is properly registered
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()

            if (registration) {
              console.log('✅ PWA Service Worker confirmed active')

              // Check notification permission
              const permission = notificationService.getPermissionStatus()
              if (permission === 'default') {
                // Show a subtle prompt for notifications after PWA is ready
                setTimeout(() => {
                  toast.info('💡 Activez les notifications pour recevoir des alertes de cours', {
                    duration: 5000,
                    action: {
                      label: 'Activer',
                      onClick: async () => {
                        try {
                          const newPermission = await notificationService.requestPermission()
                          if (newPermission === 'granted') {
                            await notificationService.showWelcomeNotification()
                            toast.success('Notifications activées! 🎉')
                          }
                        } catch (error) {
                          console.error('Permission request failed:', error)
                        }
                      }
                    }
                  })
                }, 3000)
              }
            } else {
              console.warn('⚠️ PWA detected but no Service Worker found')
            }
          }
        }
      } catch (error) {
        console.error('❌ PWA initialization failed:', error)
      }
    }

    // Run after the app has mounted
    initializePWA()
  }, [])

  // This component doesn't render anything visible
  return null
}