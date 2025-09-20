'use client'

import { createClient } from '@/lib/supabase/client'

export class WaitlistService {
  private supabaseClient: ReturnType<typeof createClient> | null = null

  private get supabase() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  async leaveWaitlist(waitlistEntryId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      // Get waitlist entry with subscription info
      const { data: waitlistEntry, error: waitlistError } = await this.supabase
        .from('class_waitlist')
        .select(`
          *,
          user_subscriptions (
            *,
            subscription_plans (
              type
            )
          )
        `)
        .eq('id', waitlistEntryId)
        .eq('user_id', user.id)
        .single()

      if (waitlistError || !waitlistEntry) {
        return { success: false, error: 'Entrée de liste d\'attente non trouvée' }
      }

      const subscription = waitlistEntry.user_subscriptions
      if (!subscription) {
        return { success: false, error: 'Informations d\'abonnement manquantes' }
      }

      const subscriptionType = subscription.subscription_plans?.type
      if (!subscriptionType) {
        return { success: false, error: 'Type d\'abonnement invalide' }
      }

      // Remove from waitlist first
      const { error: removeError } = await this.supabase
        .from('class_waitlist')
        .delete()
        .eq('id', waitlistEntryId)

      if (removeError) {
        return { success: false, error: removeError.message }
      }

      // Refund credits based on subscription type
      let refundError = null

      if (subscriptionType === 'carnet') {
        // Refund carnet credit
        const { error } = await this.supabase
          .from('user_subscriptions')
          .update({
            credits_remaining: subscription.credits_remaining + 1,
            credits_used: Math.max((subscription.credits_used || 0) - 1, 0)
          })
          .eq('id', subscription.id)
        refundError = error
      } else if (subscriptionType === 'abonnement') {
        // Refund weekly credit
        const { error } = await this.supabase
          .from('user_subscriptions')
          .update({
            weekly_credits_used: Math.max((subscription.weekly_credits_used || 0) - 1, 0)
          })
          .eq('id', subscription.id)
        refundError = error
      }
      // For personal_training, no credit refund needed

      if (refundError) {
        console.error('Error refunding credits:', refundError)
        // Don't fail the process if credit refund fails, just log it
      }

      return { success: true }
    } catch (error) {
      console.error('Error in leaveWaitlist:', error)
      return { success: false, error: 'Une erreur inattendue s\'est produite' }
    }
  }
}

export const waitlistService = new WaitlistService()