'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  IconArrowRight,
  IconStar,
  IconUsers,
  IconTarget,
  IconBolt,
  IconHeart,
  IconActivity,
  IconTrophy,
  IconChevronDown,
  IconBrandInstagram,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconCircleCheck,
  IconBarbell,
  IconFlame,
  IconShield,
  IconCalendar,
  IconCreditCard,
  IconTicket,
  IconInfinity,
  IconUserPlus
} from '@tabler/icons-react'

const workouts = [
  {
    name: "HIIT Functional",
    description: "Entraînement haute intensité combinant mouvements fonctionnels pour brûler un maximum de calories et améliorer votre condition physique globale.",
    duration: "45 min",
    intensity: "Élevée",
    icon: IconFlame,
    color: "bg-red-500/10 text-red-500"
  },
  {
    name: "Strength Training",
    description: "Séances de renforcement musculaire avec charges libres et équipements professionnels pour développer force et masse musculaire.",
    duration: "60 min",
    intensity: "Modérée à Élevée",
    icon: IconBarbell,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    name: "Body Combat",
    description: "Arts martiaux sans contact inspirés du karaté, taekwondo, boxe et muay thai. Parfait pour évacuer le stress et se défouler.",
    duration: "50 min",
    intensity: "Élevée",
    icon: IconTarget,
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    name: "TRX Suspension",
    description: "Entraînement fonctionnel avec sangles de suspension pour développer force, équilibre et stabilité en utilisant le poids du corps.",
    duration: "45 min",
    intensity: "Modérée",
    icon: IconActivity,
    color: "bg-green-500/10 text-green-500"
  },
  {
    name: "Personal Training",
    description: "Coaching individuel personnalisé selon vos objectifs spécifiques avec suivi complet et programme sur mesure.",
    duration: "60 min",
    intensity: "Variable",
    icon: IconUsers,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    name: "Nutrition Coaching",
    description: "Accompagnement nutritionnel complet avec plans alimentaires personnalisés pour optimiser vos résultats sportifs.",
    duration: "Consultation",
    intensity: "N/A",
    icon: IconHeart,
    color: "bg-pink-500/10 text-pink-500"
  }
]

const subscriptionPlans = [
  {
    name: "Carnet 10 séances",
    price: "250 DH",
    description: "Parfait pour débuter ou compléter votre routine",
    features: [
      "10 séances de cours collectifs",
      "Validité 3 mois",
      "Accès à tous les cours",
      "Suivi personnalisé"
    ],
    icon: IconTicket,
    popular: false,
    color: "border-border"
  },
  {
    name: "Abonnement Mensuel",
    price: "300 DH",
    description: "Idéal pour une pratique régulière",
    features: [
      "Cours collectifs illimités",
      "Accès à tous les créneaux",
      "Suivi de progression",
      "Accès prioritaire aux nouveaux cours",
      "1 séance d'évaluation offerte"
    ],
    icon: IconCalendar,
    popular: true,
    color: "border-primary bg-primary/5"
  },
  {
    name: "Abonnement Annuel",
    price: "2800 DH",
    description: "Le meilleur rapport qualité-prix",
    features: [
      "Cours collectifs illimités",
      "Personal training (2 séances/mois)",
      "Suivi nutritionnel inclus",
      "Accès VIP aux événements",
      "Plan d'entraînement personnalisé",
      "Réduction sur les services additionnels"
    ],
    icon: IconInfinity,
    popular: false,
    color: "border-border"
  },
  {
    name: "Personal Training",
    price: "200 DH",
    description: "Coaching individuel de haute qualité",
    features: [
      "Séance individuelle 1h",
      "Programme personnalisé",
      "Suivi nutrition inclus",
      "Flexibilité horaire",
      "Matériel spécialisé"
    ],
    icon: IconShield,
    popular: false,
    color: "border-border"
  }
]

