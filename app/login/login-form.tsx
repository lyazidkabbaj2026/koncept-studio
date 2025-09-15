'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services'
import { useFormEventHandler } from '@/hooks'
import { ErrorAlert } from '@/components/common'
import { MESSAGES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const { loading, error, handleFormSubmit } = useFormEventHandler(
    async () => {
      const { user, error } = await authService.signIn({ email, password })

      if (error) {
        throw new Error(MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS)
      }

      if (user) {
        router.push('/espace')
        router.refresh()
      }
    },
    {
      defaultErrorMessage: MESSAGES.ERRORS.AUTH.LOGIN_FAILED,
    }
  )

  return (
    <form onSubmit={(e) => handleFormSubmit(e, { email, password })} className="space-y-8">
      <ErrorAlert error={error} />

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

        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={MESSAGES.PLACEHOLDERS.PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 px-4 border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 shadow-soft hover:shadow-brutal transition-all font-semibold"
        size="lg"
      >
        {loading ? MESSAGES.LOADING.AUTH.SIGNING_IN : 'Se connecter'}
      </Button>
    </form>
  )
}