import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
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

export default async function Navbar() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name, subscription_status')
      .eq('id', user.id)
      .single()
    
    profile = data
  }

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
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Inscription</Link>
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {(profile?.full_name || user.email || '').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {profile?.full_name && (
                          <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {profile?.role !== 'admin' && (
                      <>
                        {profile?.subscription_status === 'active' ? (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/espace/planning">Planning</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/espace/reservations">Mes Réservations</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/espace/abonnement">Mon Abonnement</Link>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem asChild>
                            <Link href="/espace">Mon Espace</Link>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Administration</Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <form action={logout} className="w-full">
                      <DropdownMenuItem asChild>
                        <button type="submit" className="w-full text-left">
                          Se déconnecter
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}