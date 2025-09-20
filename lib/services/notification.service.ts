'use client'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  data?: any
}

export class NotificationService {
  private static instance: NotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('🔄 Initializing Service Worker...')

        // Try multiple methods to get Service Worker registration
        let registration: ServiceWorkerRegistration | undefined

        // Method 1: Check for existing registration
        try {
          registration = await navigator.serviceWorker.getRegistration('/')
          if (registration) {
            console.log('✅ Found existing Service Worker registration via getRegistration')
          }
        } catch (error) {
          console.log('⚠️ getRegistration failed:', error)
        }

        // Method 2: Try navigator.serviceWorker.ready
        if (!registration) {
          try {
            console.log('🔄 Trying navigator.serviceWorker.ready...')
            registration = await Promise.race([
              navigator.serviceWorker.ready,
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ])
            if (registration) {
              console.log('✅ Service Worker ready via ready method')
            }
          } catch (error) {
            console.log('⚠️ serviceWorker.ready failed or timed out:', error)
          }
        }

        // Method 3: Manual registration
        if (!registration) {
          try {
            console.log('🔄 Manual Service Worker registration...')
            registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              type: 'classic'
            })
            console.log('✅ Service Worker manually registered')

            // Wait for it to be ready
            await navigator.serviceWorker.ready
            console.log('✅ Manual registration confirmed active')
          } catch (error) {
            console.error('❌ Manual registration failed:', error)
          }
        }

        // Method 4: Force reload and retry if in PWA mode
        if (!registration && this.isPWAMode()) {
          console.log('🔄 PWA mode detected, attempting force registration...')
          try {
            // Unregister any existing service workers
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(registrations.map(reg => reg.unregister()))

            // Fresh registration
            registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none'
            })

            // Wait for it to become active
            await new Promise((resolve) => {
              const checkState = () => {
                if (registration?.active) {
                  resolve(void 0)
                } else {
                  setTimeout(checkState, 100)
                }
              }
              checkState()
            })

            console.log('✅ Force registration successful')
          } catch (error) {
            console.error('❌ Force registration failed:', error)
          }
        }

        this.registration = registration

        if (this.registration) {
          console.log('🎉 Service Worker successfully initialized for notifications')
          console.log('📋 Registration state:', {
            scope: this.registration.scope,
            active: !!this.registration.active,
            installing: !!this.registration.installing,
            waiting: !!this.registration.waiting
          })
        } else {
          console.warn('⚠️ No Service Worker registration available after all attempts')
        }

      } catch (error) {
        console.error('❌ Service Worker initialization failed:', error)
      }
    } else {
      console.warn('⚠️ Service Worker not supported in this browser')
    }
  }

  private isPWAMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           window.location.search.includes('pwa=true')
  }

  private isFirefox(): boolean {
    return navigator.userAgent.toLowerCase().includes('firefox')
  }

  private isFirefoxAndroid(): boolean {
    return this.isFirefox() && navigator.userAgent.toLowerCase().includes('android')
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Ce navigateur ne supporte pas les notifications')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    try {
      console.log('🔔 Attempting to show notification:', options.title)

      const permission = this.getPermissionStatus()
      console.log('📋 Current permission status:', permission)

      if (permission === 'denied') {
        console.error('❌ Notifications are blocked by user')
        throw new Error('Les notifications sont bloquées. Activez-les dans les paramètres du navigateur.')
      }

      if (permission === 'default') {
        console.log('🤔 Requesting notification permission...')
        const newPermission = await this.requestPermission()
        console.log('📝 New permission status:', newPermission)

        if (newPermission !== 'granted') {
          console.error('❌ Permission denied by user')
          throw new Error('Permission de notification refusée')
        }
      }

      const notificationOptions: NotificationOptions = {
        icon: '/images/logo.svg',
        badge: '/images/logo.svg',
        ...options,
      }

      console.log('🔧 Notification options:', notificationOptions)
      console.log('⚙️ Service Worker registration:', !!this.registration)

      // Check if we're in a PWA context that requires Service Worker notifications
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://') ||
                          window.location.search.includes('pwa=true');

      const isSecureContext = window.isSecureContext || location.protocol === 'https:';

      console.log('📱 PWA Standalone mode:', isStandalone)
      console.log('🔒 Secure context:', isSecureContext)
      console.log('🦊 Firefox Android:', this.isFirefoxAndroid())

      // Special handling for Firefox Android
      if (this.isFirefoxAndroid()) {
        console.log('🦊 Firefox Android detected - using basic notifications (Service Worker unreliable)')

        if (this.getPermissionStatus() !== 'granted') {
          throw new Error('Permission de notification non accordée')
        }

        try {
          const notification = new Notification(options.title, notificationOptions)

          notification.onclick = () => {
            console.log('🖱️ Notification clicked (Firefox)')
            if ('focus' in window) window.focus()
          }

          notification.onerror = (error) => {
            console.error('❌ Firefox notification error:', error)
          }

          console.log('✅ Firefox Android notification sent successfully')
          return
        } catch (firefoxError) {
          console.error('❌ Firefox Android notification failed:', firefoxError)
          throw new Error(`Firefox notification failed: ${firefoxError.message}`)
        }
      }

      // Force Service Worker notifications in PWA context (non-Firefox)
      if (isStandalone || this.registration) {
        console.log('🚀 PWA detected - ensuring Service Worker notification')

        // Make sure we have a valid Service Worker registration
        if (!this.registration) {
          console.log('⚠️ No Service Worker registration, attempting to get one...')
          try {
            this.registration = await navigator.serviceWorker.ready
            console.log('✅ Service Worker registration obtained')
          } catch (swError) {
            console.error('❌ Failed to get Service Worker registration:', swError)

            // Firefox fallback to basic notifications
            if (this.isFirefox()) {
              console.log('🦊 Firefox Service Worker failed, falling back to basic notifications')
              const notification = new Notification(options.title, notificationOptions)
              notification.onclick = () => {
                if ('focus' in window) window.focus()
              }
              console.log('✅ Firefox fallback notification sent')
              return
            }

            throw new Error('Service Worker requis pour les notifications PWA')
          }
        }

        // Verify Service Worker is active
        if (!this.registration.active) {
          console.error('❌ Service Worker is not active')

          // Firefox fallback
          if (this.isFirefox()) {
            console.log('🦊 Firefox Service Worker inactive, using basic notifications')
            const notification = new Notification(options.title, notificationOptions)
            notification.onclick = () => {
              if ('focus' in window) window.focus()
            }
            console.log('✅ Firefox fallback notification sent')
            return
          }

          throw new Error('Service Worker n\'est pas actif')
        }

        if (this.registration && 'showNotification' in this.registration) {
          console.log('📢 Using Service Worker notification (PWA mode)')

          // Verify we have notification permission
          if (this.getPermissionStatus() !== 'granted') {
            throw new Error('Permission de notification non accordée')
          }

          try {
            await this.registration.showNotification(options.title, notificationOptions)
            console.log('✅ Service Worker notification sent successfully')
            return
          } catch (notificationError) {
            console.error('❌ Service Worker showNotification failed:', notificationError)

            // Firefox fallback
            if (this.isFirefox()) {
              console.log('🦊 Firefox Service Worker notification failed, using basic fallback')
              const notification = new Notification(options.title, notificationOptions)
              notification.onclick = () => {
                if ('focus' in window) window.focus()
              }
              console.log('✅ Firefox fallback notification sent')
              return
            }

            throw new Error(`Échec de l'envoi de notification: ${notificationError.message}`)
          }
        } else {
          console.error('❌ Service Worker registration invalid or missing showNotification')

          // Firefox fallback
          if (this.isFirefox()) {
            console.log('🦊 Firefox Service Worker invalid, using basic notifications')
            const notification = new Notification(options.title, notificationOptions)
            notification.onclick = () => {
              if ('focus' in window) window.focus()
            }
            console.log('✅ Firefox fallback notification sent')
            return
          }

          throw new Error('Service Worker indisponible pour les notifications PWA')
        }
      }

      // Only use basic notifications if NOT in PWA mode
      if (!isStandalone) {
        console.log('📢 Using basic browser notification (non-PWA mode)')
        const notification = new Notification(options.title, notificationOptions)

        notification.onclick = () => {
          console.log('🖱️ Notification clicked')
          if ('focus' in window) window.focus()
        }

        notification.onerror = (error) => {
          console.error('❌ Basic notification error:', error)
        }

        console.log('✅ Basic notification sent successfully')
      } else {
        throw new Error('Impossible d\'envoyer la notification en mode PWA sans Service Worker')
      }

    } catch (error) {
      console.error('💥 Error in showNotification:', error)
      throw error
    }
  }

  // Predefined notification types for the fitness studio
  async showBookingConfirmation(className: string, date: string): Promise<void> {
    await this.showNotification({
      title: 'Réservation confirmée ✅',
      body: `Votre cours de ${className} le ${date} est confirmé !`,
      tag: 'booking-confirmation',
      requireInteraction: true,
      data: { type: 'booking-confirmation', className, date }
    })
  }

  async showClassReminder(className: string, timeUntil: string): Promise<void> {
    await this.showNotification({
      title: 'Rappel de cours ⏰',
      body: `Votre cours de ${className} commence dans ${timeUntil}`,
      tag: 'class-reminder',
      requireInteraction: true,
      data: { type: 'class-reminder', className, timeUntil }
    })
  }

  async showCancellationNotice(className: string, date: string): Promise<void> {
    await this.showNotification({
      title: 'Cours annulé ⚠️',
      body: `Le cours de ${className} du ${date} a été annulé`,
      tag: 'class-cancellation',
      requireInteraction: true,
      data: { type: 'class-cancellation', className, date }
    })
  }

  async showWaitlistUpdate(className: string, status: 'confirmed' | 'declined'): Promise<void> {
    const title = status === 'confirmed'
      ? 'Place disponible ! 🎉'
      : 'Liste d\'attente mise à jour'

    const body = status === 'confirmed'
      ? `Une place s'est libérée pour ${className}. Confirmez rapidement !`
      : `Votre position sur la liste d'attente pour ${className} a été mise à jour`

    await this.showNotification({
      title,
      body,
      tag: 'waitlist-update',
      requireInteraction: true,
      data: { type: 'waitlist-update', className, status }
    })
  }

  async showWelcomeNotification(): Promise<void> {
    await this.showNotification({
      title: 'Bienvenue chez Koncept Studio! 💪',
      body: 'Votre app est installée et prête. Découvrez nos cours !',
      tag: 'welcome',
      requireInteraction: false,
      data: { type: 'welcome' }
    })
  }

  // Test notification for development/demo
  async showTestNotification(): Promise<void> {
    await this.showNotification({
      title: 'Notification de test 🔔',
      body: 'Ceci est une notification de test de Koncept Studio',
      tag: 'test',
      requireInteraction: false,
      data: { type: 'test' }
    })
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()