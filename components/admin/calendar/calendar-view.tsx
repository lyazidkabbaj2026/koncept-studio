'use client'

import { useState, useEffect } from 'react'
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconChevronLeft, IconChevronRight, IconPlus, IconCalendar, IconClock } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type CalendarEvent = {
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
  is_recurring: boolean
  recurrence_rule?: any
}

export type CalendarViewType = 'day' | 'week' | 'month'

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date) => void
  onDateChange?: (date: Date) => void
  onViewChange?: (view: CalendarViewType) => void
}

export function CalendarView({ 
  events, 
  onEventClick, 
  onCreateEvent,
  onDateChange,
  onViewChange 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarViewType>('day')

  const handlePrevious = () => {
    const newDate = view === 'day' 
      ? addDays(currentDate, -1)
      : view === 'week' 
      ? addWeeks(currentDate, -1)
      : addMonths(currentDate, -1)
    
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const handleNext = () => {
    const newDate = view === 'day'
      ? addDays(currentDate, 1)
      : view === 'week'
      ? addWeeks(currentDate, 1)
      : addMonths(currentDate, 1)
    
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const handleViewChange = (newView: CalendarViewType) => {
    setView(newView)
    onViewChange?.(newView)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    onDateChange?.(today)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return isSameDay(eventDate, date)
    })
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate)

    // Get unique hours that have events
    const hoursWithEvents = [...new Set(dayEvents.map(event =>
      new Date(event.start_datetime).getHours()
    ))].sort((a, b) => a - b)

    return (
      <div className="space-y-4">
        {hoursWithEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun cours planifié ce jour
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hoursWithEvents.map(hour => {
              const timeSlot = new Date(currentDate)
              timeSlot.setHours(hour, 0, 0, 0)

              const slotEvents = dayEvents.filter(event => {
                const eventStart = new Date(event.start_datetime)
                return eventStart.getHours() === hour
              })

              return (
                <div key={hour} className="flex border-b border-border">
                  <div className="w-20 text-sm text-muted-foreground p-2">
                    {format(timeSlot, 'HH:mm')}
                  </div>
                  <div className="flex-1 min-h-[60px] p-2 relative">
                    {slotEvents.map(event => (
                      <Card
                        key={event.id}
                        className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onEventClick?.(event)}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(event.start_datetime), 'HH:mm')} - {format(new Date(event.end_datetime), 'HH:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">{event.coach}</div>
                          <Badge variant="outline" className="text-xs">
                            {event.current_bookings}/{event.max_capacity}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: fr })
    const weekEnd = endOfWeek(currentDate, { locale: fr })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Get all unique hours that have events across the entire week
    const hoursWithEvents = [...new Set(
      weekDays.flatMap(day =>
        getEventsForDate(day).map(event =>
          new Date(event.start_datetime).getHours()
        )
      )
    )].sort((a, b) => a - b)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-8 gap-1">
          <div className="w-20"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="text-center p-2 font-medium">
              <div className="text-sm text-muted-foreground">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className={cn(
                "text-lg",
                isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {hoursWithEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun cours planifié cette semaine
          </div>
        ) : (
          <div className="space-y-1">
            {hoursWithEvents.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-1 min-h-[60px] border-b border-border">
                <div className="w-20 text-sm text-muted-foreground p-2">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                {weekDays.map(day => {
                  const dayEvents = getEventsForDate(day).filter(event => {
                    const eventStart = new Date(event.start_datetime)
                    return eventStart.getHours() === hour
                  })

                  return (
                    <div key={day.toISOString()} className="p-1 relative">
                      {dayEvents.map(event => (
                        <Card
                          key={event.id}
                          className="mb-1 cursor-pointer hover:shadow-md transition-shadow text-xs"
                          onClick={() => onEventClick?.(event)}
                        >
                          <CardContent className="p-2">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs text-muted-foreground">{event.coach}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { locale: fr })
    const calendarEnd = endOfWeek(monthEnd, { locale: fr })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center p-2 font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <Card 
                key={day.toISOString()} 
                className={cn(
                  "min-h-[120px] cursor-pointer hover:shadow-md transition-shadow",
                  !isCurrentMonth && "opacity-50"
                )}
                onClick={() => onCreateEvent?.(day)}
              >
                <CardContent className="p-2">
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-primary/10 text-primary rounded truncate cursor-pointer hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                      >
                        {format(new Date(event.start_datetime), 'HH:mm')} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-2xl font-bold">
            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr }).replace(/^\w/, (c) => c.toUpperCase())}
            {view === 'week' && `Semaine du ${format(startOfWeek(currentDate, { locale: fr }), 'd MMMM', { locale: fr }).replace(/(\b\w)/g, (c) => c.toUpperCase())}`}
            {view === 'day' && format(currentDate, 'EEEE d MMMM yyyy', { locale: fr }).replace(/(\b\w)/g, (c) => c.toUpperCase())}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => onCreateEvent?.(currentDate)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Planifier
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-background rounded-lg border">
        <div className="p-6">
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </div>
      </div>
    </div>
  )
}