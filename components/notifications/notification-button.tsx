'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconBell } from '@tabler/icons-react'
import { notificationService } from '@/lib/services/notification.service'
import { toast } from 'sonner'

interface NotificationButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function NotificationButton({ variant = 'outline', size = 'sm', className }: NotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleNotificationTest = async () => {
    setIsLoading(true)
    try {
      const permission = notificationService.getPermissionStatus()

      if (permission === 'denied') {
        toast.error('Notifications bloquées. Activez-les dans les paramètres du navigateur.')
        return
      }

      if (permission === 'default') {
        const newPermission = await notificationService.requestPermission()
        if (newPermission !== 'granted') {
          toast.error('Permission de notification refusée')
          return
        }
        await notificationService.showWelcomeNotification()
        toast.success('Notifications activées! Bienvenue chez Koncept Studio 💪')
      } else {
        await notificationService.showTestNotification()
        toast.success('Notification de test envoyée!')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la notification')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleNotificationTest}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      <IconBell className="w-4 h-4 mr-2" />
      {isLoading ? 'Envoi...' : 'Test Notif'}
    </Button>
  )
}