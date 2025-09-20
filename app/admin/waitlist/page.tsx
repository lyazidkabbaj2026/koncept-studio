'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WaitlistTable } from '@/components/admin/waitlist-table'
import { formatDateTime } from '@/lib/utils/date'
import { IconClock, IconCalendarEvent, IconCheck, IconUsers } from '@tabler/icons-react'
import { useAuth } from '@/hooks/use-auth'
import type { WaitlistWithDetails } from '@/types/booking'

interface WaitlistEntry {
  id: string
  position: number
  joined_at: string
  notified_at: string | null
  user: {
    id: string
    full_name: string
    email: string
    phone: string | null
  }
  schedule: {
    id: string
    start_datetime: string
    end_datetime: string
    current_bookings: number
    class: {
      id: string
      title: string
      coach: string
      location: string
      max_capacity: number
    }
  }
  subscription?: {
    id: string
    plan: {
      name: string
    }
  } | null
}

interface WaitlistStats {
  total: number
  today: number
  tomorrow: number
  notified: number
}

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistWithDetails[]>([])
  const [stats, setStats] = useState<WaitlistStats>({ total: 0, today: 0, tomorrow: 0, notified: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const checkAdminAccess = useCallback(async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      await Promise.all([fetchWaitlist(), fetchStats()])
    } catch (err) {
      console.error('Error checking admin access:', err)
      router.push('/')
    }
  }, [user, router, supabase])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    checkAdminAccess()
  }, [user, authLoading, router, checkAdminAccess])

  const fetchWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from('class_waitlist')
        .select(`
          id,
          position,
          joined_at,
          notified_at,
          user:profiles!user_id (
            id,
            full_name,
            email,
            phone
          ),
          schedule:class_schedules!schedule_id (
            id,
            start_datetime,
            end_datetime,
            current_bookings,
            class:classes!class_id (
              id,
              title,
              coach,
              location,
              max_capacity
            )
          ),
          subscription:user_subscriptions!subscription_id (
            id,
            plan:subscription_plans!plan_id (
              name
            )
          )
        `)
        .order('schedule(start_datetime)', { ascending: true })
        .order('position', { ascending: true })

      if (error) throw error
      setWaitlist((data || []) as unknown as WaitlistWithDetails[])
    } catch (err) {
      console.error('Error fetching waitlist:', err)
      setError('Erreur lors du chargement de la liste d\'attente')
    }
  }

  const fetchStats = async () => {
    try {
      const today = new Date()
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      const [
        { count: totalWaiting },
        { count: todayWaiting },
        { count: tomorrowWaiting },
        { count: notifiedWaiting }
      ] = await Promise.all([
        supabase.from('class_waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('class_waitlist').select(`
          *,
          schedule:class_schedules!schedule_id (start_datetime)
        `, { count: 'exact', head: true })
          .gte('schedule.start_datetime', today.toISOString().split('T')[0])
          .lt('schedule.start_datetime', tomorrow.toISOString().split('T')[0]),
        supabase.from('class_waitlist').select(`
          *,
          schedule:class_schedules!schedule_id (start_datetime)
        `, { count: 'exact', head: true })
          .gte('schedule.start_datetime', tomorrow.toISOString().split('T')[0])
          .lt('schedule.start_datetime', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase.from('class_waitlist').select('*', { count: 'exact', head: true })
          .not('notified_at', 'is', null)
      ])

      setStats({
        total: totalWaiting || 0,
        today: todayWaiting || 0,
        tomorrow: tomorrowWaiting || 0,
        notified: notifiedWaiting || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group waitlist by class schedule
  const groupedWaitlist = waitlist.reduce((acc: any, item: any) => {
    const scheduleId = item.schedule?.id
    if (!scheduleId) return acc

    if (!acc[scheduleId]) {
      acc[scheduleId] = {
        schedule: item.schedule,
        entries: []
      }
    }
    acc[scheduleId].entries.push(item)
    return acc
  }, {})

  if (authLoading || loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Liste d'Attente</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement de la liste d'attente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liste d'Attente</h1>
          <p className="text-muted-foreground">
            Gérez les listes d'attente pour les cours complets
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Attente</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours Aujourd'hui</CardTitle>
            <IconCalendarEvent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours Demain</CardTitle>
            <IconCalendarEvent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tomorrow}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifiés</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist by Class */}
      {Object.keys(groupedWaitlist).length > 0 ? (
        <div className="space-y-6">
          {Object.values(groupedWaitlist).map((group: any) => (
            <Card key={group.schedule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.schedule.class.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(group.schedule.start_datetime)} • Coach: {group.schedule.class.coach}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {group.schedule.current_bookings}/{group.schedule.class.max_capacity} places
                    </Badge>
                    <Badge variant="secondary">
                      {group.entries.length} en attente
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <WaitlistTable waitlist={group.entries} showActions={true} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <IconClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune liste d'attente</h3>
            <p className="text-muted-foreground">
              Il n'y a actuellement personne en liste d'attente
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Waitlist Entries */}
      {waitlist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Toutes les Entrées en Liste d'Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <WaitlistTable waitlist={waitlist} showActions={true} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}