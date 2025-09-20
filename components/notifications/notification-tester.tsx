'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notificationService } from '@/lib/services/notification.service'
import { IconBell, IconBellOff, IconTestPipe, IconCheck, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'

export function NotificationTester() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationService.init()
      setPermission(notificationService.getPermissionStatus())
    }

    initializeNotifications()
  }, [])

  const requestPermission = async () => {
    setIsLoading(true)
    try {
      const newPermission = await notificationService.requestPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        toast.success('Notifications activées avec succès!')
        // Show welcome notification
        await notificationService.showWelcomeNotification()
      } else {
        toast.error('Permission de notification refusée')
      }
    } catch (error) {
      toast.error('Erreur lors de la demande de permission')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      await notificationService.showTestNotification()
      toast.success('Notification de test envoyée!')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la notification')
      console.error(error)
    }
  }

  const sendBookingConfirmation = async () => {
    try {
      await notificationService.showBookingConfirmation('Cardio Boxing', 'Lundi 21 Sept à 18h30')
      toast.success('Notification de réservation envoyée!')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
      console.error(error)
    }
  }

  const sendClassReminder = async () => {
    try {
      await notificationService.showClassReminder('TRX Training', '15 minutes')
      toast.success('Rappel de cours envoyé!')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
      console.error(error)
    }
  }

  const sendWaitlistUpdate = async () => {
    try {
      await notificationService.showWaitlistUpdate('Cycling', 'confirmed')
      toast.success('Notification de liste d\'attente envoyée!')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
      console.error(error)
    }
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="gap-1"><IconCheck className="w-3 h-3" />Autorisées</Badge>
      case 'denied':
        return <Badge variant="destructive" className="gap-1"><IconX className="w-3 h-3" />Bloquées</Badge>
      default:
        return <Badge variant="secondary" className="gap-1"><IconBell className="w-3 h-3" />En attente</Badge>
    }
  }

  const getPermissionIcon = () => {
    return permission === 'granted' ? <IconBell className="w-5 h-5" /> : <IconBellOff className="w-5 h-5" />
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getPermissionIcon()}
          <div>
            <CardTitle>Notifications PWA</CardTitle>
            <CardDescription>
              Testez les notifications push de l'application
            </CardDescription>
          </div>
          {getPermissionBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Permission Management */}
        <div className="space-y-3">
          <h3 className="font-semibold">Gestion des permissions</h3>
          <div className="flex gap-3">
            <Button
              onClick={requestPermission}
              disabled={permission === 'granted' || isLoading}
              variant={permission === 'granted' ? 'outline' : 'default'}
              className="gap-2"
            >
              <IconBell className="w-4 h-4" />
              {permission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
            </Button>
          </div>

          {permission === 'denied' && (
            <p className="text-sm text-muted-foreground">
              Les notifications sont bloquées. Vous pouvez les réactiver dans les paramètres de votre navigateur.
            </p>
          )}
        </div>

        {/* Test Notifications */}
        {permission === 'granted' && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test des notifications</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={sendTestNotification}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                <IconTestPipe className="w-4 h-4" />
                Test simple
              </Button>

              <Button
                onClick={sendBookingConfirmation}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                ✅ Réservation confirmée
              </Button>

              <Button
                onClick={sendClassReminder}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                ⏰ Rappel de cours
              </Button>

              <Button
                onClick={sendWaitlistUpdate}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                🎉 Liste d'attente
              </Button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">À propos des notifications PWA :</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Fonctionnent même quand l'app est fermée</li>
            <li>Apparaissent dans la zone de notification du système</li>
            <li>Peuvent être personnalisées avec des icônes et actions</li>
            <li>Respectent les préférences de l'utilisateur</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}