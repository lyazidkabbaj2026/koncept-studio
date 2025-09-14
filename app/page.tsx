'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Users,
  Target,
  Zap,
  Heart,
  Activity,
  Trophy,
  ChevronUp,
  ChevronDown,
  Instagram,
  Twitter,
  Youtube,
  Menu,
  X
} from 'lucide-react'

const classes = [
  { name: "Strength", variant: "default" as const },
  { name: "Cardio", variant: "secondary" as const },
  { name: "HIIT", variant: "destructive" as const },
  { name: "Pilates", variant: "outline" as const },
  { name: "Boxing", variant: "secondary" as const },
  { name: "Core Conditioning", variant: "default" as const }
]

const testimonials = [
  {
    name: "Sarah M.",
    text: "The variety of classes keeps my workouts exciting, and the trainers are incredibly supportive.",
    rating: 5
  },
  {
    name: "Ahmed K.",
    text: "Perfect for my busy schedule. I can easily book classes that fit my day.",
    rating: 5
  },
  {
    name: "Fatima L.",
    text: "Amazing community and top-notch equipment. Best decision I've made!",
    rating: 5
  }
]

const faqs = [
  {
    question: "What types of classes do you offer?",
    answer: "We offer a diverse range of classes designed to meet your fitness needs, including strength training, cardio, HIIT, Pilates, boxing, and core conditioning sessions. Whether you're a beginner or an experienced athlete, there's something for everyone."
  },
  {
    question: "Do you provide personal training?",
    answer: "Yes, we offer personalized one-on-one training sessions with our expert trainers. These sessions are tailored to your specific goals and fitness level."
  },
  {
    question: "Do I need to try a class before joining?",
    answer: "Absolutely! We encourage you to try a class to experience our training style and community atmosphere before committing to a membership."
  },
  {
    question: "What are your membership options?",
    answer: "We offer flexible membership plans including class packages (carnets), unlimited monthly/yearly subscriptions (abonnements), and personal training packages to suit different needs and budgets."
  },
  {
    question: "Is nutrition coaching available?",
    answer: "Yes, we provide comprehensive nutrition coaching to complement your fitness journey and help you achieve optimal results."
  }
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [todaysGoal, setTodaysGoal] = useState(65)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Koncept Studio</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#programs" className="text-muted-foreground hover:text-primary transition-colors">Programs</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#community" className="text-muted-foreground hover:text-primary transition-colors">Community</a>
              <a href="#blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                asChild 
                className="font-semibold hidden sm:inline-flex"
              >
                <Link href="/signup">Register Now</Link>
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card/95 backdrop-blur-md border-t">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a href="#programs" className="block text-muted-foreground hover:text-primary transition-colors">Programs</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#community" className="block text-muted-foreground hover:text-primary transition-colors">Community</a>
              <a href="#blog" className="block text-muted-foreground hover:text-primary transition-colors">Blog</a>
              <Button asChild className="font-semibold w-full">
                <Link href="/signup">Register Now</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background/80" />
        
        {/* Hero content */}
        <div className="relative z-20 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-2 text-primary">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wider uppercase">#1 Award-winning platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Unlock the strongest
              <br />
              <span className="text-primary">Version of you</span> only
              <br />
              with Koncept Studio
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              With a powerful blend of high-intensity workouts, expert coaching, and a 
              dedicated focus on delivering long-lasting results, we're here to empower 
              you to break through your limits and redefine what the possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="font-semibold px-8 transform hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/signup" className="flex items-center">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-semibold px-8"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Workout Dashboard */}
          <div className="relative animate-slide-up">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Today's Goal</h3>
                  <span className="text-primary text-2xl font-bold">{todaysGoal}%</span>
                </div>
                
                <Progress 
                  value={todaysGoal} 
                  className="mb-6 h-2"
                />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">500</div>
                    <div className="text-muted-foreground text-sm">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">1500 <span className="text-sm text-muted-foreground">kcal</span></div>
                    <div className="text-muted-foreground text-sm">Target</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="text-center text-muted-foreground text-sm mb-2">Workout Progress</div>
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 bg-muted rounded-full"></div>
                    <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center border">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Class Types Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Fitness Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of programs designed to challenge and transform you
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {classes.map((classType, index) => (
              <Badge 
                key={index} 
                variant={classType.variant}
                className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
              >
                {classType.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                "We are where fitness meets mindfulness, helping you build 
                <span className="text-primary"> resilience & embrace good life."</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Card className="p-6 hover:bg-accent/10 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Variety of Workouts</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      We offer a diverse range of classes, from high-energy HIIT sessions to calming yoga flows, 
                      allowing you to explore different styles.
                    </p>
                  </div>
                </Card>
                
                <Card className="p-6 hover:bg-accent/10 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Results-Oriented</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      We track your progress and adjust your training to ensure you are continually 
                      challenged and motivated you.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Placeholder for workout images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="p-6 h-32 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </Card>
                <Card className="p-6 h-40 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Activity className="w-8 h-8 text-primary" />
                </Card>
              </div>
              <div className="space-y-4 pt-8">
                <Card className="p-6 h-40 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Target className="w-8 h-8 text-primary" />
                </Card>
                <Card className="p-6 h-32 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Zap className="w-8 h-8 text-primary" />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30" id="community">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What Our Members Say</h2>
            <p className="text-muted-foreground">Join our fitness community today and unlock your potential</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="font-semibold">— {testimonial.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/5 transition-colors rounded-lg"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="gradient-border rounded-xl">
            <div className="text-center p-8 lg:p-12 rounded-xl">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Join our fitness community today and unlock your potential with expert trainers and diverse classes
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Transform your life and start your journey now!
              </p>
              <Button 
                size="lg" 
                className="font-semibold px-8 transform hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/signup" className="flex items-center">
                  14-day Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Koncept Studio</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering you to unlock your strongest version through expert training and community support.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Classes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Strength Training</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cardio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">HIIT</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pilates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Whitepapers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">eBooks</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 Koncept Studio. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Legal</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Services</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}