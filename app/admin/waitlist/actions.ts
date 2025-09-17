'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateWaitlistPromotionMessage } from '@/lib/utils/whatsapp-messages'

export async function promoteFromWaitlist(waitlistEntryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get waitlist entry with user and class details
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('class_waitlist')
      .select(`
        *,
        profiles!user_id (
          id,
          full_name,
          email,
          phone
        ),
        class_schedules!schedule_id (
          id,
          start_datetime,
          classes (
            title,
            max_capacity
          )
        )
      `)
      .eq('id', waitlistEntryId)
      .single()

    if (waitlistError || !waitlistEntry) {
      return { success: false, error: 'Entrée de liste d\'attente non trouvée' }
    }

    const { profiles: user, class_schedules: schedule } = waitlistEntry

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    if (!schedule) {
      return { success: false, error: 'Cours non trouvé' }
    }

    // Check if there's space in the class
    const { data: currentBookings, error: bookingsError } = await supabase
      .from('class_bookings')
      .select('id')
      .eq('schedule_id', schedule.id)
      .eq('status', 'confirmed')

    if (bookingsError) {
      return { success: false, error: 'Erreur lors de la vérification de la capacité' }
    }

    const currentCount = currentBookings?.length || 0
    const maxCapacity = schedule.classes?.max_capacity || 0

    if (currentCount >= maxCapacity) {
      return { success: false, error: 'Le cours est toujours complet' }
    }

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .limit(1)
      .single()

    if (subscriptionError || !subscription) {
      return { success: false, error: 'Aucun abonnement actif trouvé pour cet utilisateur' }
    }

    // Create the booking
    const { error: bookingError } = await supabase
      .from('class_bookings')
      .insert({
        user_id: user.id,
        schedule_id: schedule.id,
        subscription_id: subscription.id,
        status: 'confirmed',
        booked_at: new Date().toISOString()
      })

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return { success: false, error: 'Erreur lors de la création de la réservation' }
    }

    // Remove from waitlist
    const { error: removeError } = await supabase
      .from('class_waitlist')
      .delete()
      .eq('id', waitlistEntryId)

    if (removeError) {
      console.error('Error removing from waitlist:', removeError)
      // Don't fail the whole process if this fails
    }

    // Update subscription credits if it's a credit-based plan
    if (subscription.credits_remaining > 0) {
      const { error: creditError } = await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: subscription.credits_remaining - 1,
          credits_used: (subscription.credits_used || 0) + 1
        })
        .eq('id', subscription.id)

      if (creditError) {
        console.error('Error updating credits:', creditError)
        // Don't fail the process if this fails
      }
    }

    // Send WhatsApp notification if user has phone number
    if (user.phone) {
      try {
        const message = generateWaitlistPromotionMessage(user)
        await whatsappServerService.sendMessage({
          phoneNumber: user.phone,
          message,
          eventType: 'waitlist_promotion',
          userId: user.id
        })
        console.log('WhatsApp waitlist promotion notification sent successfully')
      } catch (error) {
        console.error('Error sending WhatsApp waitlist promotion notification:', error)
        // Don't fail the process if WhatsApp fails
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in promoteFromWaitlist:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}