'use client'

import { useEffect } from 'react'

export function PWAManager() {
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Only run in production PWA context
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            window.location.search.includes('pwa=true')

        if (isStandalone) {
          console.log('🚀 PWA detected')

          // Check if Service Worker is properly registered
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()

            if (registration) {
              console.log('✅ PWA Service Worker confirmed active')
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