'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services'
import { MESSAGES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupSchema, validateInput, sanitizeString } from '@/lib/validation'
import { toast } from 'sonner'
import { IconEye, IconEyeOff } from '@tabler/icons-react'


export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return


    setLoading(true)

    try {
      // Validate form data
      const validation = validateInput(signupSchema, {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      })

      if (!validation.success) {
        const errorMessage = validation.errors?.[0] || MESSAGES.ERRORS.VALIDATION
        toast.error(errorMessage)
        return
      }


      const { user, error: authError } = await authService.signUp({
        email: validation.data.email,
        password: validation.data.password,
        fullName: validation.data.fullName,
        phone: validation.data.phone,
      })

      if (authError) {
        let errorMessage: string = MESSAGES.ERRORS.AUTH.SIGNUP_FAILED
        if (authError.message.includes('already registered')) {
          errorMessage = MESSAGES.ERRORS.AUTH.EMAIL_EXISTS
        } else if (authError.message.includes('weak password')) {
          errorMessage = MESSAGES.ERRORS.AUTH.WEAK_PASSWORD
        } else {
          errorMessage = authError.message
        }

        toast.error(errorMessage)
        return
      }

      if (user) {
        toast.success('Compte créé avec succès !')

        // Send welcome WhatsApp message via API route after a delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/whatsapp/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id }),
            })

            const result = await response.json()
            console.log('WhatsApp signup API response:', result)
          } catch (error) {
            console.error('WhatsApp welcome message failed:', error)
            // Don't show error to user - this is background functionality
          }
        }, 2000) // Wait 2 seconds before sending

        router.push('/signup/plan-selection')
        router.refresh()
      }
    } catch (error) {
      toast.error(MESSAGES.ERRORS.AUTH.SIGNUP_FAILED)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Only sanitize dangerous characters, preserve spaces
    const sanitizedValue = name === 'fullName'
      ? value.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '')
      : sanitizeString(value)
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nom complet *
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder={MESSAGES.PLACEHOLDERS.NAME}
            value={formData.fullName}
            onChange={handleChange}
            className="h-12 px-4 border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium">
            Adresse email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={MESSAGES.PLACEHOLDERS.EMAIL}
            value={formData.email}
            onChange={handleChange}
            className="h-12 px-4 border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone" className="text-sm font-medium">
            Téléphone *
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder={MESSAGES.PLACEHOLDERS.PHONE}
            value={formData.phone}
            onChange={handleChange}
            className="h-12 px-4 border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>


        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe *
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder={MESSAGES.PLACEHOLDERS.PASSWORD}
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
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 shadow-soft hover:shadow-brutal transition-all font-semibold"
        size="lg"
      >
        {loading ? MESSAGES.LOADING.AUTH.SIGNING_UP : 'Créer mon compte'}
      </Button>
    </form>
  )
}