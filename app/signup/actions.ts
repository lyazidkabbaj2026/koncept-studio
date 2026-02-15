'use server'

import { createClient } from '@/lib/supabase/server'
import type { SubscriptionPlan } from '@/types'

export async function getAvailableSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_dhs', { ascending: true })

    if (error) {
      console.error('Error fetching subscription plans (server action):', error)
      throw error
    }

    // Successfully fetched subscription plans
    return data || []
  } catch (error) {
    console.error('Error in getAvailableSubscriptionPlans:', error)
    return []
  }
}