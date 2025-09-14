import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { UserSubscriptionView } from '@/components/user/subscription/user-subscription-view'

export default async function UserSubscriptionPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin and redirect to admin area
  const isAdmin = await isUserAdmin(user.id)
  if (isAdmin) {
    redirect('/admin')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get current subscription with plan details
  const { data: currentSubscription } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .limit(1)
    .single()

  // Get subscription history
  const { data: subscriptionHistory } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (name, type)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get subscription requests if no active subscription
  const { data: subscriptionRequests } = await supabase
    .from('subscription_requests')
    .select(`
      *,
      subscription_plans (name, type)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get recent bookings for usage stats
  const { data: recentBookings } = await supabase
    .from('class_bookings')
    .select(`
      *,
      class_schedules (
        start_datetime,
        classes (title)
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .order('booked_at', { ascending: false })
    .limit(20)

  return (
    <UserSubscriptionView 
      user={profile}
      currentSubscription={currentSubscription}
      subscriptionHistory={subscriptionHistory || []}
      subscriptionRequests={subscriptionRequests || []}
      recentBookings={recentBookings || []}
    />
  )
}