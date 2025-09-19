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

  // Temporary fix: Use individual queries instead of the problematic RPC function
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

  const subscription = subscriptionData

  return (
    <UserCalendarView
      user={profile}
      subscription={subscription}
    />
  )
}