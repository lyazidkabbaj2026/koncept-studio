'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateSignupMessage, generateSubscriptionRequestMessage } from '@/lib/utils/whatsapp-messages'
import type { SubscriptionPlan } from '@/types'

export async function getSubscriptionPlansByType(): Promise<{ [key: string]: SubscriptionPlan[] }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_dhs', { ascending: true })

    if (error) {
      console.error('Error fetching subscription plans:', error)
      throw error
    }

    // Group plans by type
    const groupedPlans: { [key: string]: SubscriptionPlan[] } = {}

    data?.forEach(plan => {
      if (!groupedPlans[plan.type]) {
        groupedPlans[plan.type] = []
      }
      groupedPlans[plan.type].push(plan)
    })

    return groupedPlans
  } catch (error) {
    console.error('Error in getSubscriptionPlansByType:', error)
    return {}
  }
}

export async function saveUserPlanSelection(planIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Get selected plans details
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .in('id', planIds)

    if (plansError) {
      console.error('Error fetching selected plans:', plansError)
      return { success: false, error: 'Erreur lors de la récupération des formules' }
    }

    // Store as JSON array of plan names
    const planNames = plans?.map(plan => plan.name) || []

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        desired_plan: JSON.stringify(planNames),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return { success: false, error: 'Erreur lors de l\'enregistrement' }
    }

    // Create subscription requests for each selected plan
    const subscriptionRequests = planIds.map(planId => ({
      user_id: user.id,
      plan_id: planId,
      request_type: 'new',
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      requested_at: new Date().toISOString(),
      is_active: true
    }))

    const { error: requestsError } = await supabase
      .from('subscription_requests')
      .insert(subscriptionRequests)

    if (requestsError) {
      console.error('Error creating subscription requests:', requestsError)
      // Don't fail the entire process if subscription requests fail
      // The profile update was successful, so the user can still proceed
      console.warn('Profile updated but subscription requests failed to create')
    }

    // Get user profile for WhatsApp notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    // Send WhatsApp subscription request notifications if user has phone number
    if (profile?.phone) {
      try {
        // Send subscription request confirmations for each selected plan
        // Note: Welcome signup message is already sent during initial signup
        for (const planName of planNames) {
          try {
            const requestMessage = generateSubscriptionRequestMessage(profile, planName)
            await whatsappServerService.sendMessage({
              phoneNumber: profile.phone,
              message: requestMessage,
              eventType: 'subscription_request',
              userId: user.id
            })
            console.log(`WhatsApp subscription request notification sent for plan: ${planName}`)
          } catch (error) {
            console.error(`Error sending WhatsApp subscription request notification for plan ${planName}:`, error)
            // Continue with other plans if one fails
          }
        }
      } catch (error) {
        console.error('Error sending WhatsApp subscription request notifications:', error)
        // Don't fail the signup process if WhatsApp fails
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveUserPlanSelection:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}