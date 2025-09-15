'use client'

import { IconCheck, IconClock, IconMail, IconCreditCard, IconStar, IconUser } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface SubscriptionProgressProps {
  subscriptionStatus: 'pending' | 'contacted' | 'active' | 'inactive'
  userEmail?: string
  userName?: string
}

const progressSteps = [
  {
    id: 1,
    title: 'Inscription',
    description: 'Création de votre compte',
    icon: IconCheck,
    statuses: ['pending', 'contacted', 'active', 'inactive']
  },
  {
    id: 2,
    title: 'Contact',
    description: 'Nous vous contactons',
    icon: IconMail,
    statuses: ['contacted', 'active', 'inactive']
  },
  {
    id: 3,
    title: 'Paiement',
    description: 'Finalisation de votre abonnement',
    icon: IconCreditCard,
    statuses: ['active']
  },
  {
    id: 4,
    title: 'Activation',
    description: 'Accès aux fonctionnalités',
    icon: IconStar,
    statuses: ['active']
  }
]

export function SubscriptionProgress({ subscriptionStatus, userEmail, userName }: SubscriptionProgressProps) {
  const getCurrentStep = () => {
    switch (subscriptionStatus) {
      case 'pending': return 2
      case 'contacted': return 3
      case 'active': return 4
      default: return 1
    }
  }

  const currentStep = getCurrentStep()
  const progressPercentage = ((currentStep - 1) / (progressSteps.length - 1)) * 100

  const getStatusMessage = () => {
    switch (subscriptionStatus) {
      case 'pending':
        return {
          title: 'Nous allons vous contacter',
          description: 'Votre inscription a été reçue ! Nous allons vous contacter sous peu pour finaliser votre abonnement et discuter de vos besoins.'
        }
      case 'contacted':
        return {
          title: 'Finalisez votre paiement',
          description: 'Nous vous avons contacté ! Une fois votre paiement effectué, votre compte sera activé et vous pourrez accéder à toutes nos fonctionnalités.'
        }
      case 'active':
        return {
          title: 'Votre compte est actif !',
          description: 'Félicitations ! Votre compte est maintenant actif. Vous pouvez réserver vos cours et accéder à toutes nos fonctionnalités.'
        }
      case 'inactive':
        return {
          title: 'Compte inactif',
          description: 'Votre compte n\'est pas actif. Veuillez contacter notre équipe pour plus d\'informations.'
        }
      default:
        return {
          title: 'Statut inconnu',
          description: 'Veuillez contacter notre équipe pour plus d\'informations.'
        }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Status Alert 
      <Alert className={cn(
        "border-l-4 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-4",
        subscriptionStatus === 'pending' && "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
        subscriptionStatus === 'contacted' && "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20",
        subscriptionStatus === 'active' && "border-l-green-500 bg-green-50 dark:bg-green-950/20",
        subscriptionStatus === 'inactive' && "border-l-red-500 bg-red-50 dark:bg-red-950/20"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full mt-1 flex-shrink-0",
            subscriptionStatus === 'pending' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
            subscriptionStatus === 'contacted' && "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
            subscriptionStatus === 'active' && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
            subscriptionStatus === 'inactive' && "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
          )}>
            <IconClock size={20} />
          </div>
          <AlertDescription className="flex-1">
            <div className="font-semibold text-base mb-1">{statusMessage.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{statusMessage.description}</p>
          </AlertDescription>
        </div>
      </Alert>*/}

      {/* Progress Steps */}
      <Card className="animate-in fade-in-0 slide-in-from-bottom-6" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">Progression de votre inscription</CardTitle>
          <CardDescription>
            Suivez l'avancement de l'activation de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Desktop: Horizontal Progress */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-8 left-8 right-8 h-0.5 bg-border" />
              <div 
                className="absolute top-8 left-8 h-0.5 bg-foreground transition-all duration-700 ease-out"
                style={{ 
                  width: `calc(${progressPercentage}% - 2rem)` 
                }}
              />
              
              {/* Steps */}
              <div className="flex justify-between">
                {progressSteps.map((step, index) => {
                  const isCompleted = step.statuses.includes(subscriptionStatus) && currentStep > step.id
                  const isCurrent = currentStep === step.id
                  
                  return (
                    <div 
                      key={step.id} 
                      className="relative flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Step Icon */}
                      <div className={cn(
                        "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-500 bg-background",
                        isCompleted && "border-foreground bg-foreground text-background",
                        isCurrent && "border-foreground text-foreground scale-105",
                        !isCompleted && !isCurrent && "border-border text-muted-foreground"
                      )}>
                        <div className={cn(isCurrent && "animate-pulse")}>
                          <step.icon size={24} />
                        </div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="mt-4 text-center max-w-[120px]">
                        <div className="flex flex-col items-center gap-2 mb-2">
                          <h3 className={cn(
                            "font-medium text-sm",
                            (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {step.title}
                          </h3>
                          {isCompleted && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              Terminé
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="default" className="text-xs px-2 py-0.5">
                              En cours
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "text-xs leading-tight",
                          (isCompleted || isCurrent) ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        )}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Progress */}
          <div className="md:hidden">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border" />
              <div 
                className="absolute left-8 top-8 w-0.5 bg-foreground transition-all duration-700 ease-out"
                style={{ 
                  height: `${progressPercentage}%` 
                }}
              />
              
              {/* Steps */}
              <div className="space-y-8">
                {progressSteps.map((step, index) => {
                  const isCompleted = step.statuses.includes(subscriptionStatus) && currentStep > step.id
                  const isCurrent = currentStep === step.id
                  
                  return (
                    <div 
                      key={step.id} 
                      className="relative flex items-start animate-in fade-in-0 slide-in-from-left-4"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Step Icon */}
                      <div className={cn(
                        "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-500 bg-background",
                        isCompleted && "border-foreground bg-foreground text-background",
                        isCurrent && "border-foreground text-foreground scale-105",
                        !isCompleted && !isCurrent && "border-border text-muted-foreground"
                      )}>
                        <div className={cn(isCurrent && "animate-pulse")}>
                          <step.icon size={24} />
                        </div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={cn(
                            "font-medium",
                            (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {step.title}
                          </h3>
                          {isCompleted && (
                            <Badge variant="outline" className="text-xs">
                              Terminé
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              En cours
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm",
                          (isCompleted || isCurrent) ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        )}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}