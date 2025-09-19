import type { Database } from '@/lib/database.types'

export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']

export interface SubscriptionWithPlan extends UserSubscription {
  subscription_plans: SubscriptionPlan
}

// Extended version with additional fields for frontend usage
export interface Subscription extends Omit<UserSubscription, 'credits_used'> {
  subscription_plans: {
    name: string
    type: 'abonnement' | 'carnet' | 'personal_training'
    weekly_limit?: number
  }
  credits_used?: number // Optional field for tracking usage
}


export interface SubscriptionFormData {
  plan_id: string
  start_date: string
  end_date: string
  user_id?: string
}

export interface CreateSubscriptionData {
  user_id: string
  plan_id: string
  start_date: string
  end_date: string
  status?: 'active' | 'pending' | 'cancelled' | 'expired'
}

export interface SubscriptionStats {
  total_subscriptions: number
  active_subscriptions: number
  expired_subscriptions: number
  revenue_total: number
  revenue_monthly: number
}

export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'expired'
export type PlanType = 'abonnement' | 'carnet' | 'personal_training'

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  abonnement: 'Abonnement',
  carnet: 'Carnet',
  personal_training: 'Coaching Personnel',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Actif',
  pending: 'En attente',
  cancelled: 'Annulé',
  expired: 'Expiré',
}