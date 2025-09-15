import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CancellationsTable } from '@/components/admin/cancellations-table'
import { IconX, IconClock, IconTrendingDown } from '@tabler/icons-react'

async function getCancellationsData() {
  const supabase = await createClient()

  const { data: cancellations, error } = await supabase
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
    .eq('status', 'cancelled')
    .order('cancelled_at', { ascending: false })

  if (error) {
    console.error('Error fetching cancellations:', error)
    return []
  }

  return cancellations || []
}

async function getCancellationStats() {
  const supabase = await createClient()

  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    { count: totalCancellations },
    { count: todayCancellations },
    { count: weekCancellations },
    { count: monthCancellations }
  ] = await Promise.all([
    supabase.from('class_bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('class_bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('cancelled_at', today.toISOString().split('T')[0]),
    supabase.from('class_bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('cancelled_at', weekAgo.toISOString()),
    supabase.from('class_bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('cancelled_at', monthAgo.toISOString())
  ])

  return {
    total: totalCancellations || 0,
    today: todayCancellations || 0,
    week: weekCancellations || 0,
    month: monthCancellations || 0
  }
}

async function getCancellationReasons() {
  const supabase = await createClient()

  const { data: reasons, error } = await supabase
    .from('class_bookings')
    .select('cancellation_reason')
    .eq('status', 'cancelled')
    .not('cancellation_reason', 'is', null)

  if (error) {
    console.error('Error fetching cancellation reasons:', error)
    return {}
  }

  const reasonCounts: Record<string, number> = {}
  reasons?.forEach(item => {
    if (item.cancellation_reason) {
      reasonCounts[item.cancellation_reason] = (reasonCounts[item.cancellation_reason] || 0) + 1
    }
  })

  return reasonCounts
}

export default async function CancellationsPage() {
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

  const [cancellations, stats, reasons] = await Promise.all([
    getCancellationsData(),
    getCancellationStats(),
    getCancellationReasons()
  ])


  const topReasons = Object.entries(reasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Annulations</h1>
        <p className="text-muted-foreground">
          Suivi des annulations de réservations et analyse des tendances
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annulations</CardTitle>
            <IconX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <IconClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.week}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.month}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Cancellation Reasons */}
      {topReasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principales Raisons d'Annulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReasons.map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between">
                  <span className="text-sm">{reason}</span>
                  <Badge variant="outline">{count} fois</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Annulations</CardTitle>
        </CardHeader>
        <CardContent>
          <CancellationsTable cancellations={cancellations} />
        </CardContent>
      </Card>
    </div>
  )
}