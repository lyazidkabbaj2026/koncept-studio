import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from './signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignupPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/espace')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Card className="glass-effect animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Inscription</CardTitle>
            <CardDescription>
              Créez votre compte Koncept Studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Déjà un compte ? Connectez-vous
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}