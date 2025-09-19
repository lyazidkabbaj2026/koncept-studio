import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanSelectionForm from './plan-selection-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PlanSelectionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already has a plan selected (skip if already done)
  const { data: profile } = await supabase
    .from('profiles')
    .select('desired_plan')
    .eq('id', user.id)
    .single()

  if (profile?.desired_plan) {
    redirect('/espace')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background p-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-4xl w-full">
        <Card className="shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <img
                src="/images/logo.svg"
                alt="Koncept Studio Logo"
                className="w-16 h-16 dark:invert"
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gradient mb-2">Choix de formule</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sélectionnez une ou plusieurs formules selon vos besoins. Vous pouvez combiner différents types de formules.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <PlanSelectionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}