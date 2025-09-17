'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSubscriptionPlansByType, saveUserPlanSelection } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { IconCheck, IconClock, IconUsers } from '@tabler/icons-react'

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number | null
  price_dhs: number
  validity_months: number | null
  validity_days: number | null
  weekly_limit: number | null
  description?: string | null
}

interface PlanType {
  type: string
  label: string
  description: string
  plans: SubscriptionPlan[]
}

export default function PlanSelectionForm() {
  const [planTypes, setPlanTypes] = useState<PlanType[]>([])
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchPlanTypes()
  }, [])

  const fetchPlanTypes = async () => {
    try {
      const groupedPlans = await getSubscriptionPlansByType()

      // Create plan types with descriptions
      const types: PlanType[] = Object.entries(groupedPlans).map(([type, plans]) => ({
        type,
        label: getTypeLabel(type),
        description: getTypeDescription(type),
        plans
      }))

      setPlanTypes(types)
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Erreur lors du chargement des formules')
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'pack': 'Packs de Séances',
      'monthly': 'Abonnements Mensuels',
      'annual': 'Abonnements Annuels',
      'personal': 'Coaching Personnel'
    }
    return labels[type] || type
  }

  const getTypeDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      'pack': 'Formules flexibles avec un nombre défini de séances',
      'monthly': 'Accès illimité sur base mensuelle',
      'annual': 'Le meilleur rapport qualité-prix sur l\'année',
      'personal': 'Accompagnement personnalisé one-to-one'
    }
    return descriptions[type] || ''
  }

  const handlePlanToggle = (planId: string) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId)
      }
      return [...prev, planId]
    })
  }


  const handleSubmit = async () => {
    if (selectedPlans.length === 0) {
      toast.error('Veuillez sélectionner au moins une formule')
      return
    }

    setSubmitting(true)

    try {
      const result = await saveUserPlanSelection(selectedPlans)

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de l\'enregistrement')
        return
      }

      toast.success('Vos préférences ont été enregistrées !')
      router.push('/espace')
    } catch (error) {
      console.error('Error saving plan selection:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement des formules...</p>
      </div>
    )
  }


  return (
    <div className="space-y-8">


      {/* Plan Types and Plans */}
      <div className="space-y-8">
        {planTypes.map((planType) => (
          <div key={planType.type} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{planType.label}</h3>
              <p className="text-muted-foreground">{planType.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {planType.plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPlans.includes(plan.id)
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                  onClick={() => handlePlanToggle(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onChange={() => handlePlanToggle(plan.id)}
                      />
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {plan.price_dhs} DH
                      <span className="text-sm text-muted-foreground ml-2">
                        {plan.validity_months && `/${plan.validity_months} mois`}
                        {plan.validity_days && `/${plan.validity_days} jours`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {plan.credits && (
                        <Badge variant="secondary" className="text-xs">
                          <IconCheck className="w-3 h-3 mr-1" />
                          {plan.credits} crédits
                        </Badge>
                      )}
                      {plan.validity_months && (
                        <Badge variant="secondary" className="text-xs">
                          <IconClock className="w-3 h-3 mr-1" />
                          Validité {plan.validity_months} mois
                        </Badge>
                      )}
                      {plan.validity_days && (
                        <Badge variant="secondary" className="text-xs">
                          <IconClock className="w-3 h-3 mr-1" />
                          Validité {plan.validity_days} jours
                        </Badge>
                      )}
                      {plan.weekly_limit && (
                        <Badge variant="secondary" className="text-xs">
                          <IconUsers className="w-3 h-3 mr-1" />
                          {plan.weekly_limit} cours/semaine max
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedPlans.length === 0
            ? 'Aucune formule sélectionnée'
            : `${selectedPlans.length} formule${selectedPlans.length > 1 ? 's' : ''} sélectionnée${selectedPlans.length > 1 ? 's' : ''}`
          }
        </div>
        <Button
          onClick={handleSubmit}
          disabled={selectedPlans.length === 0 || submitting}
          size="lg"
          className="min-w-[200px]"
        >
          {submitting ? 'Enregistrement...' : 'Confirmer ma sélection'}
        </Button>
      </div>
    </div>
  )
}