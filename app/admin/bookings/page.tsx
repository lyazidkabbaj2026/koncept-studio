'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookingsTable } from '@/components/admin/bookings-table'
import { IconCalendarStats, IconClock, IconX } from '@tabler/icons-react'
import { useAuth } from '@/hooks/use-auth'

interface BookingStats {
  total: number
  confirmed: number
  cancelled: number
  today: number
}

interface Booking {
  id: string
  status: string
  booked_at: string
  cancelled_at: string | null
  cancellation_reason: string | null
  profiles: {
    id: string
    full_name: string
    email: string
    phone: string | null
  }
  class_schedules: {
    id: string
    start_datetime: string
    end_datetime: string
    classes: {
      title: string
      coach: string
      location: string
    }
  }
  user_subscriptions?: {
    id: string
    subscription_plans: {
      name: string
    }
  } | null
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats>({ total: 0, confirmed: 0, cancelled: 0, today: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is admin
    checkAdminAccess()
  }, [user, authLoading, router])

  const checkAdminAccess = async () => {
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

      // User is admin, fetch data
      await Promise.all([fetchBookings(), fetchStats()])
    } catch (err) {
      console.error('Error checking admin access:', err)
      router.push('/')
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          id,
          status,
          booked_at,
          cancelled_at,
          cancellation_reason,
          profiles!user_id (
            id,
            full_name,
            email,
            phone
          ),
          class_schedules!schedule_id (
            id,
            start_datetime,
            end_datetime,
            classes!class_id (
              title,
              coach,
              location
            )
          ),
          user_subscriptions!subscription_id (
            id,
            subscription_plans!plan_id (
              name
            )
          )
        `)
        .order('booked_at', { ascending: false })

      if (error) throw error
      setBookings((data || []) as unknown as Booking[])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Erreur lors du chargement des réservations')
    }
  }

  const fetchStats = async () => {
    try {
      const [
        { count: totalBookings },
        { count: confirmedBookings },
        { count: cancelledBookings },
        { count: todayBookings }
      ] = await Promise.all([
        supabase.from('class_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('class_bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('class_bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('class_bookings').select('*', { count: 'exact', head: true })
          .gte('booked_at', new Date().toISOString().split('T')[0])
      ])

      setStats({
        total: totalBookings || 0,
        confirmed: confirmedBookings || 0,
        cancelled: cancelledBookings || 0,
        today: todayBookings || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex-1 space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Réservations</h1>
            <p className="text-muted-foreground mt-2">
              Gérez toutes les réservations de cours des membres
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des réservations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Réservations</h1>
          <p className="text-muted-foreground mt-2">
            Gérez toutes les réservations de cours des membres
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
            <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
            <IconCalendarStats className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            <IconX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <IconCalendarStats className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Réservations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <BookingsTable bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  )
}