'use client'

import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NavbarThemeToggle } from './navbar-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, signOut, loading } = useAuth()
  const { subscription } = useSubscription()
  const pathname = usePathname()
  const router = useRouter()

  // Show loading state while determining auth status
  if (loading) {
    return (
      <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                Koncept Studio
              </Link>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <NavbarThemeToggle />
              <div className="h-10 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Get profile info from user metadata or subscription data
  const profile = {
    full_name: user?.user_metadata?.full_name || '',
    role: user?.user_metadata?.role || 'user',
    subscription_status: subscription?.status || 'pending'
  }

  // Check if we're on the home page (anonymous public page)
  const isHomePage = pathname === '/'
  // Check if we're on espace pages
  const isEspacePage = pathname.startsWith('/espace')

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }


  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gradient group-hover:scale-102 transition-transform">
                Koncept Studio
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {isHomePage && !user && (
              <>
                <Link
                  href="/#presentation-studio"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Studio
                </Link>
                <Link
                  href="/#presentation-coach"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Coach
                </Link>
                <Link
                  href="/#workouts"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Workouts
                </Link>
                <Link
                  href="/#formules"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Formules
                </Link>
                <Link
                  href="/#faq"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  FAQ
                </Link>
                <Link
                  href="/#contact"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Contact
                </Link>
              </>
            )}

            {user && profile.subscription_status === 'active' && isEspacePage && (
              <>
                <Link
                  href="/espace/planning"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    pathname === '/espace/planning'
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Planning
                </Link>
                <Link
                  href="/espace/reservations"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    pathname === '/espace/reservations'
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Mes réservations
                </Link>
                <Link
                  href="/espace/abonnement"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    pathname === '/espace/abonnement'
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Mon abonnement
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <NavbarThemeToggle />
            {!user ? (
              <Button
                asChild
                className="shadow-soft hover:shadow-brutal transition-all"
              >
                <Link href="/login">Mon espace</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors">
                    <Avatar className="h-10 w-10 shadow-soft">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(profile.full_name || user?.email || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {profile.full_name && (
                        <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                      )}
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/espace/profil">Mon profil</Link>
                  </DropdownMenuItem>

                  {profile.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Administration</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button onClick={handleLogout} className="w-full text-left">
                      Se déconnecter
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isHomePage && !user && (
          <div className="md:hidden border-t border-border">
            <div className="flex justify-between items-center py-3 px-4">
              <Link href="/#presentation-studio" className="text-xs font-medium hover:text-primary transition-colors">
                Studio
              </Link>
              <Link href="/#presentation-coach" className="text-xs font-medium hover:text-primary transition-colors">
                Coach
              </Link>
              <Link href="/#workouts" className="text-xs font-medium hover:text-primary transition-colors">
                Workouts
              </Link>
              <Link href="/#formules" className="text-xs font-medium hover:text-primary transition-colors">
                Formules
              </Link>
              <Link href="/#faq" className="text-xs font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/#contact" className="text-xs font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        )}

        {user && profile.subscription_status === 'active' && isEspacePage && (
          <div className="md:hidden border-t border-border">
            <div className="flex justify-between items-center py-3 px-4">
              <Link
                href="/espace/planning"
                className={`text-xs font-medium hover:text-primary transition-colors whitespace-nowrap ${
                  pathname === '/espace/planning' ? 'text-primary' : ''
                }`}
              >
                Planning
              </Link>
              <Link
                href="/espace/reservations"
                className={`text-xs font-medium hover:text-primary transition-colors whitespace-nowrap ${
                  pathname === '/espace/reservations' ? 'text-primary' : ''
                }`}
              >
                Mes réservations
              </Link>
              <Link
                href="/espace/abonnement"
                className={`text-xs font-medium hover:text-primary transition-colors whitespace-nowrap ${
                  pathname === '/espace/abonnement' ? 'text-primary' : ''
                }`}
              >
                Mon abonnement
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}