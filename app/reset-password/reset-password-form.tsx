'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { validateInput, passwordSchema } from '@/lib/validation'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      // Validate password
      const passwordValidation = validateInput(passwordSchema, formData.password)

      if (!passwordValidation.success) {
        const errorMessage = passwordValidation.errors?.[0] || 'Mot de passe invalide'
        toast.error(errorMessage)
        return
      }

      // Check password confirmation
      if (formData.password !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        // Translate specific error messages
        let errorMessage = error.message || 'Une erreur est survenue'
        if (errorMessage.includes('New password should be different from the old password')) {
          errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien mot de passe.'
        }
        toast.error(errorMessage)
        return
      }

      toast.success('Mot de passe mis à jour avec succès !')

      // Redirect to login or dashboard
      router.push('/espace')
      router.refresh()

    } catch (error) {
      toast.error('Une erreur est survenue lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-medium">
            Nouveau mot de passe *
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Saisissez votre nouveau mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="h-12 px-4 pr-12 border-border focus:border-primary focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <IconEyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <IconEye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmer le mot de passe *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Confirmez votre nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-12 px-4 pr-12 border-border focus:border-primary focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <IconEye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Le mot de passe doit contenir :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className={formData.password.length >= 8 ? "text-green-600" : ""}>
                • Au moins 8 caractères
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                • Une lettre majuscule
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                • Un chiffre
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 shadow-soft hover:shadow-brutal transition-all font-semibold"
          size="lg"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </Button>

        <div className="text-center">
          <a
            href="/login"
            className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline underline-offset-4"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </form>
  )
}