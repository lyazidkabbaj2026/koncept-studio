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

  return (
    <UserCalendarView
      user={profile}
      subscription={subscription}
    />
  )
}