import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from './reset-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ResetPasswordPageProps {
  searchParams: Promise<{
    code?: string
    error?: string
    error_description?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Handle explicit errors sent from Supabase (e.g., link expired)
  if (params.error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background p-4 relative">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent" />
        <div className="relative z-10 max-w-md w-full">
          <Card className="shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm animate-slide-up">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2">Lien invalide</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {params.error_description || 'Le lien de réinitialisation est invalide ou expiré'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Veuillez demander un nouveau lien de réinitialisation.</p>
                <a href="/forgot-password" className="inline-flex items-center justify-center w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold transition-colors">
                  Demander un nouveau lien
                </a>
                <a href="/login" className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline underline-offset-4">
                  Retour à la connexion
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  /**
   * NOTE: We do NOT call exchangeCodeForSession here.
   * Your /auth/callback/route.ts handles the code exchange and redirects here.
   * By the time this page loads, the user should already have a session cookie.
   */

  // 2. Verify the session exists
  const { data: { user } } = await supabase.auth.getUser()

  // 3. If no session is found, the user isn't authorized to be here
  if (!user) {
    redirect('/forgot-password')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background p-4 relative">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-md w-full">
        <Card className="shadow-brutal border-2 border-border bg-card/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gradient mb-2">Nouveau mot de passe</CardTitle>
              <CardDescription className="text-muted-foreground">
                Saisissez votre nouveau mot de passe sécurisé
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}