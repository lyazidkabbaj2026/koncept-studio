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
        this.registration = await navigator.serviceWorker.ready
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
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
    const permission = this.getPermissionStatus()

    if (permission === 'denied') {
      throw new Error('Les notifications sont bloquées')
    }

    if (permission === 'default') {
      const newPermission = await this.requestPermission()
      if (newPermission !== 'granted') {
        throw new Error('Permission de notification refusée')
      }
    }

    const notificationOptions: NotificationOptions = {
      icon: '/images/logo.svg',
      badge: '/images/logo.svg',
      ...options,
    }

    if (this.registration) {
      // Use service worker notification for better control
      await this.registration.showNotification(options.title, notificationOptions)
    } else {
      // Fallback to basic notification
      new Notification(options.title, notificationOptions)
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