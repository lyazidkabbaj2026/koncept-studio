'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services'
import { MESSAGES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      const { user, error } = await authService.signIn({ email, password })

      if (error) {
        toast.error(MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS, {
          style: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }
        })
        return
      }

      if (user) {
        toast.success('Connexion réussie', {
          style: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }
        })
        router.push('/espace')
        router.refresh()
      }
    } catch (error) {
      toast.error(MESSAGES.ERRORS.AUTH.LOGIN_FAILED, {
        style: {
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        }
      })
    } finally {
      setLoading(false)
    }
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