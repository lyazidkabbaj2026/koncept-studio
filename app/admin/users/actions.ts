'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateActivationMessage } from '@/lib/utils/whatsapp-messages'

interface AssignSubscriptionParams {
  userId: string
  planId: string
  startDate: string
}

export async function assignSubscriptionToUser({
  userId,
  planId,
  startDate
}: AssignSubscriptionParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get the subscription plan details
    const { data: selectedPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !selectedPlan) {
      return { success: false, error: 'Plan non trouvé' }
    }

    const startDateObj = new Date(startDate)
    const endDate = new Date(startDateObj)
    endDate.setMonth(endDate.getMonth() + selectedPlan.validity_months)

    // Create subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([{
        user_id: userId,
        plan_id: planId,
        credits_remaining: selectedPlan.credits,
        start_date: startDateObj.toISOString(),
        end_date: endDate.toISOString()
      }])

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return { success: false, error: 'Erreur lors de la création de l\'abonnement' }
    }

    // Update user status to active
    const { error: userError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active'
      })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating user status:', userError)
      return { success: false, error: 'Erreur lors de la mise à jour du statut utilisateur' }
    }

    // Get user profile for WhatsApp notification
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single()

    console.log('DEBUG: Profile fetch result:', { profile, profileError })

    // Send WhatsApp activation notification if user has phone number
    if (profile?.phone) {
      try {
        console.log('DEBUG: Sending WhatsApp activation notification to:', profile.phone)
        const message = generateActivationMessage(profile)
        console.log('DEBUG: Generated message:', message)

        const result = await whatsappServerService.sendMessage({
          phoneNumber: profile.phone,
          message,
          eventType: 'activation',
          userId
        })

        console.log('DEBUG: WhatsApp activation notification result:', result)
      } catch (error) {
        console.error('ERROR: Failed to send WhatsApp activation notification:', error)
        // Don't fail the process if WhatsApp fails
      }
    } else {
      console.log('DEBUG: No phone number found for user activation notification:', {
        userId,
        profile: profile ? { email: profile.email, hasPhone: !!profile.phone } : null
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error in assignSubscriptionToUser:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}

