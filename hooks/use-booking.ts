/**
 * Custom hook for booking functionality
 * Centralizes booking logic and state management
 */
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/constants/config'
import confetti from 'canvas-confetti'

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

  const triggerConfetti = () => {
    // Create a celebration confetti effect
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
      triggerConfetti()
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