import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { UserCalendarView } from '@/components/user/calendar/user-calendar-view'

export default async function UserPlanningPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin and redirect to admin calendar
  const isAdmin = await isUserAdmin(user.id)
  if (isAdmin) {
    redirect('/admin/calendar')
  }

  // Get user profile to check status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's active subscription
  const { data: subscription, error: subscriptionError } = await supabase
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

  console.log('Planning page - Profile:', profile)
  console.log('Planning page - Subscription:', subscription)
  console.log('Planning page - Subscription Error:', subscriptionError)

  // Get subscription requests if no active subscription
  const { data: subscriptionRequest } = await supabase
    .from('subscription_requests')
    .select(`
      *,
      subscription_plans (name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <UserCalendarView 
      user={profile}
      subscription={subscription}
      subscriptionRequest={subscriptionRequest}
    />
  )
}