'use client'

import { useEffect, useState, ReactNode } from 'react'
import { SplashScreen } from './splash-screen'

const SPLASH_SHOWN_KEY = 'koncept-studio-splash-shown'
const PWA_INITIALIZED_KEY = 'koncept-studio-pwa-initialized'

// Global state to prevent re-initialization across component mounts
let globalPWAState: {
  isPWA: boolean
  isInitialized: boolean
  showSplash: boolean
} | null = null

interface PWAWrapperProps {
  children: ReactNode
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const [showSplash, setShowSplash] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializePWA = () => {
      try {
        // Check if we already have global state (prevents re-initialization on route changes)
        if (globalPWAState?.isInitialized) {
          setIsPWA(globalPWAState.isPWA)
          setShowSplash(globalPWAState.showSplash)
          setIsInitialized(true)
          return
        }

        // Check if PWA was already initialized in this session
        const pwaInitialized = sessionStorage.getItem(PWA_INITIALIZED_KEY)

        // Check if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            window.location.search.includes('pwa=true')

        if (isStandalone) {
          console.log('🚀 PWA detected')

          let shouldShowSplash = false

          // Only show splash on very first load (not on route changes or component re-mounts)
          if (!pwaInitialized) {
            const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)

            if (!splashShown) {
              shouldShowSplash = true
              sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
            }

            // Mark PWA as initialized to prevent future splash checks
            sessionStorage.setItem(PWA_INITIALIZED_KEY, 'true')
          }

          // Set global state to persist across re-mounts
          globalPWAState = {
            isPWA: true,
            isInitialized: true,
            showSplash: shouldShowSplash
          }

          setIsPWA(true)
          setShowSplash(shouldShowSplash)

          // Check Service Worker (non-blocking)
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
              if (registration) {
                console.log('✅ PWA Service Worker confirmed active')
              } else {
                console.warn('⚠️ PWA detected but no Service Worker found')
              }
            })
          }
        } else {
          // Not a PWA - set global state
          globalPWAState = {
            isPWA: false,
            isInitialized: true,
            showSplash: false
          }

          setIsPWA(false)
          setShowSplash(false)
        }
      } catch (error) {
        console.error('❌ PWA initialization failed:', error)

        // Set safe default state
        globalPWAState = {
          isPWA: false,
          isInitialized: true,
          showSplash: false
        }

        setIsPWA(false)
        setShowSplash(false)
      } finally {
        setIsInitialized(true)
      }
    }

    initializePWA()
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    // Update global state
    if (globalPWAState) {
      globalPWAState.showSplash = false
    }
  }

  // Don't render anything until initialized (prevents any flashing)
  if (!isInitialized) {
    // For PWA mode, show nothing initially to prevent flash
    // For web mode, this will be very brief
    return null
  }

  // Show splash screen for PWA users on first load only
  if (isPWA && showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Render normal content
  return <>{children}</>
}