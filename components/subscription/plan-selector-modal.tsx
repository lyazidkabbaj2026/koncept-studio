'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  IconCheck,
  IconCreditCard,
  IconCalendarEvent,
  IconUserCheck,
  IconChevronDown,
  IconTicket,
  IconClock,
  IconStar
} from '@tabler/icons-react'
import type { PlanType, SubscriptionPlan } from '@/types'
import { PLAN_TYPE_LABELS } from '@/types'

interface PlanSelectorModalProps {
  plans: SubscriptionPlan[]
  selectedPlan: string
  onSelectPlan: (planName: string) => void
  isLoading?: boolean
}

const getPlanTypeConfig = (planType: string) => {
  switch (planType) {
    case 'carnet':
      return {
        icon: IconTicket,
        title: 'Carnets',
        description: 'Forfaits de séances à utiliser selon votre rythme'
      }
    case 'abonnement':
      return {
        icon: IconCalendarEvent,
        title: 'Abonnements',
        description: 'Accès illimité avec renouvellement automatique'
      }
    case 'personal_training':
      return {
        icon: IconUserCheck,
        title: 'Personal Training',
        description: 'Sessions individuelles avec coach personnel'
      }
    default:
      return {
        icon: IconStar,
        title: 'Autres',
        description: 'Autres types de forfaits'
      }
  }
}

const formatPlanDetails = (plan: SubscriptionPlan) => {
  const details = []

  if (plan.credits) {
    details.push(`${plan.credits} crédits`)
  }

  if (plan.duration_days) {
    if (plan.duration_days >= 30) {
      const months = Math.floor(plan.duration_days / 30)
      details.push(`${months} mois`)
    } else {
      details.push(`${plan.duration_days} jours`)
    }
  }

  if (plan.weekly_credits) {
    details.push(`${plan.weekly_credits}/sem max`)
  }

  return details.join(' • ')
}

const groupPlansByType = (plans: SubscriptionPlan[]) => {
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return {}
  }

  const grouped = plans.reduce((acc, plan) => {
    if (!plan || !plan.plan_type) return acc

    if (!acc[plan.plan_type]) {
      acc[plan.plan_type] = []
    }
    acc[plan.plan_type].push(plan)
    return acc
  }, {} as Record<string, SubscriptionPlan[]>)

  // Sort each group by price
  Object.keys(grouped).forEach(type => {
    if (grouped[type] && Array.isArray(grouped[type])) {
      grouped[type].sort((a, b) => (a?.price || 0) - (b?.price || 0))
    }
  })

  return grouped
}

export function PlanSelectorModal({ plans, selectedPlan, onSelectPlan, isLoading }: PlanSelectorModalProps) {
  const [open, setOpen] = useState(false)

  // Ensure plans is always an array
  const validPlans = Array.isArray(plans) ? plans : []
  const selectedPlanData = validPlans.find(plan => plan?.name === selectedPlan)
  const groupedPlans = groupPlansByType(validPlans)
  const planTypes = ['abonnement', 'carnet', 'personal_training']


  const handleSelectPlan = (planName: string) => {
    onSelectPlan(planName)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-14 px-4"
          disabled={isLoading}
        >
          <div className="flex items-center gap-3">
            {selectedPlanData ? (
              <>
                {(() => {
                  const config = getPlanTypeConfig(selectedPlanData.plan_type)
                  const IconComponent = config.icon
                  return <IconComponent className="h-5 w-5 text-foreground" />
                })()}
                <div className="text-left">
                  <div className="font-medium">{selectedPlanData.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPlanDetails(selectedPlanData)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <IconCreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isLoading ? 'Chargement...' : 'Choisissez un forfait'}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedPlanData && (
              <span className="text-sm font-semibold">
                {selectedPlanData.price} DHS
              </span>
            )}
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Choisissez votre forfait</DialogTitle>
          <DialogDescription>
            Sélectionnez le forfait qui correspond le mieux à vos objectifs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-8">
            {(planTypes || []).map(planType => {
              const typePlans = groupedPlans[planType] || []
              if (!Array.isArray(typePlans) || typePlans.length === 0) return null

              const config = getPlanTypeConfig(planType)
              const IconComponent = config.icon

              return (
                <div key={planType} className="space-y-4">
                  <div className="flex items-center gap-3 pb-2">
                    <IconComponent className="h-6 w-6" />
                    <div>
                      <h3 className="text-lg font-semibold">{config.title}</h3>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(typePlans || []).filter(plan => plan && plan.id).map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative cursor-pointer transition-all duration-200 ${
                          selectedPlan === plan.name
                            ? 'ring-2 ring-primary shadow-md'
                            : 'hover:shadow-md hover:scale-[1.01]'
                        }`}
                        onClick={() => handleSelectPlan(plan.name)}
                      >
                        {selectedPlan === plan.name && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                            <IconCheck className="h-3 w-3" />
                          </div>
                        )}

                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold">
                            {plan.name}
                          </CardTitle>
                          {formatPlanDetails(plan) && (
                            <p className="text-sm text-muted-foreground">
                              {formatPlanDetails(plan)}
                            </p>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="text-center py-4">
                            <div className="text-3xl font-bold">
                              {plan.price}
                              <span className="text-lg font-medium text-muted-foreground ml-1">
                                DHS
                              </span>
                            </div>
                            {plan.plan_type === 'abonnement' && (
                              <div className="text-sm text-muted-foreground mt-1">/mois</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {planType !== planTypes[planTypes.length - 1] && (
                    <Separator className="mt-6" />
                  )}
                </div>
              )
            })}
          </div>

          {(!validPlans || validPlans.length === 0) && !isLoading && (
            <div className="text-center py-12">
              <IconCreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun forfait disponible</h3>
              <p className="text-muted-foreground">
                Les forfaits seront disponibles prochainement
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des forfaits...</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}