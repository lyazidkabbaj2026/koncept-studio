'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarEvent } from './calendar-view'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, User, Users, Edit, Trash2, X, AlertTriangle, Repeat } from 'lucide-react'

interface EventDetailsModalProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
}

export function EventDetailsModal({ event, onClose, onEdit }: EventDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleDeleteSingle = async () => {
    setLoading(true)
    setError('')

    try {
      if (event.is_recurring) {
        // This is a recurring instance - mark as exception
        const { error } = await supabase
          .from('class_schedules')
          .update({
            is_exception: true,
            exception_reason: 'Supprimé par l\'administrateur'
          })
          .eq('id', event.id)

        if (error) throw error
      } else {
        // This is a single event - delete entirely
        const { error } = await supabase
          .from('class_schedules')
          .delete()
          .eq('id', event.id)

        if (error) throw error
      }

      onClose()
    } catch (err: any) {
      console.error('Error deleting event:', err)
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSeries = async () => {
    setLoading(true)
    setError('')

    try {
      if (event.is_recurring && event.recurrence_rule) {
        // Delete all instances of the recurring series
        // Use a safer approach by matching on class_id, is_recurring, and start time pattern
        const startDateTime = new Date(event.start_datetime)
        const timeString = startDateTime.toTimeString().slice(0, 8) // HH:MM:SS format
        
        const { error } = await supabase
          .from('class_schedules')
          .delete()
          .eq('class_id', event.class_id)
          .eq('is_recurring', true)
          .like('start_datetime', `%T${timeString}%`) // Match same time of day

        if (error) throw error
      } else {
        // Just delete this single event
        const { error } = await supabase
          .from('class_schedules')
          .delete()
          .eq('id', event.id)

        if (error) throw error
      }

      onClose()
    } catch (err: any) {
      console.error('Error deleting series:', err)
      setError(err.message || 'Erreur lors de la suppression de la série')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEvent = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('class_schedules')
        .update({
          is_cancelled: true,
          cancellation_reason: 'Annulé par l\'administrateur'
        })
        .eq('id', event.id)

      if (error) throw error

      onClose()
    } catch (err: any) {
      console.error('Error cancelling event:', err)
      setError(err.message || 'Erreur lors de l\'annulation')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const startDate = new Date(event.start_datetime)
  const endDate = new Date(event.end_datetime)
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  const occupancyRate = Math.round((event.current_bookings / event.max_capacity) * 100)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails du Cours</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Event Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              {event.is_recurring && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  Récurrent
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(startDate, 'EEEE d MMMM yyyy', { locale: fr }).replace(/(^\w|\s\w)/g, c => c.toUpperCase())}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} ({duration} min)
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{event.coach}</span>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <span>{event.current_bookings} / {event.max_capacity} participants</span>
                <Badge variant={occupancyRate >= 80 ? 'destructive' : occupancyRate >= 50 ? 'default' : 'secondary'}>
                  {occupancyRate}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-4 w-4" />
              <Badge className={getDifficultyColor(event.difficulty_level)}>
                {getDifficultyLabel(event.difficulty_level)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onEdit(event)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler ce cours</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action marquera le cours comme annulé. Les participants seront notifiés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Retour</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelEvent}
                      disabled={loading}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Annuler le cours
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Options */}
            <div className="space-y-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {event.is_recurring ? 'Supprimer cette occurrence' : 'Supprimer le cours'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      {event.is_recurring 
                        ? 'Cette occurrence sera supprimée mais les autres cours de la série resteront.'
                        : 'Ce cours sera définitivement supprimé.'
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteSingle}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {event.is_recurring && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer toute la série
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la série complète</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tous les cours de cette série récurrente seront supprimés. Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteSeries}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Supprimer la série
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}