'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Hide splash screen after animation completes
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 300) // Fade out duration
    }, 2000) // Show splash for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-background transition-opacity duration-300
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Logo */}
        <div
          className={`
            transform transition-all duration-1000 ease-out
            ${isAnimating
              ? 'scale-100 opacity-100 rotate-0'
              : 'scale-110 opacity-90 rotate-3'
            }
          `}
        >
          <div className="relative">
            {/* Pulse effect background */}
            <div
              className={`
                absolute inset-0 rounded-full bg-primary/20
                transition-all duration-2000 ease-out
                ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
              `}
            />

            {/* Logo */}
            <div className="relative bg-background rounded-full p-6 shadow-2xl">
              <Image
                src="/images/logo.svg"
                alt="Koncept Studio"
                width={120}
                height={120}
                className="w-30 h-30 dark:invert"
                priority
              />
            </div>
          </div>
        </div>

        {/* Animated Text */}
        <div
          className={`
            text-center space-y-2 transform transition-all duration-1000 delay-500
            ${isAnimating
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-70'
            }
          `}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Koncept Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Studio de Fitness
          </p>
        </div>

        {/* Loading indicator */}
        <div
          className={`
            flex space-x-2 transition-opacity duration-500 delay-1000
            ${isAnimating ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  )
}