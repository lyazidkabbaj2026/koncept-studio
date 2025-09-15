'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/common/data-table'
import { formatDateTime } from '@/lib/utils/date'
import { IconUser, IconX, IconCalendarEvent } from '@tabler/icons-react'

interface CancellationsTableProps {
  cancellations: any[]
}

export function CancellationsTable({ cancellations }: CancellationsTableProps) {
  const columns = [
    {
      key: 'user' as const,
      header: 'Utilisateur',
      cell: (cancellation: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <IconUser className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="font-medium">{cancellation.user?.full_name}</div>
            <div className="text-sm text-muted-foreground">{cancellation.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'class' as const,
      header: 'Cours Annulé',
      cell: (cancellation: any) => (
        <div>
          <div className="font-medium">{cancellation.schedule?.class?.title}</div>
          <div className="text-sm text-muted-foreground">
            <IconCalendarEvent className="inline w-3 h-3 mr-1" />
            {formatDateTime(cancellation.schedule?.start_datetime)}
          </div>
          <div className="text-sm text-muted-foreground">
            Coach: {cancellation.schedule?.class?.coach}
          </div>
        </div>
      )
    },
    {
      key: 'cancelled_at' as const,
      header: 'Annulé le',
      cell: (cancellation: any) => (
        <div className="flex items-center gap-2">
          <IconX className="w-4 h-4 text-red-600" />
          <span>{formatDateTime(cancellation.cancelled_at)}</span>
        </div>
      )
    },
    {
      key: 'cancellation_reason' as const,
      header: 'Raison',
      cell: (cancellation: any) => (
        <div>
          {cancellation.cancellation_reason ? (
            <Badge variant="outline" className="text-red-600 border-red-200">
              {cancellation.cancellation_reason}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Aucune raison</span>
          )}
        </div>
      )
    },
    {
      key: 'subscription' as const,
      header: 'Abonnement',
      cell: (cancellation: any) => (
        <Badge variant="secondary">
          {cancellation.subscription?.plan?.name}
        </Badge>
      )
    },
    {
      key: 'timing' as const,
      header: 'Délai',
      cell: (cancellation: any) => {
        if (!cancellation.cancelled_at || !cancellation.schedule?.start_datetime) {
          return <span className="text-muted-foreground">-</span>
        }

        const cancelTime = new Date(cancellation.cancelled_at)
        const classTime = new Date(cancellation.schedule.start_datetime)
        const hoursDiff = Math.floor((classTime.getTime() - cancelTime.getTime()) / (1000 * 60 * 60))

        let variant: 'default' | 'destructive' | 'secondary' = 'default'
        let label = ''

        if (hoursDiff < 0) {
          label = 'Après le cours'
          variant = 'destructive'
        } else if (hoursDiff < 24) {
          label = `${hoursDiff}h avant`
          variant = 'destructive'
        } else {
          label = `${Math.floor(hoursDiff / 24)}j avant`
          variant = 'default'
        }

        return <Badge variant={variant}>{label}</Badge>
      }
    }
  ]

  return (
    <DataTable
      data={cancellations}
      columns={columns}
      searchKey="user.full_name"
      searchPlaceholder="Rechercher par nom d'utilisateur..."
      keyExtractor={(cancellation) => cancellation.id}
    />
  )
}