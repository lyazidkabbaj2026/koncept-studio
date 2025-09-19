'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isPast, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IconChevronLeft, IconChevronRight, IconCalendar, IconClock, IconUser, IconMapPin, IconAlertTriangle, IconCircleCheck, IconUsers, IconInfoCircle, IconStar, IconActivity } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { BookingService } from '@/lib/services/booking.service'
import confetti from 'canvas-confetti'

interface UserProfile {
  id: string
  full_name: string
  email: string
  subscription_status?: string
}

interface Subscription {
  id: string
  credits_remaining: number
  weekly_credits_used: number
  credits_used?: number
  end_date: string
  subscription_plans: {
    name: string
    type: 'carnet' | 'personal_training' | 'abonnement'
    weekly_limit?: number
  }
}

interface SubscriptionRequest {
  id: string
  status: 'pending' | 'contacted' | 'resolved' | 'cancelled'
  subscription_plans: {
    name: string
  }
}

interface ClassEvent {
  id: string
  class_id: string
  title: string
  description?: string
  coach: string
  location: string
  difficulty_level: string
  max_capacity: number
  start_datetime: string
  end_datetime: string
  current_bookings: number
  user_booking?: {
    id: string
    status: 'confirmed' | 'cancelled' | 'no_show'
  }
  user_waitlist_position?: number
}

interface UserCalendarViewProps {
  user: UserProfile
  subscription?: Subscription
}

