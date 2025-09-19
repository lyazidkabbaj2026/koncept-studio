'use client'

import { useState, useEffect } from 'react'
import { whatsappService } from '@/lib/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconMessage, IconUser, IconPhone, IconCalendar, IconRefresh, IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Database } from '@/lib/database.types'

type WhatsAppLog = Database['public']['Tables']['whatsapp_logs']['Row'] & {
  profiles: { full_name: string | null; email: string } | null
}

interface WhatsAppStats {
  total: number
  success: number
  failed: number
  pending: number
}

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [stats, setStats] = useState<WhatsAppStats>({ total: 0, success: 0, failed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await whatsappService.getLogs({
        eventType: eventTypeFilter !== 'all' ? eventTypeFilter as any : undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        limit: pageSize,
        offset: currentPage * pageSize
      })

      setLogs(result.logs)
      setTotalCount(result.count)

      // Calculate stats from all results (not just current page)
      const allResult = await whatsappService.getLogs()
      const allLogs = allResult.logs

      setStats({
        total: allLogs.length,
        success: allLogs.filter(log => log.status === 'success').length,
        failed: allLogs.filter(log => log.status === 'failed').length,
        pending: allLogs.filter(log => log.status === 'pending').length
      })
    } catch (err) {
      console.error('Error fetching WhatsApp logs:', err)
      setError('Erreur lors du chargement des logs WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeFilter, statusFilter, currentPage])

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'signup': return 'Inscription'
      case 'activation': return 'Activation'
      case 'waitlist_promotion': return 'Promotion liste d\'attente'
      case 'class_cancellation': return 'Annulation de cours'
      default: return eventType
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <IconCircleCheck className="h-4 w-4 text-foreground" />
      case 'failed':
        return <IconCircleX className="h-4 w-4 text-destructive" />
      case 'pending':
        return <IconClock className="h-4 w-4 text-muted-foreground" />
      default:
        return <IconClock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-muted text-foreground'
      case 'failed': return 'bg-destructive/10 text-destructive'
      case 'pending': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'signup': return 'bg-accent/20 text-accent-foreground'
      case 'activation': return 'bg-muted text-foreground'
      case 'waitlist_promotion': return 'bg-secondary text-secondary-foreground'
      case 'class_cancellation': return 'bg-destructive/10 text-destructive'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && logs.length === 0) {
    return (
      <div className="flex-1 space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Logs</h1>
            <p className="text-muted-foreground mt-2">
              Historique des notifications WhatsApp envoyées
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Logs</h1>
          <p className="text-muted-foreground mt-2">
            Historique des notifications WhatsApp envoyées
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Messages envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <IconCircleCheck className="h-4 w-4 text-foreground" />
              Succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.success}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <IconCircleX className="h-4 w-4 text-foreground" />
              Échecs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <IconClock className="h-4 w-4 text-muted-foreground" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Type d'événement</label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="signup">Inscription</SelectItem>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="waitlist_promotion">Promotion liste d'attente</SelectItem>
                <SelectItem value="class_cancellation">Annulation de cours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Statut</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <IconMessage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun log WhatsApp</h3>
            <p className="text-muted-foreground">
              Aucun message WhatsApp trouvé avec les filtres sélectionnés.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getEventTypeColor(log.event_type)}>
                        {getEventTypeLabel(log.event_type)}
                      </Badge>
                      <Badge className={getStatusColor(log.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(log.status)}
                          {log.status}
                        </div>
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <IconCalendar className="h-3 w-3" />
                        {format(new Date(log.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {log.profiles?.full_name || 'Utilisateur inconnu'} ({log.profiles?.email || 'Email inconnu'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.phone_number}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="font-medium mb-2">Message envoyé:</div>
                      <div className="bg-muted rounded p-3 whitespace-pre-wrap text-xs">
                        {log.message_content}
                      </div>
                    </div>

                    {log.error_message && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded">
                        <div className="font-medium text-destructive text-sm mb-1">Erreur:</div>
                        <div className="text-destructive text-xs">{log.error_message}</div>
                      </div>
                    )}

                    {log.twilio_message_sid && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Twilio SID: {log.twilio_message_sid}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages} ({totalCount} résultats)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}