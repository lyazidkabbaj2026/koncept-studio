/**
 * Calendar Week View Component
 * Displays a weekly calendar view with classes and booking functionality
 */
import React from 'react'
import { format, isSameDay, isToday, isPast, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconClock, IconUser, IconMapPin, IconUsers } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useBooking } from '@/hooks/use-booking'

interface CalendarEvent {
  id: string
  title: string
  start_datetime: string
  end_datetime: string
  max_participants: number
  booked_count: number
  coach?: string
  location?: string
  description?: string
  user_booking?: {
    id: string
    status: string
  }
  class_schedules?: {
    id: string
    class: {
      title: string
      coach: string
      location: string
      duration: number
    }
  }
}

interface CalendarWeekViewProps {
  weekDays: Date[]
  events: CalendarEvent[]
  subscription: any
  onEventClick: (event: CalendarEvent) => void
  onRefresh: () => void
}

export function CalendarWeekView({
  weekDays,
  events,
  subscription,
  onEventClick,
  onRefresh
}: CalendarWeekViewProps) {
  const { isBooking, canBook, bookClass } = useBooking({
    subscription,
    onBookingSuccess: onRefresh
  })

  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.start_datetime), day)
    )
  }

  const handleBooking = async (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await bookClass(event.id)
    if (success) {
      onRefresh()
    }
  }

  const getBookingButton = (event: CalendarEvent) => {
    if (event.user_booking?.status === 'confirmed') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-6"
          onClick={(e) => {
            e.stopPropagation()
            onEventClick(event)
          }}
        >
          Annuler
        </Button>
      )
    }

    const isPastEvent = isPast(new Date(event.start_datetime))
    const isFullyBooked = event.booked_count >= event.max_participants
    const bookingCheck = canBook(event)

    if (isPastEvent) {
      return (
        <Button size="sm" variant="secondary" disabled className="w-full text-xs h-6">
          Passé
        </Button>
      )
    }

    if (isFullyBooked) {
      return (
        <Button size="sm" variant="secondary" disabled className="w-full text-xs h-6">
          Complet
        </Button>
      )
    }

    if (!bookingCheck.canBook) {
      return (
        <Button size="sm" variant="secondary" disabled className="w-full text-xs h-6">
          Complet
        </Button>
      )
    }

    return (
      <Button
        size="sm"
        variant="default"
        onClick={(e) => handleBooking(event, e)}
        disabled={isBooking}
        className="w-full text-xs h-6"
      >
        {isBooking ? 'Réservation...' : 'Réserver'}
      </Button>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-2 mb-6">
      {weekDays.map((day, index) => {
        const dayEvents = getEventsForDay(day)
        const isCurrentDay = isToday(day)

        return (
          <div key={index} className="space-y-2">
            <div className={cn(
              "text-center p-2 rounded-lg transition-colors",
              isCurrentDay ? "bg-primary text-primary-foreground font-semibold" : "bg-muted"
            )}>
              <div className="text-sm font-medium">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className={cn(
                "text-xl",
                isCurrentDay ? "font-bold" : "font-medium"
              )}>
                {format(day, 'd')}
              </div>
            </div>

            <div className="space-y-2 min-h-[300px]">
              {dayEvents.map((event) => {
                const eventClass = event.class_schedules?.class || {
                  title: event.title,
                  coach: event.coach || 'Coach',
                  location: event.location || 'Studio',
                  duration: 45
                }

                const spotsLeft = event.max_participants - event.booked_count
                const isUserBooked = event.user_booking?.status === 'confirmed'

                return (
                  <Card
                    key={event.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      isUserBooked ? "ring-2 ring-primary bg-primary/5" : "",
                      isPast(new Date(event.start_datetime)) ? "opacity-60" : ""
                    )}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-tight">
                          {eventClass.title}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconClock className="w-3 h-3" />
                          <span>
                            {format(new Date(event.start_datetime), 'HH:mm', { locale: fr })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconUser className="w-3 h-3" />
                          <span>{eventClass.coach}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconMapPin className="w-3 h-3" />
                          <span>{eventClass.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <IconUsers className="w-3 h-3" />
                            <span>{spotsLeft} places</span>
                          </div>

                          {isUserBooked && (
                            <Badge variant="default" className="text-xs px-2 py-0">
                              Réservé
                            </Badge>
                          )}
                        </div>
                      </div>

                      {getBookingButton(event)}
                    </CardContent>
                  </Card>
                )
              })}

              {dayEvents.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aucun cours
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}