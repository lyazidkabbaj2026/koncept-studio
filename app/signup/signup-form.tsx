'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number
  price_dhs: number
  validity_months: number
  weekly_limit?: number
  description?: string
}

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    desiredPlan: '',
  })
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('type', { ascending: true })
          .order('price_dhs', { ascending: true })

        if (error) throw error
        setPlans(data || [])
      } catch (err) {
        console.error('Error fetching plans:', err)
      }
    }

    fetchPlans()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            desired_plan: formData.desiredPlan,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.user) {
        // Profile should be created automatically by the database trigger
        // with all the data from the auth metadata
        router.push('/espace')
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur s\'est produite lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Jean Dupont"
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
          placeholder="votre@email.com"
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
          placeholder="06 12 34 56 78"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Abonnement souhaité *</Label>
        <Select
          value={formData.desiredPlan}
          onValueChange={handleSelectChange('desiredPlan')}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisissez un abonnement" />
          </SelectTrigger>
          <SelectContent>
            {plans.map(plan => (
              <SelectItem key={plan.id} value={plan.name}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{plan.name}</span>
                    {plan.description && (
                      <span className="text-xs text-muted-foreground">{plan.description}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {plan.type === 'carnet' ? 'Carnet' : 
                       plan.type === 'personal_training' ? 'Personal Training' : 
                       'Abonnement'}
                    </Badge>
                    <span className="text-sm font-bold">{plan.price_dhs} DHS</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {plans.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Chargement des plans d'abonnement...
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
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
        {loading ? 'Création du compte...' : 'Créer mon compte'}
      </Button>
    </form>
  )
}