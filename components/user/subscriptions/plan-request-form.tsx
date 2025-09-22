'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  IconPlus,
  IconCheck,
  IconUsers,
  IconActivity,
  IconClock
} from '@tabler/icons-react'
import { CreateRequestData } from '@/lib/schemas/subscription-requests'
import { createSubscriptionRequest, getAvailableSubscriptionPlans } from '@/app/espace/subscriptions/actions'
import { toast } from 'sonner'

interface PlanRequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits?: number
  price_dhs: number
  validity_months?: number
  weekly_limit?: number
  description?: string
}

interface GroupedPlans {
  [key: string]: SubscriptionPlan[]
}

export function PlanRequestForm({ onSuccess, onCancel, className }: PlanRequestFormProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [groupedPlans, setGroupedPlans] = useState<GroupedPlans>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  // Simplified form data - only need plan selection

  // Load available plans
  useEffect(() => {
    async function loadPlans() {
      try {
        const result = await getAvailableSubscriptionPlans()

        if (result.success && result.data) {
          setPlans(result.data)

          // Group plans by type
          const grouped = result.data.reduce((acc: GroupedPlans, plan) => {
            if (!acc[plan.type]) {
              acc[plan.type] = []
            }
            acc[plan.type].push(plan)
            return acc
          }, {})

          setGroupedPlans(grouped)
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des plans')
      } finally {
        setIsLoadingPlans(false)
      }
    }

    loadPlans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un plan')
      return
    }

    try {
      setIsLoading(true)

      const requestData: CreateRequestData = {
        planId: selectedPlan,
      }

      const result = await createSubscriptionRequest(requestData)

      if (result.success) {
        toast.success('Demande créée avec succès!')
        onSuccess?.()
      } else {
        toast.error(result.error || 'Erreur lors de la création de la demande')
      }
    } catch (error) {
      toast.error('Erreur lors de la création de la demande')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'carnet': 'Carnet',
      'personal_training': 'Personal Training',
      'abonnement': 'Abonnement'
    }
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getTypeDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      'carnet': 'Formules flexibles avec un nombre défini de séances',
      'personal_training': 'Accompagnement personnalisé one-to-one',
      'abonnement': 'Abonnement avec limite de séances par semaine'
    }
    return descriptions[type] || ''
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  if (isLoadingPlans) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Chargement des plans...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPlus className="h-5 w-5" />
          Nouvelle demande d'abonnement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Selection */}
          <div className="space-y-4">
            <Label>Sélectionnez un plan</Label>

            {Object.entries(groupedPlans).map(([type, typePlans]) => (
              <div key={type} className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg">{getTypeLabel(type)}</h3>
                  <p className="text-sm text-muted-foreground">{getTypeDescription(type)}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {typePlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{plan.name}</h4>
                            {selectedPlan === plan.id && (
                              <IconCheck className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          <div className="text-xl font-bold text-primary">
                            {plan.price_dhs} DHS
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {plan.credits && (
                              <Badge variant="secondary" className="text-xs">
                                <IconActivity className="h-3 w-3 mr-1" />
                                {plan.credits} séances
                              </Badge>
                            )}

                            {plan.weekly_limit && (
                              <Badge variant="secondary" className="text-xs">
                                <IconUsers className="h-3 w-3 mr-1" />
                                {plan.weekly_limit}/semaine
                              </Badge>
                            )}

                            {plan.validity_months && (
                              <Badge variant="secondary" className="text-xs">
                                <IconClock className="h-3 w-3 mr-1" />
                                {plan.validity_months} mois
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Plan Details (when selected) */}
          {selectedPlanData && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Plan sélectionné: {selectedPlanData.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prix:</span>
                    <span className="ml-2 font-medium">{selectedPlanData.price_dhs} DHS</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{getTypeLabel(selectedPlanData.type)}</span>
                  </div>
                  {selectedPlanData.credits && (
                    <div>
                      <span className="text-muted-foreground">Séances:</span>
                      <span className="ml-2 font-medium">{selectedPlanData.credits}</span>
                    </div>
                  )}
                  {selectedPlanData.validity_months && (
                    <div>
                      <span className="text-muted-foreground">Validité:</span>
                      <span className="ml-2 font-medium">{selectedPlanData.validity_months} mois</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={!selectedPlan || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Création...' : 'Créer la demande'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}