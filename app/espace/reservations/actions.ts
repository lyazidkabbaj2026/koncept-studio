'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateWaitlistPromotionMessage } from '@/lib/utils/whatsapp-messages'

export async function sendWaitlistPromotionNotification(promotedUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get the promoted user's profile information
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', promotedUserId)
      .single()

    if (userError || !user) {
      console.error('Error fetching promoted user profile:', userError)
      return { success: false, error: 'Utilisateur non trouvé' }
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
        console.log('WhatsApp auto-promotion notification sent successfully for user:', user.id)
        return { success: true }
      } catch (error) {
        console.error('Error sending WhatsApp auto-promotion notification:', error)
        return { success: false, error: 'Erreur lors de l\'envoi de la notification' }
      }
    } else {
      console.log('User has no phone number, skipping WhatsApp notification for user:', user.id)
      return { success: true }
    }
  } catch (error) {
    console.error('Error in sendWaitlistPromotionNotification:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}

interface AdminBookClassParams {
  userId: string
  scheduleId: string
  adminId: string
}

export async function adminBookClass({
  userId,
  scheduleId,
  adminId
}: AdminBookClassParams): Promise<{ success: boolean; error?: string; bookingId?: string }> {
  try {
    const supabase = await createClient()

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminProfile?.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    // Get user's active subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        status,
        end_date,
        credits_remaining,
        weekly_credits_used,
        subscription_plans (
          id,
          type,
          weekly_limit,
          credits
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())

    if (subsError) {
      return { success: false, error: 'Erreur lors de la récupération des abonnements' }
    }

    // Filter valid subscriptions
    const validSubscriptions = subscriptions?.filter(s =>
      s.subscription_plans &&
      ['abonnement', 'carnet'].includes(s.subscription_plans.type as string)
    ) || []

    if (validSubscriptions.length === 0) {
      return { success: false, error: 'Aucun abonnement actif trouvé pour cet utilisateur' }
    }

    // Select best subscription (abonnement first, then carnet)
    let selectedSubscription = null
    const abonnementSub = validSubscriptions.find(s => s.subscription_plans?.type === 'abonnement')

    if (abonnementSub) {
      const weeklyLimit = abonnementSub.subscription_plans?.weekly_limit
      const creditsUsed = abonnementSub.weekly_credits_used || 0
      if (!weeklyLimit || creditsUsed < weeklyLimit) {
        selectedSubscription = abonnementSub
      }
    }

    if (!selectedSubscription) {
      const carnetSub = validSubscriptions.find(s => s.subscription_plans?.type === 'carnet')
      if (carnetSub && (carnetSub.credits_remaining || 0) > 0) {
        selectedSubscription = carnetSub
      }
    }

    if (!selectedSubscription) {
      return { success: false, error: 'Aucun crédit disponible' }
    }

    // Check for existing booking
    const { data: existingBooking } = await supabase
      .from('class_bookings')
      .select('id, status')
      .eq('user_id', userId)
      .eq('schedule_id', scheduleId)
      .in('status', ['confirmed', 'cancelled'])
      .single()

    if (existingBooking?.status === 'confirmed') {
      return { success: false, error: 'L\'utilisateur a déjà une réservation confirmée pour ce cours' }
    }

    // If cancelled booking exists, update it to confirmed
    if (existingBooking?.status === 'cancelled') {
      const { error: updateError } = await supabase
        .from('class_bookings')
        .update({
          status: 'confirmed',
          cancelled_at: null,
          cancellation_reason: null,
          booked_at: new Date().toISOString()
        })
        .eq('id', existingBooking.id)

      if (updateError) {
        return { success: false, error: 'Erreur lors de la mise à jour de la réservation' }
      }

      // Update subscription credits
      const subscriptionType = selectedSubscription.subscription_plans?.type
      if (subscriptionType === 'abonnement') {
        await supabase
          .from('user_subscriptions')
          .update({ weekly_credits_used: (selectedSubscription.weekly_credits_used || 0) + 1 })
          .eq('id', selectedSubscription.id)
      } else if (subscriptionType === 'carnet') {
        await supabase
          .from('user_subscriptions')
          .update({
            credits_remaining: (selectedSubscription.credits_remaining || 0) - 1,
            credits_used: ((selectedSubscription as any).credits_used || 0) + 1
          })
          .eq('id', selectedSubscription.id)
      }

      return { success: true, bookingId: existingBooking.id }
    }

    // Create new booking
    const { data: newBooking, error: bookingError } = await supabase
      .from('class_bookings')
      .insert({
        user_id: userId,
        schedule_id: scheduleId,
        subscription_id: selectedSubscription.id,
        status: 'confirmed',
        booked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookingError) {
      return { success: false, error: 'Erreur lors de la création de la réservation' }
    }

    // Update subscription credits
    const subscriptionType = selectedSubscription.subscription_plans?.type
    if (subscriptionType === 'abonnement') {
      await supabase
        .from('user_subscriptions')
        .update({ weekly_credits_used: (selectedSubscription.weekly_credits_used || 0) + 1 })
        .eq('id', selectedSubscription.id)
    } else if (subscriptionType === 'carnet') {
      await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: (selectedSubscription.credits_remaining || 0) - 1,
          credits_used: ((selectedSubscription as any).credits_used || 0) + 1
        })
        .eq('id', selectedSubscription.id)
    }

    return { success: true, bookingId: newBooking.id }
  } catch (error) {
    console.error('Error in adminBookClass:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}