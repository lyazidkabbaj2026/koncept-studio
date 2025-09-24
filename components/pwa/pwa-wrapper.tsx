'use client'

import { useEffect, useState, ReactNode } from 'react'
import { SplashScreen } from './splash-screen'

const SPLASH_SHOWN_KEY = 'koncept-studio-splash-shown'

interface PWAWrapperProps {
  children: ReactNode
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const [showSplash, setShowSplash] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPWAMode = () => {
      try {
        // Check if running as PWA
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
            navigator.serviceWorker.getRegistration().then(registration => {
              if (registration) {
                console.log('✅ PWA Service Worker confirmed active')
              } else {
                console.warn('⚠️ PWA detected but no Service Worker found')
              }
            })
          }
        }
      } catch (error) {
        console.error('❌ PWA check failed:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Run immediately, no delay
    checkPWAMode()
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // While checking PWA status, don't render anything for PWA users
  // This prevents the flash of homepage content
  if (isChecking && typeof window !== 'undefined') {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        window.location.search.includes('pwa=true')

    if (isStandalone) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )
    }
  }

  // Show splash screen for PWA users on first load
  if (isPWA && showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Render normal content
  return <>{children}</>
}