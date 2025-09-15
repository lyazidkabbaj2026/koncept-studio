import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingsTable } from '@/components/admin/bookings-table'
import { IconCalendarStats, IconClock, IconX } from '@tabler/icons-react'

async function getBookingsData() {
  const supabase = await createClient()

  const { data: bookings, error } = await supabase
    .from('class_bookings')
    .select(`
      id,
      status,
      booked_at,
      cancelled_at,
      cancellation_reason,
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
        class:classes!class_id (
          title,
          coach,
          location
        )
      ),
      subscription:user_subscriptions!subscription_id (
        id,
        plan:subscription_plans!plan_id (
          name
        )
      )
    `)
    .order('booked_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return bookings || []
}

async function getBookingsStats() {
  const supabase = await createClient()

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

  return {
    total: totalBookings || 0,
    confirmed: confirmedBookings || 0,
    cancelled: cancelledBookings || 0,
    today: todayBookings || 0
  }
}

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const [bookings, stats] = await Promise.all([
    getBookingsData(),
    getBookingsStats()
  ])


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        <p className="text-muted-foreground">
          Gérez toutes les réservations de cours des membres
        </p>
      </div>

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
            <IconClock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            <IconX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <IconCalendarStats className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  )
}