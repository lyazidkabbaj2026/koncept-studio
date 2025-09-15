import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/espace')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-md w-full">
        <Card className="shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gradient mb-2">Connexion</CardTitle>
              <CardDescription className="text-muted-foreground">
                Accédez à votre espace Koncept Studio
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <LoginForm />
            <div className="mt-8 text-center">
              <a
                href="/signup"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline underline-offset-4"
              >
                Pas encore de compte ? Inscrivez-vous
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}