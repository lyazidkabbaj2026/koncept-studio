'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services'
import { MESSAGES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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

        // Check if user is admin and redirect appropriately
        const isAdmin = await authService.isUserAdmin(user.id)
        if (isAdmin) {
          router.push('/admin')
        } else {
          router.push('/espace')
        }
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
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder={MESSAGES.PLACEHOLDERS.PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        {loading ? MESSAGES.LOADING.AUTH.SIGNING_IN : 'Se connecter'}
      </Button>
    </form>
  )
}