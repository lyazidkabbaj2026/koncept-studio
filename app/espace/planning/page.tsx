'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserCalendarView } from '@/components/user/calendar/user-calendar-view'
import { LoadingSpinner } from '@/components/ui/loading'

export default function UserPlanningPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Check if user is admin and redirect to admin calendar
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userProfile?.role === 'admin') {
          router.push('/admin/calendar')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // Get active subscription
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .order('end_date', { ascending: false })
          .limit(1)
          .single()

        setUser(user)
        setProfile(profile)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error('Error initializing page:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [router, supabase])

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <LoadingSpinner message="Chargement de votre planning" />
        </div>
      </div>
    )
  }

  // Check if user has active subscription
  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6 sm:p-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Abonnement requis
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Vous n&apos;avez pas d&apos;abonnement actif. Pour accéder au planning, vous devez disposer d&apos;un abonnement actif.
              </p>
            </div>
            <a
              href="/espace/subscriptions"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
            >
              Demander un abonnement ?
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserCalendarView
      user={profile}
      subscription={subscription}
    />
  )
}