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
import { IconCalendar, IconClock, IconMapPin, IconUser, IconUsers, IconEdit, IconTrash, IconX, IconAlertTriangle, IconRepeat } from '@tabler/icons-react'
import { deleteClassEvent, cancelClassEvent } from '@/app/admin/calendar/actions'
import { toast } from 'sonner'

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
      const result = await deleteClassEvent({
        eventId: event.id,
        deleteType: 'single'
      })

      if (result.success) {
        toast.success('Cours supprimé avec succès')
        onClose()
      } else {
        setError(result.error || 'Erreur lors de la suppression')
      }
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
      const result = await deleteClassEvent({
        eventId: event.id,
        deleteType: 'all_recurring',
        classId: event.class_id
      })

      if (result.success) {
        toast.success('Série de cours supprimée avec succès')
        onClose()
      } else {
        setError(result.error || 'Erreur lors de la suppression de la série')
      }
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
      const result = await cancelClassEvent({
        eventId: event.id
      })

      if (result.success) {
        toast.success('Cours annulé avec succès')
        onClose()
      } else {
        setError(result.error || 'Erreur lors de l\'annulation')
      }
    } catch (err: any) {
      console.error('Error cancelling event:', err)
      setError(err.message || 'Erreur lors de l\'annulation')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'all_levels':
        return 'Tous niveaux'
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
                  <IconRepeat className="h-3 w-3" />
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
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(startDate, 'dd/MM/yyyy', { locale: fr })}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <IconClock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} ({duration} min)
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <IconUser className="h-4 w-4 text-muted-foreground" />
              <span>{event.coach}</span>
            </div>

            <div className="flex items-center space-x-3">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center space-x-3">
              <IconUsers className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <span>{event.current_bookings} / {event.max_capacity} participants</span>
                <Badge variant={occupancyRate >= 80 ? 'destructive' : occupancyRate >= 50 ? 'default' : 'secondary'}>
                  {occupancyRate}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-4 w-4" />
              <Badge variant="secondary">
                {getDifficultyLabel(event.difficulty_level)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            {/* Delete Options */}
            <div className="space-y-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background" size="sm">
                    <IconTrash className="h-4 w-4 mr-2" />
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
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {event.is_recurring && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background" size="sm">
                      <IconTrash className="h-4 w-4 mr-2" />
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
                        className="bg-foreground text-background hover:bg-foreground/90"
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