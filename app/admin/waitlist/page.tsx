import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WaitlistTable } from '@/components/admin/waitlist-table'
import { formatDateTime } from '@/lib/utils/date'
import { IconClock, IconCalendarEvent, IconCheck } from '@tabler/icons-react'

async function getWaitlistData() {
  const supabase = await createClient()

  const { data: waitlist, error } = await supabase
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

  if (error) {
    console.error('Error fetching waitlist:', error)
    return []
  }

  return waitlist || []
}

async function getWaitlistStats() {
  const supabase = await createClient()

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

  return {
    total: totalWaiting || 0,
    today: todayWaiting || 0,
    tomorrow: tomorrowWaiting || 0,
    notified: notifiedWaiting || 0
  }
}

export default async function WaitlistPage() {
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

  const [waitlist, stats] = await Promise.all([
    getWaitlistData(),
    getWaitlistStats()
  ])

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


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liste d'Attente</h1>
        <p className="text-muted-foreground">
          Gérez les listes d'attente pour les cours complets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Attente</CardTitle>
            <IconClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours Aujourd'hui</CardTitle>
            <IconCalendarEvent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours Demain</CardTitle>
            <IconCalendarEvent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.tomorrow}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifiés</CardTitle>
            <IconCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.notified}</div>
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