export function UserCalendarView({ user, subscription: initialSubscription }: UserCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<ClassEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [subscription, setSubscription] = useState(initialSubscription)
  const [hasOnlyPersonalTraining, setHasOnlyPersonalTraining] = useState(false)
  const supabase = createClient()
  const bookingService = new BookingService()

  // Confetti animation for successful booking
  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // From left
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }))

      // From right
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }))
    }, 250)
  }

  // Sync subscription state with props
  useEffect(() => {
    setSubscription(initialSubscription)
  }, [initialSubscription])

  // Function to refresh subscription data
  const refreshSubscriptionData = async () => {
    if (!subscription) {
      console.log('🟡 No subscription to refresh')
      return
    }

    try {
      console.log('🟡 Refreshing subscription data for ID:', subscription.id)
      console.log('🟡 Current subscription before refresh:', {
        weekly_credits_used: subscription.weekly_credits_used,
        credits_remaining: subscription.credits_remaining,
        credits_used: subscription.credits_used
      })

      const { data: updatedSubscription, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('id', subscription.id)
        .single()

      console.log('🟡 Subscription refresh result:', { error, data: updatedSubscription })

      if (!error && updatedSubscription) {
        console.log('🟡 Updated subscription data:', {
          weekly_credits_used: updatedSubscription.weekly_credits_used,
          credits_remaining: updatedSubscription.credits_remaining,
          credits_used: updatedSubscription.credits_used
        })
        setSubscription(updatedSubscription)
      } else {
        console.error('Error refreshing subscription:', error)
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    }
  }

  // Check personal training status
  useEffect(() => {
    const checkPersonalTrainingStatus = async () => {
      try {
        const hasOnlyPT = await bookingService.hasOnlyPersonalTraining()
        setHasOnlyPersonalTraining(hasOnlyPT)
      } catch (error) {
        console.error('Error checking personal training status:', error)
      }
    }
    checkPersonalTrainingStatus()
  }, [])

  // Calculate 7 consecutive days starting from next available class
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
  
  const getWeekDays = (startDate: Date) => {
    // Return 7 consecutive days starting from startDate
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i))
    }
    return days
  }
  
  const weekDays = getWeekDays(weekStartDate)

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Use optimized view instead of calendar_events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events_optimized')
        .select('*')
        .gte('start_datetime', now.toISOString())
        .order('start_datetime')
        .limit(50) // Limit results for performance

      if (eventsError) throw eventsError

      // Set week start based on first available class or today
      const firstEventDate = eventsData && eventsData.length > 0
        ? new Date(eventsData[0].start_datetime)
        : now

      const calculatedWeekStart = new Date(
        firstEventDate.getFullYear(),
        firstEventDate.getMonth(),
        firstEventDate.getDate()
      )

      // Only show today if it has future classes, otherwise start from next available day
      const finalWeekStart = isSameDay(calculatedWeekStart, today) || isAfter(calculatedWeekStart, today)
        ? calculatedWeekStart
        : today

      setWeekStartDate(finalWeekStart)

      // Filter events for the week
      const weekEnd = addDays(finalWeekStart, 6)
      const weekEvents = eventsData?.filter(event => {
        const eventDate = new Date(event.start_datetime)
        return eventDate >= finalWeekStart && eventDate <= weekEnd
      }) || []

      // Fetch user's bookings and waitlist in parallel
      const [bookingsResult, waitlistResult] = await Promise.all([
        supabase
          .from('class_bookings')
          .select('schedule_id, id, status')
          .eq('user_id', user.id)
          .in('status', ['confirmed']),
        supabase
          .from('class_waitlist')
          .select('schedule_id, position')
          .eq('user_id', user.id)
      ])

      if (bookingsResult.error) throw bookingsResult.error
      if (waitlistResult.error) throw waitlistResult.error

      // Combine the data efficiently
      const eventsWithBookingStatus = weekEvents.map(event => ({
        ...event,
        user_booking: bookingsResult.data?.find(b => b.schedule_id === event.id),
        user_waitlist_position: waitlistResult.data?.find(w => w.schedule_id === event.id)?.position
      }))

      setEvents(eventsWithBookingStatus)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBookClass = async (event: ClassEvent) => {
    try {
      setLoading(true)

      // Check if user has only personal training subscription
      if (hasOnlyPersonalTraining) {
        toast.error('Réservation non disponible', {
          description: 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d\'ajouter un abonnement ou un carnet pour effectuer une réservation.',
          action: {
            label: 'Contacter',
            onClick: () => window.open('tel:0663235797')
          }
        })
        return
      }

      // Use the new booking service
      const result = await bookingService.bookClass({ scheduleId: event.id })

      if (!result.success) {
        // Handle specific error cases with appropriate messages
        switch (result.error) {
          case 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d\'ajouter un abonnement ou un carnet pour effectuer une réservation.':
            toast.error('Réservation non disponible', {
              description: result.error,
              action: {
                label: 'Contacter',
                onClick: () => window.open('tel:0663235797')
              }
            })
            break
          case 'Limite hebdomadaire de séances atteinte':
            toast.error('Limite hebdomadaire atteinte', {
              description: 'Vous avez utilisé tous vos cours pour cette semaine. La limite se réinitialise chaque semaine.'
            })
            break
          case 'Plus de crédits disponibles':
            toast.error('Plus de crédits disponibles', {
              description: 'Contactez-nous pour renouveler votre abonnement ou acheter de nouveaux crédits.',
              action: {
                label: 'Contacter',
                onClick: () => window.open('tel:0663235797')
              }
            })
            break
          case 'Le cours est complet':
            toast.error('Ce cours est complet', {
              description: 'Vous pouvez rejoindre la liste d\'attente si disponible.'
            })
            break
          case 'Vous avez déjà réservé ce cours':
            toast.error('Vous avez déjà réservé ce cours')
            break
          default:
            toast.error('Erreur lors de la réservation', {
              description: result.error || 'Une erreur inattendue s\'est produite'
            })
        }
        return
      }

      // Refresh events to show updated booking status
      await fetchEvents()

      // Refresh subscription data to show updated credits
      await refreshSubscriptionData()

      // Show success message
      toast.success('Cours réservé avec succès!', {
        description: `Votre cours "${event.title}" a été réservé.`
      })

      // Trigger confetti celebration
      triggerConfetti()

    } catch (err: any) {
      console.error('Booking error:', err)
      toast.error('Erreur lors de la réservation', {
        description: err.message || 'Une erreur inattendue s\'est produite'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWaitlist = async (event: ClassEvent) => {
    try {
      setLoading(true)

      // Use the BookingService to handle waitlist joining
      const result = await bookingService.joinWaitlist({ scheduleId: event.id })

      if (!result.success) {
        toast.error('Erreur lors de l\'ajout à la liste d\'attente', {
          description: result.error || 'Une erreur inattendue s\'est produite'
        })
        return
      }

      // Refresh events to show updated waitlist status
      await fetchEvents()

      // Refresh subscription data to show updated credits
      await refreshSubscriptionData()

      toast.success('Ajouté à la liste d\'attente!', {
        description: 'Vous serez automatiquement inscrit si une place se libère.'
      })

    } catch (err: any) {
      console.error('Waitlist join error:', err)
      toast.error('Erreur lors de l\'ajout à la liste d\'attente', {
        description: err.message || 'Une erreur inattendue s\'est produite'
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if cancellation is allowed (must be more than 1 hour before class starts)
  const canCancelBooking = (event: ClassEvent) => {
    if (!event.user_booking) return false

    const classStartTime = new Date(event.start_datetime)
    const now = new Date()
    const timeDifferenceInHours = (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return timeDifferenceInHours > 1
  }

  const handleCancelBooking = async (event: ClassEvent) => {
    if (!event.user_booking) return

    // Check if cancellation is allowed
    if (!canCancelBooking(event)) {
      toast.error('Annulation non autorisée', {
        description: 'Vous ne pouvez pas annuler cette réservation car elle commence dans moins d\'une heure. Nous vous invitons à assister au cours. Quoi qu\'il en soit, celui-ci sera comptabilisé comme consommé.'
      })
      return
    }

    try {
      setLoading(true)

      // Use the BookingService to handle cancellation and credit refund
      const result = await bookingService.cancelBooking(event.user_booking.id)

      if (!result.success) {
        toast.error('Erreur lors de l\'annulation', {
          description: result.error || 'Une erreur inattendue s\'est produite'
        })
        return
      }

      // Refresh events and subscription data
      await fetchEvents()
      await refreshSubscriptionData()

      toast.success('Cours annulé avec succès!', {
        description: `Votre réservation pour "${event.title}" a été annulée et vos crédits ont été remboursés.`
      })

    } catch (err: any) {
      console.error('Cancellation error:', err)
      toast.error('Erreur lors de l\'annulation', {
        description: err.message || 'Une erreur inattendue s\'est produite'
      })
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    const now = new Date()
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      const eventStart = new Date(event.start_datetime)
      
      // For events on the same day, check if they haven't started yet
      // For events on future days, show all of them
      return isSameDay(eventDate, date) && isAfter(eventStart, now)
    })
  }

  const handlePreviousWeek = () => {
    const newWeekStart = addDays(weekStartDate, -7)
    setWeekStartDate(newWeekStart)
    fetchEventsForWeek(newWeekStart)
  }

  const handleNextWeek = () => {
    const newWeekStart = addDays(weekStartDate, 7)
    setWeekStartDate(newWeekStart)
    fetchEventsForWeek(newWeekStart)
  }

  const fetchEventsForWeek = async (weekStart: Date) => {
    try {
      setLoading(true)
      const now = new Date()
      const weekEnd = addDays(weekStart, 6)
      
      // Fetch events for the specified week, but only future classes
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_datetime', now.toISOString()) // Only future classes
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', weekEnd.toISOString())
        .order('start_datetime')

      if (eventsError) throw eventsError

      // Fetch user's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('class_bookings')
        .select('schedule_id, id, status')
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'pending'])

      if (bookingsError) throw bookingsError

      // Fetch user's waitlist positions
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('class_waitlist')
        .select('schedule_id, position')
        .eq('user_id', user.id)

      if (waitlistError) throw waitlistError

      // Combine the data
      const eventsWithBookingStatus = eventsData?.map(event => ({
        ...event,
        user_booking: bookingsData?.find(b => b.schedule_id === event.id),
        user_waitlist_position: waitlistData?.find(w => w.schedule_id === event.id)?.position
      })) || []

      setEvents(eventsWithBookingStatus)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'all_levels':
        return 'Tous niveaux'
      case 'intermediate':
        return 'Intermédiaire'
      case 'advanced':
        return 'Avancé'
      default:
        return level
    }
  }

  const canUserBook = (event: ClassEvent) => {
    // User already booked
    if (event.user_booking) {
      return false
    }

    // Class has started or passed
    if (isPast(new Date(event.start_datetime))) {
      return false
    }

    // No valid subscription
    if (!subscription) {
      return false
    }

    // Class is full (but can join waitlist)
    if (event.current_bookings >= event.max_capacity) {
      return false
    }

    // Always return true - we'll handle credit/limit checks in handleBookClass
    return true
  }

  const hasCreditsOrLimit = () => {
    if (!subscription) return false

    if (subscription.subscription_plans.type === 'abonnement') {
      return subscription.weekly_credits_used < (subscription.subscription_plans.weekly_limit || 0)
    } else {
      return subscription.credits_remaining > 0
    }
  }

  const canJoinWaitlist = (event: ClassEvent) => {
    return !event.user_booking && 
           !event.user_waitlist_position && 
           event.current_bookings >= event.max_capacity &&
           !isPast(new Date(event.start_datetime)) &&
           subscription
  }

  const handleEventClick = (event: ClassEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  // Show different content based on subscription status
  if (!subscription) {
    // Check if user has active status in profile but no subscription record
    if (user.subscription_status === 'active') {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Planning des cours</h1>
              <p className="text-muted-foreground">Consultez les cours disponibles</p>
            </div>
            <Alert className="mb-6">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Aucun abonnement actif</div>
                <p className="text-sm">
                  Vous n'avez actuellement aucun abonnement actif.
                  Veuillez contacter l'administration pour renouveler votre abonnement ou en souscrire un nouveau.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }
    
    // Remove subscription request logic since we no longer use subscription_requests table
    
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Planning des cours</h1>
            <p className="text-muted-foreground">
              Consultez les cours disponibles et réservez votre place
            </p>
          </div>

          <Alert className="mb-6">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                Compte en attente de validation
              </div>
              <p className="text-sm">
                Votre compte doit être validé par un administrateur après paiement pour pouvoir réserver des cours. Vous serez contacté sous peu.
              </p>
            </AlertDescription>
          </Alert>

          {/* Show limited calendar view */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center p-2 font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <IconCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Le planning sera disponible après activation de votre abonnement</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gradient">
                Planning des cours
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Consultez et réservez vos cours à venir
              </p>
            </div>

          </div>

        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Desktop Calendar Grid */}
        <div className="hidden lg:block">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b border-border/50">
                {weekDays.map(day => {
                  const isCurrentDay = isToday(day)
                  return (
                    <div key={day.toISOString()} className={cn(
                      "p-4 text-center border-r border-border/50 last:border-r-0 bg-muted/20",
                      isCurrentDay && "bg-accent/20 border-accent"
                    )}>
                      <div className={cn(
                        "font-medium text-muted-foreground capitalize text-sm",
                        isCurrentDay && "text-primary"
                      )}>
                        {format(day, 'EEEE', { locale: fr })}
                      </div>
                      <div className={cn(
                        "text-2xl mt-1 font-semibold",
                        isCurrentDay && "text-primary font-bold"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {format(day, 'MMM', { locale: fr })}
                      </div>
                      {isCurrentDay && (
                        <Badge variant="default" className="mt-2 text-xs">Aujourd'hui</Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Calendar Body */}
              <div className="hidden lg:grid lg:grid-cols-7 min-h-[600px] rounded-b-xl overflow-hidden border border-border bg-card">
                {weekDays.map(day => {
                  const dayEvents = getEventsForDate(day)
                  const isCurrentDay = isToday(day)

                  return (
                    <div key={day.toISOString()} className={cn(
                      "border-r border-border last:border-r-0 p-3 transition-colors",
                      isCurrentDay && "bg-primary/5",
                      dayEvents.length === 0 && "bg-muted/10"
                    )}>
                      {dayEvents.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          Aucun cours
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map(event => {
                            const startTime = new Date(event.start_datetime)
                            const occupancyRate = Math.round((event.current_bookings / event.max_capacity) * 100)

                            return (
                              <Card key={event.id} className={cn(
                                "border-l-4 transition-all hover:shadow-soft cursor-pointer group bg-card/50 hover:bg-card border-border",
                                event.user_booking && "border-l-foreground bg-accent/10 hover:bg-accent/20",
                                event.user_waitlist_position && "border-l-muted-foreground bg-muted hover:bg-muted/80",
                                !event.user_booking && !event.user_waitlist_position && "border-l-border bg-background hover:bg-muted/50"
                              )}
                              onClick={() => handleEventClick(event)}>
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div>
                                      <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <IconClock className="h-3 w-3" />
                                        <span>{format(startTime, 'HH:mm')}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">
                                        {getDifficultyLabel(event.difficulty_level)}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground">
                                        {event.current_bookings}/{event.max_capacity}
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      {event.user_booking ? (
                                        <>
                                          <Badge variant="default" className="text-xs w-full justify-center">
                                            <IconCircleCheck className="h-3 w-3 mr-1" />
                                            Réservé
                                          </Badge>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleCancelBooking(event)
                                            }}
                                            className={cn(
                                              "w-full text-xs h-6",
                                              !canCancelBooking(event) && "opacity-50"
                                            )}
                                          >
                                            Annuler
                                          </Button>
                                        </>
                                      ) : event.user_waitlist_position ? (
                                        <Badge variant="secondary" className="text-xs w-full justify-center">
                                          Liste #{event.user_waitlist_position}
                                        </Badge>
                                      ) : (
                                        <>
                                          {canUserBook(event) ? (
                                            <Button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleBookClass(event)
                                              }}
                                              disabled={loading}
                                              size="sm"
                                              className="w-full text-xs h-6"
                                            >
                                              Réserver
                                            </Button>
                                          ) : canJoinWaitlist(event) ? (
                                            <Button
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleJoinWaitlist(event)
                                              }}
                                              disabled={loading}
                                              size="sm"
                                              className="w-full text-xs h-6"
                                            >
                                              Rejoindre liste d'attente
                                            </Button>
                                          ) : isPast(new Date(event.start_datetime)) ? (
                                            <Badge variant="secondary" className="text-xs w-full justify-center">Commencé</Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-xs w-full justify-center">Complet</Badge>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile/Tablet List View */}
        <div className="lg:hidden space-y-6">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day)
            const isCurrentDay = isToday(day)

            return (
              <Card key={day.toISOString()} className={cn(
                "shadow-soft transition-all border-l-4",
                isCurrentDay ? "border-l-foreground bg-accent/5" : "border-l-border"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold bg-muted text-muted-foreground transition-colors",
                        isCurrentDay && "bg-primary text-primary-foreground"
                      )}>
                        <div className="text-lg leading-none">
                          {format(day, 'd')}
                        </div>
                        <div className="text-xs leading-none mt-1 uppercase tracking-wide">
                          {format(day, 'MMM', { locale: fr })}
                        </div>
                      </div>
                      <div>
                        <div className={cn(
                          "font-semibold capitalize",
                          isCurrentDay && "text-primary"
                        )}>
                          {format(day, 'EEEE', { locale: fr })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dayEvents.length} cours
                        </div>
                      </div>
                    </div>
                    {isCurrentDay && (
                      <Badge variant="default">Aujourd'hui</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconCalendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun cours prévu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayEvents.map(event => {
                        const startTime = new Date(event.start_datetime)
                        const endTime = new Date(event.end_datetime)

                        return (
                          <Card key={event.id} className={cn(
                            "border-l-4 transition-all cursor-pointer hover:shadow-md",
                            event.user_booking && "border-l-foreground bg-accent/10",
                            event.user_waitlist_position && "border-l-muted-foreground bg-muted",
                            !event.user_booking && !event.user_waitlist_position && "border-l-accent bg-accent/5"
                          )}
                          onClick={() => handleEventClick(event)}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold mb-1">{event.title}</h3>
                                    {event.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="ml-2">
                                    {getDifficultyLabel(event.difficulty_level)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <IconClock className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <IconUser className="h-4 w-4 text-muted-foreground" />
                                    <span>{event.coach}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{event.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                                    <span>{event.current_bookings}/{event.max_capacity}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {event.user_booking ? (
                                    <>
                                      <Badge variant="default" className="flex-1 justify-center">
                                        <IconCircleCheck className="h-3 w-3 mr-1" />
                                        Réservé
                                      </Badge>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCancelBooking(event)
                                        }}
                                        className={cn(
                                          !canCancelBooking(event) && "opacity-50"
                                        )}
                                      >
                                        Annuler
                                      </Button>
                                    </>
                                  ) : event.user_waitlist_position ? (
                                    <Badge variant="secondary" className="flex-1 justify-center">
                                      Liste d'attente #{event.user_waitlist_position}
                                    </Badge>
                                  ) : (
                                    <>
                                      {canUserBook(event) ? (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleBookClass(event)
                                          }}
                                          disabled={loading}
                                          className="flex-1"
                                        >
                                          Réserver
                                        </Button>
                                      ) : canJoinWaitlist(event) ? (
                                        <Button
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleJoinWaitlist(event)
                                          }}
                                          disabled={loading}
                                          className="flex-1"
                                        >
                                          Rejoindre la liste d'attente
                                        </Button>
                                      ) : isPast(new Date(event.start_datetime)) ? (
                                        <Badge variant="secondary" className="flex-1 justify-center">Commencé</Badge>
                                      ) : (
                                        <Badge variant="secondary" className="flex-1 justify-center">Complet</Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Class Detail Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-sm">
                        {getDifficultyLabel(selectedEvent.difficulty_level)}
                      </Badge>
                      {selectedEvent.user_booking && (
                        <Badge variant="default" className="text-sm">
                          <IconCircleCheck className="h-3 w-3 mr-1" />
                          Réservé
                        </Badge>
                      )}
                      {selectedEvent.user_waitlist_position && (
                        <Badge variant="secondary" className="text-sm">
                          Liste d'attente #{selectedEvent.user_waitlist_position}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.start_datetime), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedEvent.user_booking ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCancelBooking(selectedEvent)
                          if (canCancelBooking(selectedEvent)) {
                            setShowEventModal(false)
                          }
                        }}
                        className={cn(
                          !canCancelBooking(selectedEvent) && "opacity-50"
                        )}
                      >
                        Annuler la réservation
                      </Button>
                    ) : selectedEvent.user_waitlist_position ? (
                      <Button variant="outline" disabled>
                        En liste d'attente
                      </Button>
                    ) : (
                      <>
                        {canUserBook(selectedEvent) ? (
                          <Button
                            onClick={() => {
                              handleBookClass(selectedEvent)
                              setShowEventModal(false)
                            }}
                            disabled={loading}
                          >
                            Réserver ce cours
                          </Button>
                        ) : canJoinWaitlist(selectedEvent) ? (
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleJoinWaitlist(selectedEvent)
                              setShowEventModal(false)
                            }}
                            disabled={loading}
                          >
                            Rejoindre la liste d'attente
                          </Button>
                        ) : isPast(new Date(selectedEvent.start_datetime)) ? (
                          <Button variant="outline" disabled>
                            Cours terminé
                          </Button>
                        ) : (
                          <Button variant="outline" disabled>
                            Cours complet
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconInfoCircle className="h-4 w-4" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Class Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconClock className="h-4 w-4" />
                        Horaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Début:</span>
                        <span className="font-medium">
                          {format(new Date(selectedEvent.start_datetime), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fin:</span>
                        <span className="font-medium">
                          {format(new Date(selectedEvent.end_datetime), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durée:</span>
                        <span className="font-medium">
                          {Math.round((new Date(selectedEvent.end_datetime).getTime() - new Date(selectedEvent.start_datetime).getTime()) / (1000 * 60))} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconUsers className="h-4 w-4" />
                        Participants
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inscrits:</span>
                        <span className="font-medium">{selectedEvent.current_bookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacité max:</span>
                        <span className="font-medium">{selectedEvent.max_capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Places restantes:</span>
                        <span className={cn(
                          "font-medium",
                          selectedEvent.max_capacity - selectedEvent.current_bookings <= 2 && "text-destructive",
                          selectedEvent.max_capacity - selectedEvent.current_bookings === 0 && "text-destructive"
                        )}>
                          {Math.max(0, selectedEvent.max_capacity - selectedEvent.current_bookings)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Taux de remplissage</span>
                          <span>{Math.round((selectedEvent.current_bookings / selectedEvent.max_capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all",
                              selectedEvent.current_bookings / selectedEvent.max_capacity >= 0.9 ? "bg-destructive" :
                              selectedEvent.current_bookings / selectedEvent.max_capacity >= 0.7 ? "bg-muted" :
                              "bg-muted-foreground"
                            )}
                            style={{ 
                              width: `${Math.min(100, (selectedEvent.current_bookings / selectedEvent.max_capacity) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconUser className="h-4 w-4" />
                        Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium">{selectedEvent.coach}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconMapPin className="h-4 w-4" />
                        Lieu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium">{selectedEvent.location}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconActivity className="h-4 w-4" />
                        Niveau
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getDifficultyLabel(selectedEvent.difficulty_level)}
                        </Badge>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <IconStar
                              key={level}
                              className={cn(
                                "h-4 w-4",
                                level <= (selectedEvent.difficulty_level === 'all_levels' ? 1 :
                                         selectedEvent.difficulty_level === 'intermediate' ? 3 : 5)
                                  ? "text-muted-foreground fill-muted-foreground"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}