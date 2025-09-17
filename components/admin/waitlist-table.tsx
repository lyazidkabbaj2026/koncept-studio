'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { formatDateTime } from '@/lib/utils/date'
import { IconUser, IconClock, IconCalendarEvent, IconArrowUp, IconArrowDown, IconCheck, IconX } from '@tabler/icons-react'
import { promoteFromWaitlist } from '@/app/admin/waitlist/actions'
import { toast } from 'sonner'

interface WaitlistTableProps {
  waitlist: any[]
  showActions?: boolean
}

export function WaitlistTable({ waitlist, showActions = true }: WaitlistTableProps) {
  const [promotingId, setPromotingId] = useState<string | null>(null)

  const handlePromote = async (entryId: string) => {
    setPromotingId(entryId)
    try {
      const result = await promoteFromWaitlist(entryId)
      if (result.success) {
        toast.success('Utilisateur promu avec succès !')
        // Refresh the data - this should be handled by the parent component
        window.location.reload()
      } else {
        toast.error(result.error || 'Erreur lors de la promotion')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('Une erreur inattendue s\'est produite')
    } finally {
      setPromotingId(null)
    }
  }
  const columns = [
    {
      key: 'position' as const,
      header: 'Position',
      cell: (entry: any) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
            #{entry.position}
          </Badge>
        </div>
      )
    },
    {
      key: 'user' as const,
      header: 'Utilisateur',
      cell: (entry: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <IconUser className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{entry.user?.full_name}</div>
            <div className="text-sm text-muted-foreground">{entry.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'class' as const,
      header: 'Cours',
      cell: (entry: any) => (
        <div>
          <div className="font-medium">{entry.schedule?.class?.title}</div>
          <div className="text-sm text-muted-foreground">
            <IconCalendarEvent className="inline w-3 h-3 mr-1" />
            {formatDateTime(entry.schedule?.start_datetime)}
          </div>
          <div className="text-sm text-muted-foreground">
            Coach: {entry.schedule?.class?.coach}
          </div>
        </div>
      )
    },
    {
      key: 'capacity_status' as const,
      header: 'Capacité',
      cell: (entry: any) => {
        const current = entry.schedule?.current_bookings || 0
        const max = entry.schedule?.class?.max_capacity || 0
        const isFull = current >= max

        return (
          <div className="flex items-center gap-2">
            <Badge variant={isFull ? 'destructive' : 'secondary'}>
              {current}/{max}
            </Badge>
            {isFull && <span className="text-sm text-muted-foreground">Complet</span>}
          </div>
        )
      }
    },
    {
      key: 'joined_at' as const,
      header: 'Inscrit le',
      cell: (entry: any) => (
        <div className="flex items-center gap-2">
          <IconClock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{formatDateTime(entry.joined_at)}</span>
        </div>
      )
    },
    {
      key: 'notification_status' as const,
      header: 'Notification',
      cell: (entry: any) => (
        <div>
          {entry.notified_at ? (
            <Badge variant="secondary">
              <IconCheck className="w-3 h-3 mr-1" />
              Notifié
            </Badge>
          ) : (
            <Badge variant="outline">
              En attente
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'subscription' as const,
      header: 'Abonnement',
      cell: (entry: any) => (
        <Badge variant="secondary">
          {entry.subscription?.plan?.name}
        </Badge>
      )
    }
  ]

  if (showActions) {
    columns.push({
      key: 'actions' as any,
      header: 'Actions',
      cell: (entry: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Implement move up functionality
              console.log('Move up:', entry.id)
            }}
          >
            <IconArrowUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Implement move down functionality
              console.log('Move down:', entry.id)
            }}
          >
            <IconArrowDown className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePromote(entry.id)}
            disabled={promotingId === entry.id}
          >
            <IconCheck className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              // TODO: Implement remove functionality
              console.log('Remove:', entry.id)
            }}
          >
            <IconX className="w-4 h-4" />
          </Button>
        </div>
      )
    })
  }

  return (
    <DataTable
      data={waitlist}
      columns={columns}
      searchKey="user.full_name"
      searchPlaceholder="Rechercher par nom d'utilisateur..."
      keyExtractor={(entry) => entry.id}
      pageSize={10}
    />
  )
}