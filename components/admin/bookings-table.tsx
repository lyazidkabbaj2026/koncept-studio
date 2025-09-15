'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { formatDateTime } from '@/lib/utils/date'
import { getStatusBadge } from '@/lib/utils/status'
import { IconUser, IconX } from '@tabler/icons-react'

interface BookingsTableProps {
  bookings: any[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const columns = [
    {
      key: 'user' as const,
      header: 'Utilisateur',
      cell: (booking: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <IconUser className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{booking.user?.full_name}</div>
            <div className="text-sm text-muted-foreground">{booking.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'class' as const,
      header: 'Cours',
      cell: (booking: any) => (
        <div>
          <div className="font-medium">{booking.schedule?.class?.title}</div>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(booking.schedule?.start_datetime)}
          </div>
          <div className="text-sm text-muted-foreground">
            Coach: {booking.schedule?.class?.coach}
          </div>
        </div>
      )
    },
    {
      key: 'status' as const,
      header: 'Statut',
      cell: (booking: any) => getStatusBadge(booking.status, {
        confirmed: { label: 'Confirmé', variant: 'default' as const },
        cancelled: { label: 'Annulé', variant: 'destructive' as const },
        no_show: { label: 'Absent', variant: 'secondary' as const }
      })
    },
    {
      key: 'subscription' as const,
      header: 'Abonnement',
      cell: (booking: any) => (
        <Badge variant="outline">
          {booking.subscription?.plan?.name}
        </Badge>
      )
    },
    {
      key: 'booked_at' as const,
      header: 'Réservé le',
      cell: (booking: any) => formatDateTime(booking.booked_at)
    },
    {
      key: 'actions' as const,
      header: 'Actions',
      cell: (booking: any) => (
        <div className="flex items-center gap-2">
          {booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                // TODO: Implement cancel booking functionality
                console.log('Cancel booking:', booking.id)
              }}
            >
              <IconX className="w-4 h-4 mr-1" />
              Annuler
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <DataTable
      data={bookings}
      columns={columns}
      searchKey="user.full_name"
      searchPlaceholder="Rechercher par nom d'utilisateur..."
      keyExtractor={(booking) => booking.id}
    />
  )
}