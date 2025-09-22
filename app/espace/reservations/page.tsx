import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { UserReservationsView } from '@/components/user/reservations/user-reservations-view'

export default async function UserReservationsPage() {
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

  // Get user profile for subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  return <UserReservationsView userId={user.id} userSubscriptionStatus={profile?.subscription_status} />
}