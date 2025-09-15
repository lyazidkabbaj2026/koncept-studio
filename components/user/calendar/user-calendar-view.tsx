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
  subscriptionRequest?: SubscriptionRequest
}

export function UserCalendarView({ user, subscription: initialSubscription, subscriptionRequest }: UserCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<ClassEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [subscription, setSubscription] = useState(initialSubscription)
  const supabase = createClient()

  // Sync subscription state with props
  useEffect(() => {
    setSubscription(initialSubscription)
  }, [initialSubscription])

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

      // Direct booking implementation (bypassing the problematic RPC function)

      // First, check if the class still has capacity and user can book
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('class_schedules')
        .select(`
          id,
          class_id,
          current_bookings,
          classes!inner(
            id,
            max_capacity,
            title
          )
        `)
        .eq('id', event.id)
        .single()

      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError)
        throw new Error('Erreur lors de la vérification de la classe')
      }


      if (!scheduleData) {
        throw new Error('Classe non trouvée')
      }

      // Check if class is full
      if (scheduleData.current_bookings >= scheduleData.classes.max_capacity) {
        throw new Error('Cette classe est complète')
      }

      // Check if user already has a booking for this class
      const { data: existingBooking, error: bookingCheckError } = await supabase
        .from('class_bookings')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('schedule_id', event.id)
        .maybeSingle()

      if (bookingCheckError) {
        console.error('Error checking existing booking:', bookingCheckError)
        throw new Error('Erreur lors de la vérification des réservations')
      }

      if (existingBooking) {
        throw new Error('Vous avez déjà réservé cette classe')
      }

      // Create the booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('class_bookings')
        .insert({
          user_id: user.id,
          schedule_id: event.id,
          subscription_id: subscription?.id,
          status: 'confirmed'
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        throw new Error('Erreur lors de la création de la réservation')
      }


      // Update subscription credits
      if (subscription) {

        if (subscription.subscription_plans?.type === 'abonnement') {
          // Update weekly credits used for subscription plans
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ weekly_credits_used: subscription.weekly_credits_used + 1 })
            .eq('id', subscription.id)

          if (updateError) {
            console.error('Error updating weekly credits:', updateError)
            throw new Error('Erreur lors de la mise à jour des crédits hebdomadaires')
          } else {
          }
        } else {
          // Update credits remaining for credit-based plans
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              credits_remaining: subscription.credits_remaining - 1,
              credits_used: (subscription.credits_used || 0) + 1
            })
            .eq('id', subscription.id)

          if (updateError) {
            console.error('Error updating credits:', updateError)
            throw new Error('Erreur lors de la mise à jour des crédits')
          } else {
          }
        }
      } else {
        console.warn('No subscription found, cannot update credits')
      }


      // Update local subscription state to reflect the credit deduction
      if (subscription) {
        const updatedSubscription = { ...subscription }

        if (subscription.subscription_plans?.type === 'abonnement') {
          updatedSubscription.weekly_credits_used = subscription.weekly_credits_used + 1
        } else {
          updatedSubscription.credits_remaining = subscription.credits_remaining - 1
          updatedSubscription.credits_used = (subscription.credits_used || 0) + 1
        }

        setSubscription(updatedSubscription)
      }

      // Refresh events to show updated booking status
      await fetchEvents()

      setError('')  // Clear any previous errors
    } catch (err: any) {
      console.error('Booking error:', err)
      setError(err.message || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWaitlist = async (event: ClassEvent) => {
    try {
      const { data, error } = await supabase.rpc('join_waitlist', {
        user_uuid: user.id,
        schedule_uuid: event.id
      })

      if (error) throw error

      // Refresh events to show updated waitlist status
      await fetchEvents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCancelBooking = async (event: ClassEvent) => {
    if (!event.user_booking) return

    try {
      const { error } = await supabase
        .from('class_bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Annulé par l\'utilisateur'
        })
        .eq('id', event.user_booking.id)

      if (error) throw error

      // Refresh events
      await fetchEvents()
    } catch (err: any) {
      setError(err.message)
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
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Débutant'
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

    // Check subscription limits
    if (subscription.subscription_plans.type === 'abonnement') {
      const canBook = subscription.weekly_credits_used < (subscription.subscription_plans.weekly_limit || 0)
      return canBook
    } else {
      const canBook = subscription.credits_remaining > 0
      return canBook
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
                <div className="font-medium mb-2">Configuration en cours</div>
                <p className="text-sm">
                  Votre compte est activé mais votre abonnement est en cours de configuration. 
                  Veuillez contacter l'administration pour finaliser la configuration.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }
    
    const isContacted = subscriptionRequest?.status === 'contacted'
    
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
                {isContacted ? 'Paiement en attente' : 'Compte en attente de validation'}
              </div>
              <p className="text-sm">
                {isContacted 
                  ? 'Un administrateur vous a contacté. Effectuez le paiement pour activer votre abonnement et commencer à réserver des cours.'
                  : 'Votre compte doit être validé par un administrateur après paiement pour pouvoir réserver des cours. Vous serez contacté sous peu.'
                }
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

            {subscription && (
              <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-soft min-w-fit">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {subscription.subscription_plans?.type === 'abonnement' ? 'Cette semaine' : 'Crédits'}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                    {subscription.subscription_plans?.type === 'abonnement'
                      ? `${(subscription.subscription_plans.weekly_limit || 0) - subscription.weekly_credits_used}`
                      : subscription.credits_remaining
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {subscription.subscription_plans?.type === 'abonnement'
                      ? `sur ${subscription.subscription_plans.weekly_limit || 0}`
                      : 'restants'
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Badge variant="secondary" className="text-xs w-fit">
              Seuls les cours futurs sont affichés
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-primary bg-primary/10 rounded"></div>
                <span>Réservé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-muted-foreground bg-muted rounded"></div>
                <span>Liste d'attente</span>
              </div>
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
                      isCurrentDay && "bg-primary/10 border-primary/20"
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
                                event.user_booking && "border-l-primary bg-primary/10 hover:bg-primary/20",
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
                                            className="w-full text-xs text-destructive hover:text-destructive h-6"
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
                                              Liste d'attente
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
                isCurrentDay ? "border-l-primary bg-primary/5" : "border-l-border"
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
                            event.user_booking && "border-l-primary bg-primary/10",
                            event.user_waitlist_position && "border-l-muted-foreground bg-muted",
                            !event.user_booking && !event.user_waitlist_position && "border-l-primary bg-primary/5"
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
                                        className="text-destructive hover:text-destructive"
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
                          setShowEventModal(false)
                        }}
                        className="text-destructive hover:text-destructive"
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
                          selectedEvent.max_capacity - selectedEvent.current_bookings <= 2 && "text-red-600",
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
                              selectedEvent.current_bookings / selectedEvent.max_capacity >= 0.9 ? "bg-red-500" :
                              selectedEvent.current_bookings / selectedEvent.max_capacity >= 0.7 ? "bg-yellow-500" :
                              "bg-green-500"
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
                                level <= (selectedEvent.difficulty_level === 'beginner' ? 1 : 
                                         selectedEvent.difficulty_level === 'intermediate' ? 3 : 5) 
                                  ? "text-yellow-400 fill-yellow-400" 
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