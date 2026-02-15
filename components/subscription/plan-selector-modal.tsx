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

const getPlanTypeConfig = (type: string) => {
  switch (type) {
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
        title: 'Coaching Personnel',
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

  // Don't show total credits/classes for abonnements
  if (plan.type !== 'abonnement' && plan.credits) {
    details.push(`${plan.credits} classes`)
  }

  if (plan.validity_months && plan.validity_months > 0) {
    details.push(`${plan.validity_months} mois`)
  }

  // For abonnements, show weekly format differently
  if (plan.weekly_limit) {
    if (plan.type === 'abonnement') {
      details.push(`${plan.weekly_limit} classes/semaine`)
    } else {
      details.push(`${plan.weekly_limit}/sem max`)
    }
  }

  return details.join(' • ')
}

const groupPlansByType = (plans: SubscriptionPlan[]) => {
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return {}
  }

  const grouped = plans.reduce((acc, plan) => {
    if (!plan || !plan.type) return acc

    if (!acc[plan.type]) {
      acc[plan.type] = []
    }
    acc[plan.type].push(plan)
    return acc
  }, {} as Record<string, SubscriptionPlan[]>)

  // Sort each group by price
  Object.keys(grouped).forEach(type => {
    if (grouped[type] && Array.isArray(grouped[type])) {
      grouped[type].sort((a, b) => (a?.price_dhs || 0) - (b?.price_dhs || 0))
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
                  const config = getPlanTypeConfig(selectedPlanData.type)
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
                {selectedPlanData.price_dhs} DHS
              </span>
            )}
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Choisissez votre forfait</DialogTitle>
          <DialogDescription>
            Sélectionnez le forfait qui correspond le mieux à vos objectifs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-8 pr-2">
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
                            : 'hover:shadow-lg hover:-translate-y-1'
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
                            {plan.type === 'abonnement' ? (
                              <>
                                <div className="text-2xl font-bold">
                                  {Math.round(plan.price_dhs / 12)}
                                  <span className="text-base font-medium text-muted-foreground ml-1">
                                    DHS/mois
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {plan.price_dhs} DHS/an
                                </div>
                              </>
                            ) : (
                              <div className="text-3xl font-bold">
                                {plan.price_dhs}
                                <span className="text-lg font-medium text-muted-foreground ml-1">
                                  DHS
                                </span>
                              </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des forfaits...</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}