'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconCalendar, IconUsers, IconSettings, IconHome, IconLogout, IconBarbell, IconCalendarEvent, IconCreditCard, IconCalendarStats, IconX, IconClock } from '@tabler/icons-react'
import { SidebarThemeToggle } from '@/components/theme-toggle'

const navigation = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: IconHome,
  },
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: IconBarbell,
  },
  {
    title: 'Planning',
    href: '/admin/calendar',
    icon: IconCalendarEvent,
  },
  {
    title: 'Forfaits',
    href: '/admin/subscription-plans',
    icon: IconCreditCard,
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: IconUsers,
  },
  {
    title: 'Réservations',
    href: '/admin/bookings',
    icon: IconCalendarStats,
  },
  {
    title: 'Annulations',
    href: '/admin/cancellations',
    icon: IconX,
  },
  {
    title: 'Liste d\'attente',
    href: '/admin/waitlist',
    icon: IconClock,
  },
  {
    title: 'Paramètres',
    href: '/admin/settings',
    icon: IconSettings,
  },
]

interface NavigationItem {
  title: string
  href: string
  icon: React.ElementType
}

interface UserProfile {
  full_name: string | null
  email: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', authUser.id)
          .single()

        setUser({
          full_name: profile?.full_name || null,
          email: profile?.email || authUser.email || ''
        })
      }
    }

    getUser()
  }, [supabase])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconCalendar className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Koncept Studio</span>
            <span className="text-xs text-muted-foreground">Administration</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {navigation.slice(0, -1).map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarSeparator className="-mx-3 w-auto my-2" />

          {navigation.slice(-1).map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback>
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0 text-left">
                <span className="text-sm font-medium truncate w-full text-left">
                  {user?.full_name || 'Administrateur'}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full text-left">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || 'Administrateur'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Retour au site</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout} className="w-full">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left flex items-center">
                  <IconLogout className="mr-2 h-4 w-4" />
                  Se déconnecter
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}