'use client'

import { useState } from 'react'
import { format, differenceInDays, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  IconCalendar,
  IconClock,
  IconCreditCard,
  IconUser,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconArrowLeft,
  IconTrendingUp,
  IconBarChart,
  IconTarget,
  IconClock as IconTimer
} from '@tabler/icons-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name: string
  email: string
  subscription_status?: string
}

interface Subscription {
  id: string
  status: 'active' | 'expired' | 'cancelled'
  credits_remaining: number
  credits_used: number
  weekly_credits_used: number
  start_date: string
  end_date: string
  last_weekly_reset: string
  created_at: string
  subscription_plans: {
    id: string
    name: string
    type: 'carnet' | 'personal_training' | 'abonnement'
    credits: number
    price_dhs: number
    validity_months: number
    weekly_limit?: number
    description?: string
  }
}

interface SubscriptionHistory {
  id: string
  status: 'active' | 'expired' | 'cancelled'
  credits_remaining: number
  credits_used: number
  start_date: string
  end_date: string
  created_at: string
  subscription_plans: {
    name: string
    type: 'carnet' | 'personal_training' | 'abonnement'
  }
}

interface SubscriptionRequest {
  id: string
  status: 'pending' | 'contacted' | 'resolved' | 'cancelled'
  requested_at: string
  contacted_at?: string
  resolved_at?: string
  notes?: string
  subscription_plans: {
    name: string
    type: 'carnet' | 'personal_training' | 'abonnement'
  }
}

interface RecentBooking {
  id: string
  booked_at: string
  status: 'confirmed' | 'cancelled' | 'no_show'
  class_schedules: {
    start_datetime: string
    classes: {
      title: string
    }
  }
}

interface UserSubscriptionViewProps {
  user: UserProfile
  currentSubscription?: Subscription
  subscriptionHistory: SubscriptionHistory[]
  subscriptionRequests: SubscriptionRequest[]
  recentBookings: RecentBooking[]
}

