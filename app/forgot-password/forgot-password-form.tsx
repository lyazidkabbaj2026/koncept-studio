'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { validateInput, emailSchema } from '@/lib/validation'
import { MESSAGES } from '@/constants'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      // Validate email
      const validation = validateInput(emailSchema, email)

      if (!validation.success) {
        const errorMessage = validation.errors?.[0] || 'Email invalide'
        toast.error(errorMessage)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
      })

      if (error) {
        if (error.message.includes('Email not found')) {
          toast.error('Aucun compte associé à cette adresse email')
        } else {
          toast.error(error.message || 'Une erreur est survenue')
        }
        return
      }

      setSent(true)
      toast.success('Email de réinitialisation envoyé !')

    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Email envoyé !</h3>
          <p className="text-muted-foreground mt-2">
            Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation sous peu.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Vérifiez également vos spams si vous ne recevez rien.
          </p>
        </div>
        <Button
          onClick={() => router.push('/login')}
          className="w-full h-12 shadow-soft hover:shadow-brutal transition-all font-semibold"
          size="lg"
        >
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium">
            Adresse email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={MESSAGES.PLACEHOLDERS.EMAIL}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 shadow-soft hover:shadow-brutal transition-all font-semibold"
          size="lg"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
        </div>
      </div>
    </form>
  )
}