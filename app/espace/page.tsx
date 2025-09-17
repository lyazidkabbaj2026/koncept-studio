import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCalendar, IconClipboardList, IconCreditCard, IconArrowRight } from '@tabler/icons-react'
import { SubscriptionProgress } from '@/components/user/progress/subscription-progress'
import Link from 'next/link'

export default async function EspacePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin and redirect to admin page
  const isAdmin = await isUserAdmin(user.id)
  if (isAdmin) {
    redirect('/admin')
  }

  // Get user profile with subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check subscription status
  const subscriptionStatus = (profile?.subscription_status || 'pending') as 'pending' | 'active' | 'inactive'
  
  // Redirect active users directly to planning
  if (subscriptionStatus === 'active') {
    redirect('/espace/planning')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Show subscription progress for pending users */}
        <SubscriptionProgress 
          subscriptionStatus={subscriptionStatus}
          userEmail={profile?.email}
          userName={profile?.full_name}
        />
      </div>
    </div>
  )
}