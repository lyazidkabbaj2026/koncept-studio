import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import type { SubscriptionWithPlan, UserSubscription, SubscriptionPlan } from '@/types'

export class SubscriptionService {
  private supabaseClient: ReturnType<typeof createClient> | null = null

  private get supabase() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  async getUserSubscriptions(userId: string): Promise<SubscriptionWithPlan[]> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as SubscriptionWithPlan[]
  }

  async getActiveUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data as SubscriptionWithPlan | null
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .order('price_dhs', { ascending: true })

    if (error) {
      console.error('Error fetching subscription plans:', error)
      throw error
    }

    console.log('Fetched subscription plans:', data)
    return data || []
  }

  async createSubscription(planId: string): Promise<UserSubscription> {
    const { data, error } = await this.supabase.rpc('create_user_subscription', {
      plan_id: planId,
    })

    if (error) throw error
    return data
  }

  async cancelSubscription(subscriptionId: string): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSubscriptionUsage(subscriptionId: string) {
    const { data, error } = await this.supabase.rpc('get_subscription_usage', {
      subscription_id: subscriptionId,
    })

    if (error) throw error
    return data
  }

  async hasValidSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveUserSubscription(userId)

    if (!subscription) return false

    // Check if subscription is still valid
    const now = new Date()
    const endDate = new Date(subscription.end_date)

    return subscription.status === 'active' && endDate > now
  }

  async getCreditsRemaining(userId: string): Promise<number> {
    const subscription = await this.getActiveUserSubscription(userId)

    if (!subscription) return 0

    if (subscription.subscription_plans.plan_type === 'abonnement') {
      // For weekly subscriptions, calculate remaining credits for the week
      const weeklyCredits = subscription.subscription_plans.weekly_credits || 0
      return Math.max(0, weeklyCredits - subscription.weekly_credits_used)
    } else {
      // For credit-based subscriptions
      return subscription.credits_remaining
    }
  }

  async renewSubscription(subscriptionId: string): Promise<UserSubscription> {
    const { data, error } = await this.supabase.rpc('renew_subscription', {
      subscription_id: subscriptionId,
    })

    if (error) throw error
    return data
  }
}