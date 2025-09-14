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

  return <UserReservationsView userId={user.id} />
}