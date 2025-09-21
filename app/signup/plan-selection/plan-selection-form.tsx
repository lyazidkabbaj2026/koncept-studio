'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSubscriptionPlansByType, saveUserPlanSelection } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { IconCheck, IconClock, IconUsers, IconChevronDown, IconChevronUp, IconInfinity } from '@tabler/icons-react'

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number | null
  price_dhs: number
  validity_months: number | null
  weekly_limit: number | null
  description?: string | null
}

interface PlanType {
  type: string
  label: string
  description: string
  plans: SubscriptionPlan[]
  expanded: boolean
}

export default function PlanSelectionForm() {
  const [planTypes, setPlanTypes] = useState<PlanType[]>([])
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const fetchPlanTypes = useCallback(async () => {
    try {
      const groupedPlans = await getSubscriptionPlansByType()

      // Create plan types with descriptions
      const types: PlanType[] = Object.entries(groupedPlans).map(([type, plans]) => ({
        type,
        label: getTypeLabel(type),
        description: getTypeDescription(type),
        plans,
        expanded: false
      }))

      setPlanTypes(types)
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Erreur lors du chargement des formules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlanTypes()
  }, [fetchPlanTypes])

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'carnet': 'Carnet',
      'personal_training': 'Personal training',
      'abonnement': 'Abonnement annuel'
    }
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getTypeDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      'carnet': 'Formules flexibles avec un nombre défini de séances',
      'personal_training': 'Accompagnement personnalisé one-to-one',
      'abonnement': 'Accès illimité avec limite de séances par semaine'
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

  const togglePlanType = (typeIndex: number) => {
    setPlanTypes(prev =>
      prev.map((planType, index) =>
        index === typeIndex
          ? { ...planType, expanded: !planType.expanded }
          : planType
      )
    )
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
    <div className="space-y-6 sm:space-y-8">
      {/* Plan Types and Plans */}
      <div className="space-y-4 sm:space-y-6">
        {planTypes.map((planType, typeIndex) => (
          <div key={planType.type} className="space-y-3 sm:space-y-4">
            {/* Type Header */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold">{planType.label}</h3>
                    <p className="text-sm text-muted-foreground pr-2">{planType.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlanType(typeIndex)}
                    className="ml-0 sm:ml-4 self-start sm:self-start mt-0 sm:mt-0"
                  >
                    <span className="text-sm">{planType.expanded ? 'Masquer' : 'Voir les formules'}</span>
                    {planType.expanded ? (
                      <IconChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <IconChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Plans Grid (shown when expanded) */}
            {planType.expanded && (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg leading-tight flex-1 pr-2">{plan.name}</CardTitle>
                        <Checkbox
                          checked={selectedPlans.includes(plan.id)}
                          onChange={() => handlePlanToggle(plan.id)}
                          className="mt-0.5 flex-shrink-0"
                        />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {plan.price_dhs} DHS
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3">
                      {plan.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {/* For abonnement plans, show unlimited credits */}
                        {planType.type === 'abonnement' ? (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            <IconInfinity className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Séances illimitées</span>
                          </Badge>
                        ) : (
                          /* For non-abonnement plans, show total séances */
                          plan.credits && plan.credits > 0 && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <IconCheck className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Total: {plan.credits} séances</span>
                            </Badge>
                          )
                        )}

                        {/* For non-abonnement plans, show validity in months only */}
                        {plan.validity_months && planType.type !== 'abonnement' && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            <IconClock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Valide {plan.validity_months} mois</span>
                          </Badge>
                        )}

                        {/* For abonnement plans, show weekly limit */}
                        {plan.weekly_limit && planType.type === 'abonnement' && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            <IconUsers className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{plan.weekly_limit} séances/semaine max</span>
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-6 border-t">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          {selectedPlans.length === 0
            ? 'Aucune formule sélectionnée'
            : `${selectedPlans.length} formule${selectedPlans.length > 1 ? 's' : ''} sélectionnée${selectedPlans.length > 1 ? 's' : ''}`
          }
        </div>
        <Button
          onClick={handleSubmit}
          disabled={selectedPlans.length === 0 || submitting}
          size="lg"
          className="min-w-[200px] w-full sm:w-auto"
        >
          {submitting ? 'Enregistrement...' : 'Confirmer ma sélection'}
        </Button>
      </div>
    </div>
  )
}