'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  IconUser,
  IconCreditCard,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconActivity,
  IconAlertTriangle
} from '@tabler/icons-react'

interface UserDashboardData {
  profile: {
    id: string
    email: string
    full_name: string
    phone?: string
    subscription_status: string
    role: string
  }
  active_subscription: {
    id: string
    status: string
    credits_remaining: number
    weekly_credits_used: number
    end_date: string
    start_date: string
    plan: {
      id: string
      name: string
      type: string
      weekly_limit?: number
      credits: number
      price_dhs: number
    }
  } | null
  recent_bookings: Array<{
    id: string
    status: string
    booked_at: string
    cancelled_at?: string
    class_title: string
    start_datetime: string
    end_datetime: string
    coach: string
    location: string
  }> | null
  upcoming_classes: Array<{
    id: string
    title: string
    description?: string
    start_datetime: string
    end_datetime: string
    coach: string
    location: string
    difficulty_level: string
    current_bookings: number
    max_capacity: number
    user_booked: boolean
    user_booking_id?: string
    user_waitlist_position?: number
  }> | null
}

interface UserDashboardOptimizedProps {
  userId: string
}

export function UserDashboardOptimized({ userId }: UserDashboardOptimizedProps) {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Single optimized query instead of multiple separate queries
      const { data, error } = await supabase.rpc('get_user_dashboard_data', {
        user_uuid: userId
      })

      if (error) throw error
      setDashboardData(data)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(`Erreur lors du chargement: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBookClass = async (classId: string) => {
    try {
      const { data, error } = await supabase.rpc('book_class', {
        user_uuid: userId,
        schedule_uuid: classId
      })

      if (error) throw error

      // Refresh dashboard data
      await fetchDashboardData()
    } catch (err: any) {
      console.error('Error booking class:', err)
      setError(`Erreur lors de la réservation: ${err.message}`)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.rpc('cancel_booking', {
        booking_uuid: bookingId,
        user_uuid: userId
      })

      if (error) throw error

      // Refresh dashboard data
      await fetchDashboardData()
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      setError(`Erreur lors de l'annulation: ${err.message}`)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'En attente', variant: 'secondary' as const },
      'contacted': { label: 'Contacté', variant: 'secondary' as const },
      'active': { label: 'Actif', variant: 'default' as const },
      'expired': { label: 'Expiré', variant: 'destructive' as const },
      'inactive': { label: 'Inactif', variant: 'secondary' as const }
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'secondary' as const
    }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getDifficultyBadge = (level: string) => {
    const levelMap = {
      'beginner': { label: 'Débutant', variant: 'secondary' as const },
      'intermediate': { label: 'Intermédiaire', variant: 'default' as const },
      'advanced': { label: 'Avancé', variant: 'destructive' as const }
    }

    const levelInfo = levelMap[level as keyof typeof levelMap] || {
      label: level,
      variant: 'secondary' as const
    }

    return <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertDescription>Aucune donnée disponible</AlertDescription>
      </Alert>
    )
  }

  const { profile, active_subscription, recent_bookings, upcoming_classes } = dashboardData

  return (
    <div className="space-y-6">
      {/* Profile & Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profil</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{profile.full_name}</div>
              <div className="text-sm text-muted-foreground">{profile.email}</div>
              {getStatusBadge(profile.subscription_status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnement</CardTitle>
            <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {active_subscription ? (
              <div className="space-y-2">
                <div className="text-lg font-bold">{active_subscription.plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  Type: {active_subscription.plan.type}
                </div>
                {active_subscription.plan.type === 'abonnement' ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      {active_subscription.weekly_credits_used}/{active_subscription.plan.weekly_limit} séances cette semaine
                    </div>
                    <Progress
                      value={(active_subscription.weekly_credits_used / (active_subscription.plan.weekly_limit || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ) : (
                  <div className="text-sm">
                    {active_subscription.credits_remaining} crédits restants
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Expire le {format(new Date(active_subscription.end_date), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Aucun abonnement actif
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours à venir</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcoming_classes?.filter(c => c.user_booked).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Cours réservés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      {upcoming_classes && upcoming_classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cours disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming_classes.slice(0, 6).map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{classItem.title}</div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <IconClock className="h-3 w-3 mr-1" />
                        {format(new Date(classItem.start_datetime), 'dd/MM à HH:mm', { locale: fr })}
                      </div>
                      <div className="flex items-center">
                        <IconMapPin className="h-3 w-3 mr-1" />
                        {classItem.location}
                      </div>
                      <div className="flex items-center">
                        <IconUsers className="h-3 w-3 mr-1" />
                        {classItem.current_bookings}/{classItem.max_capacity}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Coach: {classItem.coach}</span>
                      {getDifficultyBadge(classItem.difficulty_level)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {classItem.user_booked ? (
                      <div className="flex items-center space-x-2">
                        <Badge>Réservé</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => classItem.user_booking_id && handleCancelBooking(classItem.user_booking_id)}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : classItem.user_waitlist_position ? (
                      <Badge variant="secondary">
                        Liste d'attente ({classItem.user_waitlist_position})
                      </Badge>
                    ) : classItem.current_bookings >= classItem.max_capacity ? (
                      <Badge variant="secondary">Complet</Badge>
                    ) : active_subscription ? (
                      <Button
                        size="sm"
                        onClick={() => handleBookClass(classItem.id)}
                      >
                        Réserver
                      </Button>
                    ) : (
                      <Badge variant="destructive">Abonnement requis</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {recent_bookings && recent_bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Réservations récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recent_bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{booking.class_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(booking.start_datetime), 'dd/MM/yyyy à HH:mm', { locale: fr })} • {booking.coach}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(booking.status)}
                    {booking.status === 'cancelled' && booking.cancelled_at && (
                      <span className="text-xs text-muted-foreground">
                        Annulé le {format(new Date(booking.cancelled_at), 'dd/MM', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}