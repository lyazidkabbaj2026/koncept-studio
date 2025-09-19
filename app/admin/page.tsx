import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use the admin check function to bypass RLS issues
  const isAdmin = await isUserAdmin(user.id)

  if (!isAdmin) {
    redirect('/espace')
  }

  // Redirect to /admin/users as the default admin landing page
  redirect('/admin/users')
}