const faqs = [
  {
    question: "Quels sont les horaires d'ouverture ?",
    answer: "Nous sommes ouverts du lundi au samedi de 6h00 à 22h00, et le dimanche de 8h00 à 20h00. Les cours ont lieu tout au long de la journée avec des créneaux adaptés à tous les emplois du temps."
  },
  {
    question: "Faut-il avoir un niveau minimum pour commencer ?",
    answer: "Absolument pas ! Nos cours sont adaptés à tous les niveaux. Coach K adapte les exercices selon vos capacités et vous guide progressivement vers vos objectifs."
  },
  {
    question: "Que dois-je apporter pour mon premier cours ?",
    answer: "Apportez simplement une tenue de sport confortable, des chaussures de sport et une bouteille d'eau. Nous fournissons tout le matériel nécessaire (tapis, haltères, sangles TRX, etc.)."
  },
  {
    question: "Puis-je suspendre mon abonnement temporairement ?",
    answer: "Oui, nous offrons la possibilité de suspendre votre abonnement pour des raisons de santé, voyage ou autres circonstances particulières. Contactez-nous pour étudier votre situation."
  },
  {
    question: "Y a-t-il un suivi nutritionnel ?",
    answer: "Coach K est certifié en nutrition sportive. Un suivi nutritionnel est inclus dans certaines formules et disponible en option pour les autres abonnements."
  },
  {
    question: "Comment réserver mes cours ?",
    answer: "La réservation se fait facilement via notre plateforme en ligne. Vous pouvez voir les créneaux disponibles, réserver et annuler vos séances jusqu'à 2h avant le début du cours."
  }
]

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    // TODO: Implement actual form submission
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Section */}
      <section className="relative min-h-[130vh] flex items-center overflow-hidden pt-20" id="presentation-studio">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/70 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/10 to-primary/5" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/5 animate-float" />
        <div className="absolute bottom-40 right-40 w-24 h-24 rounded-full bg-primary/10 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-primary/5 animate-float" style={{animationDelay: '4s'}} />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 text-primary">
                <IconTrophy className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">Bien plus qu'une salle de sport</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight">
                  <span className="text-gradient">K-ONCEPT</span>
                  <br />
                  <span className="relative inline-block">
                    <span className="text-primary">STUDIO</span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></div>
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  K-ONCEPT STUDIO, c'est un lieu unique où chaque séance devient une véritable expérience sportive.
                  Dans une ambiance conviviale et motivante, tu t'entraînes en petit groupe (maximum 12 personnes)
                  pour profiter de l'énergie collective tout en bénéficiant d'un accompagnement personnalisé.
                </p>
                <p className="text-base lg:text-lg font-medium text-foreground max-w-2xl leading-relaxed">
                  Rejoins-nous et transforme ta façon de t'entraîner.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="font-semibold px-8 py-4 shadow-brutal hover:shadow-soft transition-all transform hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/signup" className="flex items-center">
                    Commencer maintenant
                    <IconArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-medium px-8 py-4 border-2 hover:bg-primary/5"
                  asChild
                >
                  <Link href="#workouts">Découvrir nos cours</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Membres actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Cours différents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="aspect-square bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 shadow-brutal">
                <div className="w-full h-full rounded-2xl shadow-soft overflow-hidden relative">
                  <Image
                    src="/images/studio/studio-interior.jpg"
                    alt="Intérieur du studio K-ONCEPT - Espace d'entraînement moderne"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 bg-card p-4 rounded-2xl shadow-brutal border border-border">
                <div className="flex items-center space-x-2">
                  <IconUsers className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Max 12</div>
                    <div className="text-xs text-muted-foreground">personnes/cours</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-2xl shadow-brutal border border-border">
                <div className="flex items-center space-x-2">
                  <IconTrophy className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Coach K</div>
                    <div className="text-xs text-muted-foreground">Expert certifié</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Presentation */}
      <section className="py-16 lg:py-24 mt-8 lg:mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-background rounded-3xl overflow-hidden shadow-brutal">
                <div className="w-full h-full bg-gradient-to-br from-muted/30 via-primary/10 to-muted/20 flex items-center justify-center">
                  <div className="text-center text-primary/60">
                    <IconTarget className="w-20 h-20 mx-auto mb-3" />
                    <p className="text-base font-semibold">Notre Studio</p>
                    <p className="text-xs">Photo à venir</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent rounded-3xl" />
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="text-primary bg-primary/10">Notre Studio</Badge>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Un espace pensé pour
                  <span className="text-primary"> votre réussite</span>
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nos entraînements sont variés, exigeants et conçus pour t'aider à progresser rapidement.
                  Et si tu veux aller encore plus loin, tu as aussi la possibilité de suivre des séances de coaching
                  individuel ou en duo, parfaitement adaptées à tes objectifs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconCircleCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Équipement Premium</h4>
                      <p className="text-sm text-muted-foreground">Matériel professionnel et installations modernes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconUsers className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Petits Groupes</h4>
                      <p className="text-sm text-muted-foreground">Maximum 12 personnes par cours pour un suivi optimal</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconHeart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ambiance Conviviale</h4>
                      <p className="text-sm text-muted-foreground">Communauté bienveillante et motivante</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconTarget className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Résultats Garantis</h4>
                      <p className="text-sm text-muted-foreground">Approche scientifique et suivi personnalisé</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coach Section */}
      <section className="py-16 lg:py-24" id="presentation-coach">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="text-primary bg-primary/10">Notre Coach</Badge>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  <span className="text-primary">Coach K</span>
                </h2>
                <h3 className="text-xl lg:text-2xl font-semibold text-muted-foreground">
                  Manager Sportif | Coach International | Expert Taekwondo & Fitness
                </h3>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Passionné de sport depuis plus de 20 ans, Coach K allie une carrière d'athlète international en
                  Taekwondo à une solide expérience en gestion de clubs de fitness et en coaching personnalisé.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Diplômé en management du sport, formé auprès des plus grands programmes internationaux comme
                  Les Mills ou HBX, il intervient aujourd'hui en tant que coach expert en fitness fonctionnel,
                  arts martiaux et entraînement de haute intensité.
                </p>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <p className="text-lg font-medium text-foreground italic">
                    "Coach K accompagne chacun avec rigueur, énergie et bienveillance, que ce soit en séance de groupe,
                    en coaching individuel ou en accompagnement sportif sur mesure."
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" size="lg" className="flex items-center" asChild>
                  <a href="tel:0663235797">
                    <IconPhone className="w-5 h-5 mr-2" />
                    06 63 23 57 97
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="flex items-center" asChild>
                  <a href="https://instagram.com/k_oncept_training" target="_blank" rel="noopener noreferrer">
                    <IconBrandInstagram className="w-5 h-5 mr-2" />
                    @k_oncept_training
                  </a>
                </Button>
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-background rounded-2xl overflow-hidden shadow-brutal relative">
                  <Image
                    src="/images/coach/coach-k-1.jpg"
                    alt="Coach K - Portrait professionnel"
                    fill
                    className="object-cover"
                  />
                </div>
                <Card className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">3e Dan</div>
                    <div className="text-sm text-muted-foreground">Taekwondo</div>
                  </div>
                </Card>
              </div>
              <div className="space-y-6 pt-12">
                <Card className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">20+</div>
                    <div className="text-sm text-muted-foreground">Années d'expérience</div>
                  </div>
                </Card>
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-background rounded-2xl overflow-hidden shadow-brutal relative">
                  <Image
                    src="/images/coach/coach-k-2.jpg"
                    alt="Coach K - En action d'entraînement"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workouts Section */}
      <section className="py-16 lg:py-24 bg-muted/30" id="workouts">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="text-primary bg-primary/10 mb-4">Nos Cours</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Des entraînements
              <span className="text-primary"> variés et exigeants</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez notre gamme complète de cours conçus pour tous les niveaux et tous les objectifs.
              Chaque séance est une nouvelle opportunité de vous surpasser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {workouts.map((workout, index) => {
              const IconComponent = workout.icon
              return (
                <Card key={index} className="group hover:shadow-brutal transition-all duration-300 hover:-translate-y-0.5 border-border bg-card/50 backdrop-blur-sm">
                  <CardHeader className="space-y-4">
                    <div className={`w-16 h-16 rounded-2xl ${workout.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{workout.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IconClock className="w-4 h-4" />
                          <span>{workout.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconFlame className="w-4 h-4" />
                          <span>{workout.intensity}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{workout.description}</p>
                    <Button className="w-full mt-6 group-hover:shadow-soft transition-all" variant="outline">
                      En savoir plus
                      <IconArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Formules Section */}
      <section className="py-16 lg:py-24" id="formules">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="text-primary bg-primary/10 mb-4">Nos Formules</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Choisissez la formule
              <span className="text-primary"> qui vous correspond</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Des options flexibles adaptées à vos besoins et votre budget.
              Commencez votre transformation dès aujourd'hui.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {subscriptionPlans.map((plan, index) => {
              const IconComponent = plan.icon
              return (
                <Card
                  key={index}
                  className={`relative group hover:shadow-brutal transition-all duration-300 hover:-translate-y-1 ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Populaire
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {plan.price}
                        {plan.name.includes('séance') && <span className="text-sm text-muted-foreground">/séance</span>}
                        {plan.name.includes('Mensuel') && <span className="text-sm text-muted-foreground">/mois</span>}
                        {plan.name.includes('Annuel') && <span className="text-sm text-muted-foreground">/an</span>}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <IconCircleCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''} group-hover:shadow-soft transition-all`}
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup">
                        Choisir cette formule
                        <IconArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center space-y-4">
            <p className="text-muted-foreground">
              Toutes nos formules incluent l'accès aux vestiaires, WiFi et parking gratuit.
            </p>
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <IconShield className="w-4 h-4 text-primary" />
                <span>Aucun engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconCreditCard className="w-4 h-4 text-primary" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconCircleCheck className="w-4 h-4 text-primary" />
                <span>Satisfait ou remboursé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-muted/30" id="faq">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="text-primary bg-primary/10 mb-4">FAQ</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Questions
                <span className="text-primary"> fréquentes</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Retrouvez les réponses aux questions les plus courantes sur K-ONCEPT STUDIO.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 shadow-soft hover:shadow-brutal transition-all"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-base">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Vous avez d'autres questions ?
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link href="#contact">
                  Contactez-nous
                  <IconArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24" id="contact">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="text-primary bg-primary/10 mb-4">Contact</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Prêt à commencer
                <span className="text-primary"> votre transformation ?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Contactez-nous dès maintenant pour réserver votre première séance découverte gratuite
                ou pour obtenir plus d'informations sur nos programmes.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Informations de contact</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconMapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Adresse</h4>
                        <p className="text-muted-foreground">Casablanca, Maroc</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconPhone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Téléphone</h4>
                        <a href="tel:0663235797" className="text-muted-foreground hover:text-primary transition-colors">
                          06 63 23 57 97
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconBrandInstagram className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Instagram</h4>
                        <a
                          href="https://instagram.com/k_oncept_training"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          @k_oncept_training
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconClock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Horaires</h4>
                        <div className="text-muted-foreground space-y-1">
                          <p>Lundi - Samedi: 6h00 - 22h00</p>
                          <p>Dimanche: 8h00 - 20h00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <h4 className="font-semibold mb-4">Actions rapides</h4>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="ghost" asChild>
                      <Link href="/signup">
                        <IconUserPlus className="w-5 h-5 mr-3" />
                        Créer un compte
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="ghost" asChild>
                      <Link href="/login">
                        <IconCalendar className="w-5 h-5 mr-3" />
                        Réserver un cours
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="ghost" asChild>
                      <a href="tel:0663235797">
                        <IconPhone className="w-5 h-5 mr-3" />
                        Appeler maintenant
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="shadow-brutal border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez ce formulaire et nous vous répondrons dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="06 XX XX XX XX"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Parlez-nous de vos objectifs, questions ou besoins spécifiques..."
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        className="min-h-32 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full font-semibold shadow-soft hover:shadow-brutal transition-all"
                    >
                      Envoyer le message
                      <IconArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      En soumettant ce formulaire, vous acceptez d'être contacté par K-ONCEPT STUDIO
                      concernant nos services. Nous respectons votre vie privée.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-muted/30 via-background to-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-primary-foreground rounded-sm"></div>
                  </div>
                  <span className="text-2xl font-bold text-gradient">
                    Koncept Studio
                  </span>
                </div>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Votre studio de sport à Rabat, spécialisé dans le HIIT, CrossFit et arts martiaux.
                  Rejoignez notre communauté et transformez votre condition physique avec Coach K.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
                  >
                    <IconBrandInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href="tel:0663235797"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
                  >
                    <IconPhone className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:contact@konceptstudio.ma"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
                  >
                    <IconMail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Navigation</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="/#presentation-studio" className="text-muted-foreground hover:text-primary transition-colors">
                      Le Studio
                    </a>
                  </li>
                  <li>
                    <a href="/#presentation-coach" className="text-muted-foreground hover:text-primary transition-colors">
                      Coach K
                    </a>
                  </li>
                  <li>
                    <a href="/#workouts" className="text-muted-foreground hover:text-primary transition-colors">
                      Nos Cours
                    </a>
                  </li>
                  <li>
                    <a href="/#formules" className="text-muted-foreground hover:text-primary transition-colors">
                      Tarifs
                    </a>
                  </li>
                  <li>
                    <a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <IconMapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <p>Rabat, Maroc</p>
                      <p className="text-sm">Adresse exacte communiquée</p>
                      <p className="text-sm">lors de l'inscription</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IconPhone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="tel:0663235797" className="text-muted-foreground hover:text-primary transition-colors">
                      06 63 23 57 97
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IconMail className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="mailto:contact@konceptstudio.ma" className="text-muted-foreground hover:text-primary transition-colors">
                      contact@konceptstudio.ma
                    </a>
                  </div>
                  <div className="flex items-start space-x-3">
                    <IconClock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground text-sm">
                      <p>Lun - Ven: 6h - 22h</p>
                      <p>Sam - Dim: 8h - 20h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-12 border-t border-border">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl lg:text-3xl font-bold">
                  Prêt à commencer votre transformation ?
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Votre première séance découverte est offerte. Contactez-nous dès maintenant !
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="font-semibold px-8 py-4 shadow-brutal hover:shadow-soft transition-all transform hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/signup">
                    Séance découverte gratuite
                    <IconArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium px-8 py-4 border-2"
                  asChild
                >
                  <a href="tel:0663235797">
                    <IconPhone className="w-5 h-5 mr-2" />
                    06 63 23 57 97
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-muted-foreground">
                © 2024 Koncept Studio. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">
                  Mentions légales
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  CGV
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}