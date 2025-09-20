'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconWifi, IconRefresh } from '@tabler/icons-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Koncept Studio Logo"
              width={64}
              height={64}
              className="w-16 h-16 dark:invert"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gradient mb-2">
              Mode hors ligne
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <IconWifi className="w-5 h-5" />
              <span>Connexion internet requise</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.
            </p>

            <div className="space-y-3">
              <h3 className="font-semibold">Fonctionnalités disponibles hors ligne :</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Navigation dans l'application</li>
                <li>• Consultation des informations du studio</li>
                <li>• Accès aux pages statiques</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-semibold">Nécessite une connexion :</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Réservation de cours</li>
                <li>• Gestion du profil</li>
                <li>• Consultation du planning en temps réel</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <IconRefresh className="w-4 h-4" />
              Réessayer
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Note: metadata is moved to layout.tsx since this is now a client component