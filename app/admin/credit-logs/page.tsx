'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { IconHistory, IconRefresh, IconDownload, IconTrendingUp, IconTrendingDown, IconCoin, IconUser } from '@tabler/icons-react'
import { useAuth } from '@/hooks/use-auth'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { CreditLogsTable } from '@/components/admin/credit-logs-table'

interface CreditLogStats {
  totalChanges: number
  creditsAdded: number
  creditsRemoved: number
  uniqueUsers: number
}

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

export default function CreditLogsPage() {
  const [logs, setLogs] = useState<CreditLog[]>([])
  const [stats, setStats] = useState<CreditLogStats>({
    totalChanges: 0,
    creditsAdded: 0,
    creditsRemoved: 0,
    uniqueUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const fetchLogs = useCallback(async (showToast = false) => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('credit_change_logs')
        .select(`
          id,
          user_id,
          admin_id,
          subscription_id,
          previous_value,
          new_value,
          change_amount,
          subscription_type,
          field_modified,
          created_at,
          user_profile:profiles!user_id (
            full_name,
            email
          ),
          admin_profile:profiles!admin_id (
            full_name,
            email
          ),
          subscription:user_subscriptions!subscription_id (
            subscription_plans (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const logsData = (data || []) as unknown as CreditLog[]
      setLogs(logsData)

      // Calculate stats
      const uniqueUserIds = new Set(logsData.map(log => log.user_id))
      const creditsAdded = logsData
        .filter(log => log.change_amount > 0)
        .reduce((sum, log) => sum + log.change_amount, 0)
      const creditsRemoved = Math.abs(
        logsData
          .filter(log => log.change_amount < 0)
          .reduce((sum, log) => sum + log.change_amount, 0)
      )

      setStats({
        totalChanges: logsData.length,
        creditsAdded,
        creditsRemoved,
        uniqueUsers: uniqueUserIds.size
      })

      if (showToast) {
        toast.success('Historique actualisé')
      }
    } catch (err) {
      console.error('Error fetching credit logs:', err)
      setError('Erreur lors du chargement de l\'historique des crédits')
      toast.error('Erreur lors du chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }, [supabase])

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

      await fetchLogs()
    } catch (err) {
      console.error('Error checking admin access:', err)
      router.push('/')
    }
  }, [user, router, supabase, fetchLogs])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    checkAdminAccess()
  }, [user, authLoading, router, checkAdminAccess])

  const handleRefresh = () => {
    fetchLogs(true)
  }

  const handleExport = () => {
    try {
      const exportData = logs.map(log => ({
        'Date': format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
        'Utilisateur': log.user_profile?.full_name || 'Inconnu',
        'Email utilisateur': log.user_profile?.email || '',
        'Modifié par': log.admin_profile?.full_name || 'Inconnu',
        'Email admin': log.admin_profile?.email || '',
        'Abonnement': log.subscription?.subscription_plans?.name || 'N/A',
        'Type': log.subscription_type === 'abonnement' ? 'Utilisation hebdo.' : 'Crédits restants',
        'Valeur précédente': log.previous_value,
        'Nouvelle valeur': log.new_value,
        'Changement': log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Historique Crédits')

      const fileName = `historique-credits-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success('Export réussi')
    } catch (err) {
      console.error('Error exporting:', err)
      toast.error('Erreur lors de l\'export')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Historique des crédits</h1>
          <p className="text-muted-foreground">Suivi des modifications de crédits effectuées par les administrateurs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={logs.length === 0}>
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modifications</CardTitle>
            <IconHistory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChanges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits Ajoutés</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{stats.creditsAdded}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits Retirés</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">-{stats.creditsRemoved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Concernés</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconCoin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune modification de crédit enregistrée</p>
            </div>
          ) : (
            <CreditLogsTable logs={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
