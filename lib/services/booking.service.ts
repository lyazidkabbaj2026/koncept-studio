import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type ClassBooking = Database['public']['Tables']['class_bookings']['Row']
type ClassWaitlist = Database['public']['Tables']['class_waitlist']['Row']
type ClassSchedule = Database['public']['Tables']['class_schedules']['Row']

export interface BookingData {
  scheduleId: string
  subscriptionId?: string // Now optional as we auto-select best subscription
}

export interface BookingResult {
  success: boolean
  error?: string
  booking?: ClassBooking | any // Allow custom booking data
}

export interface WaitlistResult {
  success: boolean
  error?: string
  waitlistEntry?: ClassWaitlist
}

export class BookingService {
  private supabaseClient: ReturnType<typeof createClient> | null = null

  private get supabase() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  async bookClass({ scheduleId }: BookingData): Promise<BookingResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      // 1. Validate schedule exists
      const { data: schedule, error: scheduleError } = await this.supabase
        .from('class_schedules')
        .select('id')
        .eq('id', scheduleId)
        .single()

      if (scheduleError || !schedule) {
        return { success: false, error: 'Créneau non trouvé' }
      }

      // 2. Get all valid subscriptions (abonnement, carnet only - exclude personal_training)
      const { data: allSubscriptions, error: subscriptionError } = await this.supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            type,
            weekly_limit,
            credits
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .in('subscription_plans.type', ['abonnement', 'carnet'])
        .order('end_date', { ascending: false })

      if (subscriptionError) {
        return { success: false, error: subscriptionError.message }
      }

      // Filter out any subscriptions with null/undefined subscription_plans
      const validSubscriptions = allSubscriptions?.filter(s =>
        s.subscription_plans &&
        s.subscription_plans.type &&
        ['abonnement', 'carnet'].includes(s.subscription_plans.type)
      ) || []

