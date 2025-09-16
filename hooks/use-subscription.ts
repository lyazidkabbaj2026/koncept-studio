import { useEffect, useState } from 'react'
import { subscriptionService } from '@/lib/services'
import type { SubscriptionWithPlan } from '@/types'
import { useAuth } from './use-auth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const activeSubscription = await subscriptionService.getActiveUserSubscription(user.id)
        setSubscription(activeSubscription)
        setError(null)
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const hasValidSubscription = subscription?.status === 'active' &&
    new Date(subscription.end_date) > new Date()

  const getCreditsRemaining = () => {
    if (!subscription) return 0

    if (subscription.subscription_plans.type === 'abonnement') {
      const weeklyCredits = subscription.subscription_plans.weekly_limit || 0
      return Math.max(0, weeklyCredits - subscription.weekly_credits_used)
    } else {
      return subscription.credits_remaining
    }
  }

  return {
    subscription,
    loading,
    error,
    hasValidSubscription,
    creditsRemaining: getCreditsRemaining(),
    isUnlimited: subscription?.subscription_plans.type === 'abonnement',
    refresh: () => {
      if (user) {
        subscriptionService.getActiveUserSubscription(user.id)
          .then(setSubscription)
          .catch(console.error)
      }
    }
  }
}