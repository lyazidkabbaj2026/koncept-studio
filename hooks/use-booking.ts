/**
 * Custom hook for booking functionality
 * Centralizes booking logic and state management
 */
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/constants/config'

interface UseBookingProps {
  subscription: any
  onBookingSuccess?: () => void
  onCancellationSuccess?: () => void
}

export function useBooking({
  subscription,
  onBookingSuccess,
  onCancellationSuccess
}: UseBookingProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const supabase = createClient()

  const canBook = (event: any): { canBook: boolean; reason?: string } => {
    if (!subscription?.id) {
      return { canBook: false, reason: 'Aucun abonnement valide trouvé' }
    }

    const planType = subscription.subscription_plans?.type || 'carnet'

    // Check credits based on plan type
    if (planType === 'abonnement') {
      const weeklyLimit = subscription.subscription_plans.weekly_limit || 0
      if (subscription.weekly_credits_used >= weeklyLimit) {
        return {
          canBook: false,
          reason: 'Limite hebdomadaire atteinte. La limite se réinitialise chaque semaine.'
        }
      }
    } else {
      // For carnet and personal training
      if (subscription.credits_remaining <= 0) {
        return {
          canBook: false,
          reason: 'Plus de crédits disponibles. Veuillez renouveler votre abonnement.'
        }
      }
    }

    return { canBook: true }
  }

  const bookClass = async (scheduleId: string) => {
    setIsBooking(true)

    try {
      const bookingCheck = canBook({})
      if (!bookingCheck.canBook) {
        toast.error(bookingCheck.reason || 'Réservation impossible')
        return false
      }

      // Update credits first
      await updateCredits()

      // Make the booking
      const { data, error } = await supabase.rpc('book_class', {
        schedule_uuid: scheduleId,
        subscription_uuid: subscription.id
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Classe réservée avec succès!')
      onBookingSuccess?.()
      return true
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Erreur lors de la réservation')
      return false
    } finally {
      setIsBooking(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    setIsCancelling(true)

    try {
      const { data, error } = await supabase.rpc('cancel_booking', {
        booking_uuid: bookingId
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Réservation annulée avec succès')
      onCancellationSuccess?.()
      return true
    } catch (error: any) {
      console.error('Cancellation error:', error)
      toast.error(error.message || 'Erreur lors de l\'annulation')
      return false
    } finally {
      setIsCancelling(false)
    }
  }

  const updateCredits = async () => {
    if (!subscription?.id) {
      throw new Error('Aucun abonnement valide trouvé')
    }

    const planType = subscription.subscription_plans?.type || 'carnet'

    // Prepare update data based on plan type
    const creditsChange = planType === 'abonnement' ? 0 : -1
    const weeklyCreditsChange = planType === 'abonnement' ? 1 : 0
    const creditsUsedChange = planType === 'abonnement' ? 0 : 1

    const { data: updateResult, error: updateError } = await supabase.rpc('update_subscription_credits', {
      subscription_uuid: subscription.id,
      credits_change: creditsChange,
      weekly_credits_change: weeklyCreditsChange,
      credits_used_change: creditsUsedChange
    })

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour des crédits: ${updateError.message}`)
    }

    return updateResult
  }

  return {
    isBooking,
    isCancelling,
    canBook,
    bookClass,
    cancelBooking
  }
}