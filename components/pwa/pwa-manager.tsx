'use client'

import { useEffect, useState } from 'react'
import { SplashScreen } from './splash-screen'

const SPLASH_SHOWN_KEY = 'koncept-studio-splash-shown'

export function PWAManager() {
  const [showSplash, setShowSplash] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

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

          // Check if splash was already shown in this session
          const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)

          if (!splashShown) {
            // Show splash screen only on first PWA load
            setShowSplash(true)
            sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
          }

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
      } finally {
        setIsInitialized(true)
      }
    }

    // Run after the app has mounted
    initializePWA()
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Show splash screen only for PWA users on first load
  if (isPWA && showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return null
}