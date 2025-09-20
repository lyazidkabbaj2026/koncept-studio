'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { APP_CONFIG } from '@/constants/config'
import { formatPhoneNumber, createPhoneLink } from '@/lib/utils/phone'
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
  IconFlame,
  IconShield,
  IconCalendar,
  IconCreditCard,
  IconUserPlus
} from '@tabler/icons-react'
import { LocalBusinessJsonLd, FAQJsonLd, OrganizationJsonLd } from '@/components/seo/json-ld'


const faqs = [
  {
    question: "Quels sont les horaires d'ouverture ?",
    answer: "Nous sommes ouverts du lundi au vendredi de 7h00 à 21h00, et le samedi de 10h00 à 13h00. Le dimanche, le studio est fermé. Les cours sont organisés tout au long de la semaine avec des créneaux adaptés à différents emplois du temps."
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
    answer: "Oui, nous offrons la possibilité de suspendre votre abonnement pour une durée maximale d’un mois. Contactez-nous pour effectuer la demande."
  },
  {
    question: "Comment réserver mes cours ?",
    answer: "La réservation se fait facilement via notre plateforme en ligne. Vous pouvez voir les créneaux disponibles, réserver et annuler vos séances jusqu'à 1h avant le début du cours."
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
      {/* SEO Structured Data */}
      <LocalBusinessJsonLd />
      <OrganizationJsonLd />
      <FAQJsonLd faqs={faqs} />

      {/* Hero Section */}
      <section className="relative min-h-[120vh] flex items-center overflow-hidden py-8 lg:py-12" id="presentation-studio">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/70 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/10 to-primary/5" />

        {/* Floating Elements */}
        <div className="absolute top-24 left-20 w-32 h-32 rounded-full bg-primary/5 animate-float" />
        <div className="absolute bottom-32 right-40 w-24 h-24 rounded-full bg-primary/10 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/3 right-20 w-16 h-16 rounded-full bg-primary/5 animate-float" style={{animationDelay: '4s'}} />
        <div className="absolute bottom-1/4 left-32 w-20 h-20 rounded-full bg-primary/5 animate-float" style={{animationDelay: '6s'}} />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 text-foreground">
                <IconTrophy className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">Bien plus qu'une salle de sport</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight">
                  <span className="text-gradient">KONCEPT</span>
                  <br />
                  <span className="relative inline-block">
                    <span className="text-foreground">STUDIO</span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></div>
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Un lieu unique où chaque séance devient une véritable expérience sportive. Dans une ambiance conviviale et motivante, vous vous entraînez en petit groupe afin de profiter pleinement de l’énergie collective, tout en bénéficiant d’un accompagnement personnalisé adapté à vos objectifs.
                </p>
                <p className="text-base lg:text-lg font-medium text-foreground max-w-2xl leading-relaxed">
                Rejoignez-nous et transformez votre façon de vous entraîner.
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
                  <Link href="#presentation-coach">Découvrir notre coach</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">100+</div>
                  <div className="text-sm text-muted-foreground">Membres actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">10+</div>
                  <div className="text-sm text-muted-foreground">Cours différents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">5★</div>
                  <div className="text-sm text-muted-foreground">Satisfaction garantie</div>
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
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 bg-card p-4 rounded-2xl shadow-brutal border border-border">
                <div className="flex items-center space-x-2">
                  <IconTrophy className="w-5 h-5 text-foreground" />
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
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-background rounded-3xl overflow-hidden shadow-brutal">
                <Image
                  src="/images/studio/studio-main.jpg"
                  alt="Koncept Studio - Espace d'entraînement moderne et équipé"
                  fill
                  className="object-cover rounded-3xl"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent rounded-3xl" />
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="text-foreground bg-primary/10">Notre Studio</Badge>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Un espace pensé pour
                  <span className="text-foreground"> votre réussite</span>
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                Nos entraînements sont variés, exigeants et conçus pour vous aider à progresser rapidement.
                Et si vous souhaitez aller encore plus loin, vous avez également la possibilité de suivre des séances de coaching individuel ou en duo, parfaitement adaptées à vos objectifs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconCircleCheck className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Équipement Premium</h4>
                      <p className="text-sm text-muted-foreground">Matériel professionnel et installations modernes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconUsers className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Petits Groupes</h4>
                      <p className="text-sm text-muted-foreground">Les cours se déroulent en petits groupes afin de garantir un suivi personnalisé et optimal.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconHeart className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ambiance Conviviale</h4>
                      <p className="text-sm text-muted-foreground">Communauté bienveillante et motivante</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconTarget className="w-5 h-5 text-foreground" />
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
                <Badge className="text-foreground bg-primary/10">Notre Coach</Badge>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  <span className="text-foreground">Coach K</span>
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
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <Card className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-foreground">3e Dan</div>
                    <div className="text-sm text-muted-foreground">Taekwondo</div>
                  </div>
                </Card>
              </div>
              <div className="space-y-6 pt-12">
                <Card className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-foreground">20+</div>
                    <div className="text-sm text-muted-foreground">Années d'expérience</div>
                  </div>
                </Card>
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-background rounded-2xl overflow-hidden shadow-brutal relative">
                  <Image
                    src="/images/coach/coach-k-2.jpg"
                    alt="Coach K - En action d'entraînement"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
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
              <Badge className="text-foreground bg-primary/10 mb-4">FAQ</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Questions
                <span className="text-foreground"> fréquentes</span>
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
              <Badge className="text-foreground bg-primary/10 mb-4">Contact</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Prêt à commencer
                <span className="text-foreground"> votre transformation ?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Contactez-nous dès maintenant pour obtenir plus d'informations sur nos programmes.
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
                        <IconMapPin className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Adresse</h4>
                        <p className="text-muted-foreground">{APP_CONFIG.CONTACT.ADDRESS}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconPhone className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Téléphone</h4>
                        <a href={createPhoneLink(APP_CONFIG.CONTACT.PHONE)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconBrandInstagram className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Instagram</h4>
                        <a
                          href={APP_CONFIG.CONTACT.INSTAGRAM.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          @k_oncept_training
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconClock className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Horaires</h4>
                        <div className="text-muted-foreground space-y-1">
                          <p>Lundi - Vendredi: 7h - 21h</p>
                          <p>Samedi: 10h - 13h</p>
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
                      <a href={createPhoneLink(APP_CONFIG.CONTACT.PHONE)}>
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
                  <Image
                    src="/images/logo.svg"
                    alt="Koncept Studio Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 dark:invert"
                  />
                  <span className="text-2xl font-bold">
                    Koncept Studio
                  </span>
                </div>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                Votre studio de sport, spécialisé dans le renforcement, le cardio, le cardio boxing, la mobilité, le TRX, le cycling, le bootcamp et les challenges. Profitez également de séances de coaching personnalisé en one-to-one pour atteindre vos objectifs.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-foreground hover:text-foreground-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
                  >
                    <IconBrandInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href={createPhoneLink(APP_CONFIG.CONTACT.PHONE)}
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-foreground hover:text-foreground-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
                  >
                    <IconPhone className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:contact@konceptstudio.ma"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary text-foreground hover:text-foreground-foreground rounded-lg flex items-center justify-center transition-all hover:scale-102"
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
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/#presentation-studio" className="text-muted-foreground hover:text-foreground transition-colors">
                      Le Studio
                    </a>
                  </li>
                  <li>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/#presentation-coach" className="text-muted-foreground hover:text-foreground transition-colors">
                      Coach K
                    </a>
                  </li>
                  <li>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
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
                    <IconMapPin className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <p>{APP_CONFIG.CONTACT.ADDRESS}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IconPhone className="w-5 h-5 text-foreground flex-shrink-0" />
                    <a href={createPhoneLink(APP_CONFIG.CONTACT.PHONE)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IconMail className="w-5 h-5 text-foreground flex-shrink-0" />
                    <a href="mailto:contact@konceptstudio.ma" className="text-muted-foreground hover:text-foreground transition-colors">
                      contact@konceptstudio.ma
                    </a>
                  </div>
                  <div className="flex items-start space-x-3">
                    <IconClock className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground text-sm">
                      <p>Lun - Ven: 7h - 21h</p>
                      <p>Sam: 10h - 13h</p>
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
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="font-semibold px-8 py-4 shadow-brutal hover:shadow-soft transition-all transform hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/signup">
                    S'inscrire gratuitement
                    <IconArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium px-8 py-4 border-2"
                  asChild
                >
                  <a href={createPhoneLink(APP_CONFIG.CONTACT.PHONE)}>
                    <IconPhone className="w-5 h-5 mr-2" />
                    {formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-muted-foreground">
                © 2025 Koncept Studio. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Mentions légales
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
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