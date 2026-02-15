'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/common/data-table'
import { formatDateTime } from '@/lib/utils/date'
import { IconUser, IconArrowUp, IconArrowDown, IconCoin } from '@tabler/icons-react'

interface CreditLog {
  id: string
  user_id: string
  admin_id: string
  subscription_id: string
  previous_value: number
  new_value: number
  change_amount: number
  subscription_type: string
  field_modified: string
  created_at: string
  user_profile?: {
    full_name: string
    email: string
  }
  admin_profile?: {
    full_name: string
    email: string
  }
  subscription?: {
    subscription_plans?: {
      name: string
    }
  }
}

interface CreditLogsTableProps {
  logs: CreditLog[]
}

export function CreditLogsTable({ logs }: CreditLogsTableProps) {
  const columns = [
    {
      key: 'created_at' as const,
      header: 'Date',
      cell: (log: CreditLog) => (
        <div className="text-sm">
          {formatDateTime(log.created_at)}
        </div>
      )
    },
    {
      key: 'user' as const,
      header: 'Utilisateur',
      cell: (log: CreditLog) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <IconUser className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{log.user_profile?.full_name || 'Utilisateur inconnu'}</div>
            <div className="text-sm text-muted-foreground">{log.user_profile?.email || ''}</div>
          </div>
        </div>
      )
    },
    {
      key: 'admin' as const,
      header: 'Modifié par',
      cell: (log: CreditLog) => (
        <div>
          <div className="font-medium text-sm">{log.admin_profile?.full_name || 'Admin inconnu'}</div>
          <div className="text-xs text-muted-foreground">{log.admin_profile?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'subscription_plan' as const,
      header: 'Abonnement',
      cell: (log: CreditLog) => (
        <div>
          <Badge variant="outline" className="mb-1">
            {log.subscription?.subscription_plans?.name || 'N/A'}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {log.subscription_type === 'abonnement' ? 'Utilisation hebdo.' : 'Crédits restants'}
          </div>
        </div>
      )
    },
    {
      key: 'from' as const,
      header: 'De',
      cell: (log: CreditLog) => (
        <div className="flex items-center gap-1">
          <IconCoin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{log.previous_value}</span>
        </div>
      )
    },
    {
      key: 'to' as const,
      header: 'À',
      cell: (log: CreditLog) => (
        <div className="flex items-center gap-1">
          <IconCoin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{log.new_value}</span>
        </div>
      )
    },
    {
      key: 'delta' as const,
      header: 'Delta',
      cell: (log: CreditLog) => {
        const isPositive = log.change_amount > 0
        return (
          <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? (
              <IconArrowUp className="w-4 h-4" />
            ) : (
              <IconArrowDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{log.change_amount}</span>
          </div>
        )
      }
    }
  ]

  return (
    <DataTable
      data={logs}
      columns={columns}
      searchKey="user_profile.full_name"
      searchPlaceholder="Rechercher par nom d'utilisateur..."
      keyExtractor={(log) => log.id}
      emptyMessage="Aucun changement de crédit enregistré"
      className="border-0 shadow-none"
      pageSize={20}
    />
  )
}
