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
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { IconCalendar, IconUsers, IconSettings, IconHome, IconLogout, IconBarbell, IconCalendarEvent, IconCreditCard, IconUserCheck, IconChevronRight, IconUserCog, IconMessageCircle } from '@tabler/icons-react'
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
    title: 'IconUsers',
    icon: IconUsers,
    isCollapsible: true,
    subItems: [
      {
        title: 'All active user info',
        href: '/admin/users',
        icon: IconUsers,
      },
      {
        title: 'Pending users to contact',
        href: '/admin/users/pending',
        icon: IconUserCheck,
      },
      {
        title: 'Contacted users to assign',
        href: '/admin/users/contacted',
        icon: IconMessageCircle,
      },
    ],
  },
  {
    title: 'IconSettings',
    href: '/admin/settings',
    icon: IconSettings,
  },
]

interface NavigationSubItem {
  title: string
  href: string
  icon: React.ElementType
}

interface NavigationItem {
  title: string
  href?: string
  icon: React.ElementType
  isCollapsible?: boolean
  subItems?: NavigationSubItem[]
}

interface UserProfile {
  full_name: string | null
  email: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [unresolvedIconUsersCount, setUnresolvedIconUsersCount] = useState(0)
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
    
    const getUnresolvedIconUsersCount = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin')
        .in('subscription_status', ['pending', 'contacted'])

      if (!error && count !== null) {
        setUnresolvedIconUsersCount(count)
      }
    }
    
    getUser()
    getUnresolvedIconUsersCount()
    
    // Set up real-time subscription to update the count
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          getUnresolvedIconUsersCount()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
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
          {navigation.slice(0, -1).map((item) => {
            if (item.isCollapsible && item.subItems) {
              const isOpen = item.subItems.some(subItem => pathname === subItem.href) || pathname.startsWith('/admin/users')

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <IconChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item.title === 'IconUsers' && unresolvedIconUsersCount > 0 && (
                      <SidebarMenuBadge>
                        {unresolvedIconUsersCount}
                      </SidebarMenuBadge>
                    )}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                              <Link href={subItem.href} className="flex items-center gap-3 px-3 py-2">
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            // Only render items with href (non-collapsible items)
            if (!item.href) return null

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}

          <SidebarSeparator className="-mx-3 w-auto my-2" />

          {navigation.slice(-1).map((item) => {
            // Only render items with href
            if (!item.href) return null

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}

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