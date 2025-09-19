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

  // Handle inactive users
  if (subscriptionStatus === 'inactive') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <IconClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold mb-2">Compte désactivé</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Votre compte a été désactivé. Veuillez contacter le studio pour toute question.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pour plus d'informations ou pour réactiver votre compte, contactez-nous :
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email :</strong> contact@konceptstudio.ma</p>
                  <p><strong>Téléphone :</strong> +212 5XX XX XX XX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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