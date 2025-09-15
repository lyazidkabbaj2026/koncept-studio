'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services'
import { useFormEventHandler, useAsyncData } from '@/hooks'
import { ErrorAlert } from '@/components/common'
import { MESSAGES } from '@/constants'
import type { SubscriptionPlan } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupSchema, validateInput, sanitizeString } from '@/lib/validation'
import { PlanSelectorModal } from '@/components/subscription/plan-selector-modal'


export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    desiredPlan: '',
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Fetch subscription plans
  const { data: plansData, loading: plansLoading } = useAsyncData<SubscriptionPlan[]>(
    async () => {
      const { subscriptionService } = await import('@/lib/services')
      return subscriptionService.getAvailablePlans()
    },
    []
  )

  const plans = plansData || []
  
  const router = useRouter()

  const { loading, error, handleFormSubmit } = useFormEventHandler(
    async () => {
      // Validate form data
      const validation = validateInput(signupSchema, {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        desiredPlan: formData.desiredPlan || undefined,
      })

      if (!validation.success) {
        setValidationErrors(validation.errors || [])
        throw new Error(MESSAGES.ERRORS.VALIDATION)
      }

      if (!formData.fullName.trim()) {
        setValidationErrors(['Le nom complet est requis'])
        throw new Error(MESSAGES.ERRORS.VALIDATION)
      }

      const { user, error: authError } = await authService.signUp({
        email: validation.data.email,
        password: validation.data.password,
        fullName: validation.data.fullName,
        phone: validation.data.phone,
        desiredPlan: validation.data.desiredPlan,
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error(MESSAGES.ERRORS.AUTH.EMAIL_EXISTS)
        } else if (authError.message.includes('weak password')) {
          throw new Error(MESSAGES.ERRORS.AUTH.WEAK_PASSWORD)
        } else {
          throw new Error(authError.message)
        }
      }

      if (user) {
        router.push('/espace')
        router.refresh()
      }
    },
    {
      defaultErrorMessage: MESSAGES.ERRORS.AUTH.SIGNUP_FAILED,
      onSuccess: () => setValidationErrors([]),
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeString(value)
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }



  return (
    <form onSubmit={(e) => handleFormSubmit(e, formData)} className="space-y-6">
      <ErrorAlert error={error} />
      
      {validationErrors.length > 0 && (
        <ErrorAlert error={validationErrors} title="Erreurs de validation" />
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder={MESSAGES.PLACEHOLDERS.NAME}
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={MESSAGES.PLACEHOLDERS.EMAIL}
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder={MESSAGES.PLACEHOLDERS.PHONE}
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Abonnement souhaité *</Label>
        <PlanSelectorModal
          plans={plans}
          selectedPlan={formData.desiredPlan}
          onSelectPlan={(planName) => setFormData(prev => ({ ...prev, desiredPlan: planName }))}
          isLoading={plansLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder={MESSAGES.PLACEHOLDERS.PASSWORD}
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? MESSAGES.LOADING.AUTH.SIGNING_UP : 'Créer mon compte'}
      </Button>
    </form>
  )
}