      if (validSubscriptions.length === 0) {
        // Check if user has only personal_training
        const { data: personalTraining } = await this.supabase
          .from('user_subscriptions')
          .select('subscription_plans(type)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('subscription_plans.type', 'personal_training')

        if (personalTraining && personalTraining.length > 0) {
          return {
            success: false,
            error: 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d\'ajouter un abonnement ou un carnet pour effectuer une réservation.'
          }
        }
        return { success: false, error: 'Aucun abonnement actif trouvé' }
      }

      // 3. Smart subscription selection with fallback logic
      let selectedSubscription = null
      let rejectionReason = null

      // Try abonnement first
      const abonnementSub = validSubscriptions.find(s => s.subscription_plans?.type === 'abonnement')
      if (abonnementSub) {
        const weeklyLimit = abonnementSub.subscription_plans?.weekly_limit
        const creditsUsed = abonnementSub.weekly_credits_used || 0

        if (!weeklyLimit || creditsUsed < weeklyLimit) {
          selectedSubscription = abonnementSub
          console.log('🔵 Selected abonnement subscription:', {
            id: selectedSubscription.id,
            weekly_credits_used: creditsUsed,
            weekly_limit: weeklyLimit
          })
        } else {
          rejectionReason = 'Abonnement weekly limit reached'
          console.log('🟡 Abonnement limit reached, trying carnet fallback')
        }
      }

      // Fallback to carnet if abonnement not available or limit reached
      if (!selectedSubscription) {
        const carnetSub = validSubscriptions.find(s => s.subscription_plans?.type === 'carnet')
        if (carnetSub) {
          const creditsRemaining = carnetSub.credits_remaining || 0

          if (creditsRemaining > 0) {
            selectedSubscription = carnetSub
            console.log('🔵 Selected carnet subscription:', {
              id: selectedSubscription.id,
              credits_remaining: creditsRemaining
            })
          } else {
            rejectionReason = 'Carnet has no credits remaining'
          }
        }
      }

      // Final validation
      if (!selectedSubscription) {
        if (rejectionReason === 'Abonnement weekly limit reached' && validSubscriptions.some(s => s.subscription_plans?.type === 'carnet')) {
          return { success: false, error: 'Plus de crédits disponibles' }
        } else if (rejectionReason === 'Abonnement weekly limit reached') {
          return { success: false, error: 'Limite hebdomadaire de séances atteinte' }
        } else {
          return { success: false, error: 'Aucun abonnement valide disponible' }
        }
      }

      // 4. Check for existing booking to prevent duplicates
      const { data: existingBookings } = await this.supabase
        .from('class_bookings')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false })
        .limit(1)

      const existingBooking = existingBookings && existingBookings.length > 0 ? existingBookings[0] : null

      let bookingId: string

      if (existingBooking) {
        // Update existing booking to confirmed
        const { data: updatedBooking, error: updateError } = await this.supabase
          .from('class_bookings')
          .update({
            status: 'confirmed',
            subscription_id: selectedSubscription.id,
            cancelled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBooking.id)
          .select('id')
          .single()

        if (updateError) {
          return { success: false, error: updateError.message }
        }
        bookingId = updatedBooking.id
      } else {
        // Create new booking
        const { data: newBooking, error: insertError } = await this.supabase
          .from('class_bookings')
          .insert({
            user_id: user.id,
            schedule_id: scheduleId,
            subscription_id: selectedSubscription.id,
            status: 'confirmed'
          })
          .select('id')
          .single()

        if (insertError) {
          return { success: false, error: insertError.message }
        }
        bookingId = newBooking.id
      }

      // 5. Update credits using database function to bypass RLS issues
      const subscriptionType = selectedSubscription.subscription_plans?.type
      if (!subscriptionType) {
        return { success: false, error: 'Type d\'abonnement invalide' }
      }

      console.log('🔵 Updating credits using database function for subscription:', selectedSubscription.id)
      console.log('🔵 Subscription type:', subscriptionType)

      const { data: creditResult, error: creditError } = await this.supabase.rpc('update_booking_credits', {
        user_uuid: user.id,
        subscription_uuid: selectedSubscription.id,
        subscription_type: subscriptionType
      })

      console.log('🔵 Credit update function result:', { error: creditError, data: creditResult })

      if (creditError) {
        return { success: false, error: 'Échec de la mise à jour des crédits: ' + creditError.message }
      }

      if (!creditResult.success || creditResult.rows_affected === 0) {
        return { success: false, error: 'Aucune ligne mise à jour - problème avec l\'abonnement' }
      }

      return {
        success: true,
        booking: {
          id: bookingId,
          subscription_id: selectedSubscription.id,
          subscription_type: selectedSubscription.subscription_plans.type,
          existing_booking_updated: !!existingBooking
        } as any
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async cancelBooking(bookingId: string): Promise<BookingResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      // 1. Get booking with schedule and subscription info
      const { data: booking, error: bookingError } = await this.supabase
        .from('class_bookings')
        .select(`
          *,
          class_schedules (
            start_datetime
          ),
          user_subscriptions (
            *,
            subscription_plans (
              type
            )
          )
        `)
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single()

      if (bookingError || !booking) {
        return { success: false, error: 'Réservation non trouvée ou déjà annulée' }
      }

      // 2. Check cancellation policy (1 hour before class, as per UI logic)
      const classStartTime = new Date(booking.class_schedules.start_datetime)
      const now = new Date()
      const timeDifferenceInHours = (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (timeDifferenceInHours <= 1) {
        return {
          success: false,
          error: 'Vous ne pouvez pas annuler cette réservation car elle commence dans moins d\'une heure.'
        }
      }

      // 3. Cancel the booking
      const { error: cancelError } = await this.supabase
        .from('class_bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (cancelError) {
        return { success: false, error: cancelError.message }
      }

      // 4. Refund credits using database function to bypass RLS issues
      const subscription = booking.user_subscriptions
      if (!subscription) {
        return { success: false, error: 'Informations d\'abonnement manquantes' }
      }

      const subscriptionType = subscription.subscription_plans?.type
      if (!subscriptionType) {
        return { success: false, error: 'Type d\'abonnement invalide pour le remboursement' }
      }

      console.log('🔴 Refunding credits using database function for subscription:', subscription.id)
      console.log('🔴 Subscription type:', subscriptionType)

      const { data: refundResult, error: refundError } = await this.supabase.rpc('refund_booking_credits', {
        user_uuid: user.id,
        subscription_uuid: subscription.id,
        subscription_type: subscriptionType
      })

      console.log('🔴 Credit refund function result:', { error: refundError, data: refundResult })

      if (refundError) {
        return { success: false, error: 'Échec du remboursement des crédits: ' + refundError.message }
      }

      if (!refundResult.success || refundResult.rows_affected === 0) {
        return { success: false, error: 'Aucune ligne mise à jour pour le remboursement' }
      }

      // 5. Check for waitlist and promote if space is available
      await this.promoteFromWaitlist(booking.schedule_id)

      return {
        success: true,
        booking: {
          id: bookingId,
          status: 'cancelled',
          refunded: true
        } as any
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async joinWaitlist({ scheduleId }: BookingData): Promise<WaitlistResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      // 1. Check if user has valid subscription (abonnement or carnet only - exclude personal_training)
      const { data: allSubscriptions, error: subscriptionError } = await this.supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            type,
            weekly_limit,
            credits
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .in('subscription_plans.type', ['abonnement', 'carnet'])
        .order('end_date', { ascending: false })

      if (subscriptionError) {
        return { success: false, error: subscriptionError.message }
      }

      const validSubscriptions = allSubscriptions?.filter(s =>
        s.subscription_plans &&
        s.subscription_plans.type &&
        ['abonnement', 'carnet'].includes(s.subscription_plans.type)
      ) || []

      if (validSubscriptions.length === 0) {
        return { success: false, error: 'Aucun abonnement valide trouvé pour rejoindre la liste d\'attente' }
      }

      // 2. Smart subscription selection (same logic as booking)
      let selectedSubscription = null

      // Try abonnement first
      const abonnementSub = validSubscriptions.find(s => s.subscription_plans?.type === 'abonnement')
      if (abonnementSub) {
        const weeklyLimit = abonnementSub.subscription_plans?.weekly_limit
        const creditsUsed = abonnementSub.weekly_credits_used || 0

        if (!weeklyLimit || creditsUsed < weeklyLimit) {
          selectedSubscription = abonnementSub
        }
      }

      // Fallback to carnet if abonnement not available or limit reached
      if (!selectedSubscription) {
        const carnetSub = validSubscriptions.find(s => s.subscription_plans?.type === 'carnet')
        if (carnetSub) {
          const creditsRemaining = carnetSub.credits_remaining || 0
          if (creditsRemaining > 0) {
            selectedSubscription = carnetSub
          }
        }
      }

      if (!selectedSubscription) {
        return { success: false, error: 'Aucun crédit disponible pour rejoindre la liste d\'attente' }
      }

      // 3. Check if user is already on waitlist
      const { data: existingWaitlist } = await this.supabase
        .from('class_waitlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('schedule_id', scheduleId)

      if (existingWaitlist && existingWaitlist.length > 0) {
        return { success: false, error: 'Vous êtes déjà sur la liste d\'attente' }
      }

      // 4. Check if user already booked this class
      const { data: existingBooking } = await this.supabase
        .from('class_bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('schedule_id', scheduleId)
        .eq('status', 'confirmed')

      if (existingBooking && existingBooking.length > 0) {
        return { success: false, error: 'Vous avez déjà réservé ce cours' }
      }

      // 5. Get class info and verify it's full
      const { data: classInfo, error: classError } = await this.supabase
        .from('class_schedules')
        .select(`
          current_bookings,
          classes (max_capacity)
        `)
        .eq('id', scheduleId)
        .single()

      if (classError || !classInfo) {
        return { success: false, error: 'Cours non trouvé' }
      }

      if (classInfo.current_bookings < (classInfo.classes as any).max_capacity) {
        return { success: false, error: 'Le cours n\'est pas complet, vous pouvez le réserver directement' }
      }

      // 6. Get next position in waitlist
      const { data: maxPosition } = await this.supabase
        .from('class_waitlist')
        .select('position')
        .eq('schedule_id', scheduleId)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = (maxPosition && maxPosition.length > 0 ? maxPosition[0].position : 0) + 1

      // 7. Add to waitlist
      console.log('🟡 Adding to waitlist:', {
        user_id: user.id,
        schedule_id: scheduleId,
        subscription_id: selectedSubscription.id,
        position: nextPosition
      })

      const { data: waitlistEntry, error: waitlistError } = await this.supabase
        .from('class_waitlist')
        .insert({
          user_id: user.id,
          schedule_id: scheduleId,
          subscription_id: selectedSubscription.id,
          position: nextPosition
        })
        .select()
        .single()

      if (waitlistError) {
        console.log('🔴 Failed to add to waitlist:', waitlistError)
        return { success: false, error: waitlistError.message }
      }

      console.log('🟢 Successfully added to waitlist:', waitlistEntry)

      // 8. Deduct credit using database function to bypass RLS issues
      const subscriptionType = selectedSubscription.subscription_plans?.type
      if (!subscriptionType) {
        return { success: false, error: 'Type d\'abonnement invalide' }
      }

      const { data: creditResult, error: creditError } = await this.supabase.rpc('update_booking_credits', {
        user_uuid: user.id,
        subscription_uuid: selectedSubscription.id,
        subscription_type: subscriptionType
      })

      if (creditError) {
        // If credit deduction fails, remove from waitlist
        await this.supabase.from('class_waitlist').delete().eq('id', waitlistEntry.id)
        return { success: false, error: 'Échec de la déduction des crédits: ' + creditError.message }
      }

      if (!creditResult.success || creditResult.rows_affected === 0) {
        // If credit deduction fails, remove from waitlist
        await this.supabase.from('class_waitlist').delete().eq('id', waitlistEntry.id)
        return { success: false, error: 'Aucune ligne mise à jour - problème avec l\'abonnement' }
      }

      return {
        success: true,
        waitlistEntry: waitlistEntry,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async leaveWaitlist(waitlistId: string): Promise<WaitlistResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      // 1. Get waitlist entry with subscription info
      const { data: waitlistEntry, error: waitlistError } = await this.supabase
        .from('class_waitlist')
        .select(`
          *,
          user_subscriptions!inner (
            *,
            subscription_plans (type)
          )
        `)
        .eq('id', waitlistId)
        .eq('user_id', user.id)
        .single()

      if (waitlistError || !waitlistEntry) {
        return { success: false, error: 'Entrée de liste d\'attente non trouvée' }
      }

      // 2. Refund credit using database function to bypass RLS issues
      const subscriptionType = waitlistEntry.user_subscriptions.subscription_plans?.type
      if (!subscriptionType) {
        return { success: false, error: 'Type d\'abonnement invalide' }
      }

      const { data: refundResult, error: refundError } = await this.supabase.rpc('refund_booking_credits', {
        user_uuid: user.id,
        subscription_uuid: waitlistEntry.subscription_id,
        subscription_type: subscriptionType
      })

      if (refundError) {
        return { success: false, error: 'Échec du remboursement des crédits: ' + refundError.message }
      }

      if (!refundResult.success || refundResult.rows_affected === 0) {
        return { success: false, error: 'Aucune ligne mise à jour pour le remboursement' }
      }

      // 3. Remove from waitlist
      const { error: deleteError } = await this.supabase
        .from('class_waitlist')
        .delete()
        .eq('id', waitlistId)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      // 4. Update positions for remaining entries (decrement by 1)
      const { data: remainingEntries } = await this.supabase
        .from('class_waitlist')
        .select('id, position')
        .eq('schedule_id', waitlistEntry.schedule_id)
        .gt('position', waitlistEntry.position)

      if (remainingEntries && remainingEntries.length > 0) {
        for (const entry of remainingEntries) {
          await this.supabase
            .from('class_waitlist')
            .update({ position: entry.position - 1 })
            .eq('id', entry.id)
        }
      }

      return {
        success: true,
        waitlistEntry: waitlistEntry,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async getUserBookings(userId: string) {
    const { data, error } = await this.supabase
      .from('class_bookings')
      .select(`
        *,
        class_schedules (
          *,
          classes (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getUserWaitlistEntries(userId: string) {
    const { data, error } = await this.supabase
      .from('class_waitlist')
      .select(`
        *,
        class_schedules (
          *,
          classes (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getClassAvailability(scheduleId: string) {
    const { data, error } = await this.supabase.rpc('get_class_availability', {
      schedule_id: scheduleId,
    })

    if (error) throw error
    return data
  }

  async canUserBook(scheduleId: string): Promise<{ canBook: boolean; reason?: string; message?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('can_user_book_class', {
        user_uuid: (await this.supabase.auth.getUser()).data.user?.id,
        schedule_uuid: scheduleId,
      })

      if (error) {
        return {
          canBook: false,
          reason: error.message,
        }
      }

      return {
        canBook: data.can_book,
        reason: data.reason,
        message: data.message,
      }
    } catch (error) {
      return {
        canBook: false,
        reason: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  // New method to get user's valid subscriptions
  async getUserValidSubscriptions(): Promise<any[]> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) return []

      const { data, error } = await this.supabase.rpc('get_user_valid_subscriptions', {
        user_uuid: user.user.id,
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user valid subscriptions:', error)
      return []
    }
  }

  // New method to promote users from waitlist when spots become available
  private async promoteFromWaitlist(scheduleId: string): Promise<void> {
    try {
      console.log('🟡 Checking for waitlist promotion for schedule:', scheduleId)

      // Call the database function we just created
      const { data: promotionResult, error: promotionError } = await this.supabase
        .rpc('handle_waitlist_promotion', {
          schedule_uuid: scheduleId
        })

      console.log('🟡 Promotion function result:', promotionResult)

      if (promotionError) {
        console.log('🔴 Promotion function error:', promotionError)
      } else if (promotionResult?.success && promotionResult?.promoted_user_id) {
        console.log('🟢 Successfully promoted user from waitlist!', {
          promotedUserId: promotionResult.promoted_user_id,
          newBookingId: promotionResult.new_booking_id,
          waitlistPosition: promotionResult.waitlist_position
        })

        // Send WhatsApp notification for the promoted user
        try {
          const { sendWaitlistPromotionNotification } = await import('@/app/espace/reservations/actions')
          const notificationResult = await sendWaitlistPromotionNotification(promotionResult.promoted_user_id)

          if (notificationResult.success) {
            console.log('🟢 WhatsApp auto-promotion notification sent successfully')
          } else {
            console.error('🔴 Failed to send WhatsApp auto-promotion notification:', notificationResult.error)
          }
        } catch (error) {
          console.error('🔴 Error importing or calling sendWaitlistPromotionNotification:', error)
        }
      } else {
        console.log('🟡 No promotion needed:', promotionResult?.message)
      }

    } catch (error) {
      console.error('🔴 Error in promoteFromWaitlist:', error)
    }
  }


  // New method to expire subscriptions automatically
  async expireSubscriptions(): Promise<{ success: boolean; message?: string; expiredSubscriptions?: number }> {
    try {
      const { data: result, error } = await this.supabase
        .rpc('expire_subscriptions')

      if (error) {
        console.error('🔴 Error expiring subscriptions:', error)
        return { success: false, message: error.message }
      }

      console.log('🟢 Subscription expiration completed:', result)
      return {
        success: result.success,
        message: result.message,
        expiredSubscriptions: result.expired_subscriptions
      }
    } catch (error) {
      console.error('🔴 Error in expireSubscriptions:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // New method to clean up expired waitlist entries and refund credits
  async cleanupExpiredWaitlists(): Promise<{ success: boolean; message?: string; refundedEntries?: number }> {
    try {
      const { data: result, error } = await this.supabase
        .rpc('cleanup_expired_waitlists')

      if (error) {
        console.error('🔴 Error cleaning up expired waitlists:', error)
        return { success: false, message: error.message }
      }

      console.log('🟢 Expired waitlist cleanup completed:', result)
      return {
        success: result.success,
        message: result.message,
        refundedEntries: result.refunded_entries
      }
    } catch (error) {
      console.error('🔴 Error in cleanupExpiredWaitlists:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // New method to check if user has only personal training (no carnet/abonnement)
  async hasOnlyPersonalTraining(): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) return false

      // Check ALL subscriptions (including expired/consumed ones) to see if user ever had carnet/abonnement access
      const { data: allSubscriptions, error } = await this.supabase
        .from('user_subscriptions')
        .select(`
          subscription_plans (
            type
          )
        `)
        .eq('user_id', user.user.id)

      if (error) {
        console.error('Error fetching all subscriptions:', error)
        return false
      }

      // If no subscriptions at all, return true (show offline message)
      if (!allSubscriptions || allSubscriptions.length === 0) return true

      // Check if user has ever had any carnet or abonnement subscriptions
      const hasOnlineEligible = allSubscriptions.some(sub =>
        (sub.subscription_plans as any)?.type === 'carnet' || (sub.subscription_plans as any)?.type === 'abonnement'
      )

      // If user has ever had carnet or abonnement, they can see bookings (return false)
      if (hasOnlineEligible) return false

      // Only return true if user has ONLY ever had personal_training subscriptions
      return allSubscriptions.every(sub => (sub.subscription_plans as any)?.type === 'personal_training')
    } catch (error) {
      console.error('Error checking personal training status:', error)
      return false
    }
  }
}