export function UserSubscriptionView({ 
  user, 
  currentSubscription, 
  subscriptionHistory, 
  subscriptionRequests,
  recentBookings 
}: UserSubscriptionViewProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'contacted':
        return 'text-blue-600 bg-blue-100'
      case 'resolved':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'expired':
        return 'Expiré'
      case 'cancelled':
        return 'Annulé'
      case 'pending':
        return 'En attente'
      case 'contacted':
        return 'Contacté'
      case 'resolved':
        return 'Résolu'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carnet':
        return 'Carnet'
      case 'personal_training':
        return 'Personal Training'
      case 'abonnement':
        return 'Abonnement'
      default:
        return type
    }
  }

  // Calculate usage statistics
  const thisWeekBookings = recentBookings.filter(booking => {
    const bookingDate = new Date(booking.class_schedules.start_datetime)
    const weekStart = startOfWeek(new Date(), { locale: fr })
    const weekEnd = endOfWeek(new Date(), { locale: fr })
    return bookingDate >= weekStart && bookingDate <= weekEnd
  })

  const thisMonthBookings = recentBookings.filter(booking => {
    const bookingDate = new Date(booking.class_schedules.start_datetime)
    const now = new Date()
    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/espace">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon abonnement</h1>
            <p className="text-muted-foreground mt-2">
              Gérez votre abonnement et consultez votre utilisation
            </p>
          </div>
        </div>

        {/* Current Subscription or Status */}
        {currentSubscription ? (
          <div className="mb-8">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Abonnement actuel</CardTitle>
                  <Badge className={getStatusColor(currentSubscription.status)}>
                    <IconCircleCheck className="h-3 w-3 mr-1" />
                    {getStatusLabel(currentSubscription.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Plan</div>
                    <div className="font-semibold">{currentSubscription.subscription_plans.name}</div>
                    <Badge variant="outline">{getTypeLabel(currentSubscription.subscription_plans.type)}</Badge>
                  </div>
                  
                  {currentSubscription.subscription_plans.type === 'abonnement' ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Utilisation hebdomadaire</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{currentSubscription.weekly_credits_used} / {currentSubscription.subscription_plans.weekly_limit} séances</span>
                          <span>{Math.round((currentSubscription.weekly_credits_used / (currentSubscription.subscription_plans.weekly_limit || 1)) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(currentSubscription.weekly_credits_used / (currentSubscription.subscription_plans.weekly_limit || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Crédits</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{currentSubscription.credits_remaining} / {currentSubscription.subscription_plans.credits} restants</span>
                          <span>{Math.round((currentSubscription.credits_used / currentSubscription.subscription_plans.credits) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(currentSubscription.credits_used / currentSubscription.subscription_plans.credits) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Période</div>
                    <div className="font-medium">
                      {format(new Date(currentSubscription.start_date), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      au {format(new Date(currentSubscription.end_date), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Temps restant</div>
                    <div className="font-medium">
                      {differenceInDays(new Date(currentSubscription.end_date), new Date())} jours
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentSubscription.subscription_plans.price_dhs} DHS
                    </div>
                  </div>
                </div>

                {currentSubscription.subscription_plans.description && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{currentSubscription.subscription_plans.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-8">
            {subscriptionRequests.length > 0 ? (
              <Alert className="border-l-4 border-l-yellow-500">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Demande d'abonnement en cours</div>
                  <p className="text-sm">
                    {subscriptionRequests[0].status === 'contacted' 
                      ? 'Un administrateur vous a contacté. Effectuez le paiement pour activer votre abonnement.'
                      : 'Votre demande d\'abonnement est en cours de traitement. Vous serez contacté sous peu.'
                    }
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Plan demandé: {subscriptionRequests[0].subscription_plans.name}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-l-4 border-l-blue-500">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Aucun abonnement actif</div>
                  <p className="text-sm">
                    Vous n'avez pas d'abonnement actif actuellement. Contactez l'administration pour souscrire à un plan.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Usage Statistics */}
        {currentSubscription && recentBookings.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBarChart className="h-5 w-5" />
                  Statistiques d'utilisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <IconTimer className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{thisWeekBookings.length}</div>
                    <div className="text-sm text-muted-foreground">Cours cette semaine</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-green-100 p-3 rounded-full">
                        <IconTrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{thisMonthBookings.length}</div>
                    <div className="text-sm text-muted-foreground">Cours ce mois</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <IconTarget className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{currentSubscription.credits_used}</div>
                    <div className="text-sm text-muted-foreground">Total utilisé</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for History and Requests */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">
              Historique des abonnements ({subscriptionHistory.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Demandes ({subscriptionRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Subscription History */}
          <TabsContent value="history" className="space-y-4">
            {subscriptionHistory.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <IconCreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Aucun historique</h3>
                  <p className="text-muted-foreground">
                    Votre historique d'abonnements apparaîtra ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              subscriptionHistory.map(subscription => (
                <Card key={subscription.id} className={subscription.status === 'active' ? 'border-l-4 border-l-green-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{subscription.subscription_plans.name}</h3>
                            <Badge variant="outline">{getTypeLabel(subscription.subscription_plans.type)}</Badge>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status === 'active' ? <IconCircleCheck className="h-3 w-3 mr-1" /> : <IconCircleX className="h-3 w-3 mr-1" />}
                              {getStatusLabel(subscription.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Période</div>
                            <div>{format(new Date(subscription.start_date), 'dd/MM/yyyy', { locale: fr })}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Fin</div>
                            <div>{format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: fr })}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Utilisé</div>
                            <div>{subscription.credits_used} crédits</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Restant</div>
                            <div>{subscription.credits_remaining} crédits</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Subscription Requests */}
          <TabsContent value="requests" className="space-y-4">
            {subscriptionRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <IconUser className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Aucune demande</h3>
                  <p className="text-muted-foreground">
                    Vos demandes d'abonnement apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              subscriptionRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{request.subscription_plans.name}</h3>
                            <Badge variant="outline">{getTypeLabel(request.subscription_plans.type)}</Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Demandé le</div>
                            <div>{format(new Date(request.requested_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
                          </div>
                          {request.contacted_at && (
                            <div>
                              <div className="text-muted-foreground">Contacté le</div>
                              <div>{format(new Date(request.contacted_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
                            </div>
                          )}
                          {request.resolved_at && (
                            <div>
                              <div className="text-muted-foreground">Résolu le</div>
                              <div>{format(new Date(request.resolved_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
                            </div>
                          )}
                        </div>

                        {request.notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Note de l'administration:</div>
                            <div className="text-sm">{request.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}