'use client'

import { useState, useEffect } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarView, CalendarEvent, CalendarViewType } from '@/components/admin/calendar/calendar-view'
import { ScheduleForm } from '@/components/admin/calendar/schedule-form'
import { EventDetailsModal } from '@/components/admin/calendar/event-details-modal'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconCalendar, IconClock, IconUsers } from '@tabler/icons-react'

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<CalendarViewType>('day')
  const supabase = createClient()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_datetime', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Erreur lors du chargement des événements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || new Date())
    setSelectedEvent(null)
    setShowScheduleForm(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleCloseScheduleForm = () => {
    setShowScheduleForm(false)
    fetchEvents() // Refresh events after creating/editing
  }

  const handleCloseEventDetails = () => {
    setSelectedEvent(null)
    fetchEvents() // Refresh events after any modifications
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(new Date(event.start_datetime))
    setShowScheduleForm(true)
  }

  const getViewStats = () => {
    let dateRange: { start: Date; end: Date }
    let periodLabel: string

    switch (currentView) {
      case 'day':
        dateRange = {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        }
        periodLabel = format(selectedDate, 'EEEE d MMMM', { locale: fr }).replace(/(^\w|\s\w)/g, (c) => c.toUpperCase())
        break
      case 'week':
        dateRange = {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 })
        }
        periodLabel = `Semaine du ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'd MMM', { locale: fr }).replace(/(^\w|\s\w)/g, (c) => c.toUpperCase())}`
        break
      case 'month':
        dateRange = {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        }
        periodLabel = format(selectedDate, 'MMMM yyyy', { locale: fr }).replace(/^\w/, (c) => c.toUpperCase())
        break
      default:
        dateRange = {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        }
        periodLabel = 'Aujourd\'hui'
    }

    const periodEvents = events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return (eventDate >= dateRange.start && eventDate <= dateRange.end)
    })

    const totalBookings = periodEvents.reduce((sum, event) => sum + event.current_bookings, 0)
    const totalCapacity = periodEvents.reduce((sum, event) => sum + event.max_capacity, 0)
    // TODO: Add cancellations data from database when available
    const totalCancellations = 0 // Placeholder - will need to query cancelled bookings

    const bookingPercentage = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0
    const cancellationPercentage = totalCapacity > 0 ? Math.round((totalCancellations / totalCapacity) * 100) : 0

    return {
      eventsCount: periodEvents.length,
      totalBookings,
      totalCapacity,
      totalCancellations,
      bookingPercentage,
      cancellationPercentage,
      periodLabel
    }
  }

  const stats = getViewStats()

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Planning des Cours</h1>
        </div>
        <div className="text-center py-12">
          <IconCalendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planning des Cours</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours - {stats.periodLabel.replace(/(\b\w)/g, (c) => c.toUpperCase())}</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations - {stats.periodLabel.replace(/(\b\w)/g, (c) => c.toUpperCase())}</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingPercentage}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalBookings} sur {stats.totalCapacity} places</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulations - {stats.periodLabel.replace(/(\b\w)/g, (c) => c.toUpperCase())}</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancellationPercentage}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalCancellations} sur {stats.totalCapacity} places</p>
          </CardContent>
        </Card>

      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar */}
      <CalendarView
        events={events}
        onEventClick={handleEventClick}
        onCreateEvent={handleCreateEvent}
        onDateChange={setSelectedDate}
        onViewChange={setCurrentView}
      />

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleForm
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={handleCloseScheduleForm}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && !showScheduleForm && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseEventDetails}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  )
}