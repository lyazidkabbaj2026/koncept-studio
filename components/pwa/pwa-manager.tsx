'use client'

import { useEffect, useState } from 'react'
import { SplashScreen } from './splash-screen'

export function PWAManager() {
  const [showSplash, setShowSplash] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Only run in production PWA context
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            window.location.search.includes('pwa=true')

        setIsPWA(isStandalone)

        if (isStandalone) {
          console.log('🚀 PWA detected')

          // Show splash screen for PWA users
          setShowSplash(true)

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

  // Show splash screen only for PWA users
  if (isPWA && showSplash) {
    return <SplashScreen />
  }

  return null
}