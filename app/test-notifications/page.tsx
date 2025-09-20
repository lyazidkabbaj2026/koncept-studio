import { NotificationTester } from '@/components/notifications/notification-tester'

export default function TestNotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">
            Test des Notifications PWA
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Testez les fonctionnalités de notification de l'application Progressive Web App de Koncept Studio.
            Activez les notifications pour recevoir des alertes pour vos cours, réservations et rappels.
          </p>
        </div>

        <NotificationTester />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Conseil : Pour une meilleure expérience, installez l'application sur votre appareil depuis le menu de votre navigateur
          </p>
        </div>
      </div>
    </div>
  )
}