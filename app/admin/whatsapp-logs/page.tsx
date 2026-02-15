'use client'

import { useState, useEffect } from 'react'
import { whatsappService } from '@/lib/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconMessage, IconUser, IconPhone, IconCalendar, IconRefresh, IconCircleCheck, IconCircleX, IconClock, IconSend, IconTrash, IconChevronLeft, IconChevronRight, IconAlertTriangle, IconChevronRight as IconChevronDown } from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Database } from '@/lib/database.types'

type WhatsAppLog = Database['public']['Tables']['whatsapp_logs']['Row'] & {
  profiles: { full_name: string | null; email: string } | null
}

interface WhatsAppStats {
  total: number
  success: number
  failed: number
}

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [stats, setStats] = useState<WhatsAppStats>({ total: 0, success: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
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
        failed: allLogs.filter(log => log.status === 'failed').length
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

  const handleResendMessage = async (logId: string) => {
    try {
      setResendingIds(prev => new Set([...prev, logId]))

      const result = await whatsappService.resendMessage(logId)

      if (result.success) {
        toast.success('Message renvoyé avec succès')
        // Refresh logs to show updated status
        await fetchLogs()
      } else {
        toast.error(`Erreur lors du renvoi: ${result.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors du renvoi du message')
    } finally {
      setResendingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(logId)
        return newSet
      })
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce log ? Cette action est irréversible.')) {
      return
    }

    try {
      setDeletingIds(prev => new Set([...prev, logId]))

      const result = await whatsappService.deleteLog(logId)

      if (result.success) {
        toast.success('Log supprimé avec succès')
        // Refresh logs to remove deleted item
        await fetchLogs()
      } else {
        toast.error(`Erreur lors de la suppression: ${result.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du log')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(logId)
        return newSet
      })
    }
  }

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'signup': return 'Inscription'
      case 'activation': return 'Activation'
      case 'waitlist_promotion': return 'Promotion liste d\'attente'
      case 'class_cancellation': return 'Annulation de cours'
      case 'subscription_request': return 'Demande d\'abonnement'
      default: return eventType
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <IconCircleCheck className="h-4 w-4 text-foreground" />
      case 'failed':
        return <IconCircleX className="h-4 w-4 text-foreground" />
      default:
        return <IconCircleX className="h-4 w-4 text-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-foreground text-background border-foreground'
      case 'failed': return 'bg-background text-foreground border-foreground'
      default: return 'bg-background text-foreground border-foreground'
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'signup': return 'bg-foreground text-background border-foreground'
      case 'activation': return 'bg-foreground text-background border-foreground'
      case 'waitlist_promotion': return 'bg-muted text-foreground border-muted'
      case 'class_cancellation': return 'bg-background text-foreground border-foreground'
      case 'subscription_request': return 'bg-muted text-foreground border-muted'
      default: return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">WhatsApp Logs</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Historique des notifications WhatsApp envoyées
              </p>
            </div>
          </div>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconRefresh className="h-4 w-4 animate-spin" />
                <p className="text-sm">Chargement des logs...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">WhatsApp Logs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Historique des notifications WhatsApp envoyées
            </p>
          </div>
          <Button
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-border hover:bg-muted"
          >
            <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-border bg-card">
            <IconCircleX className="h-4 w-4" />
            <AlertDescription className="text-foreground">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border bg-card hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <IconMessage className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Messages envoyés</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Succès</p>
                  <p className="text-2xl font-bold text-foreground">{stats.success}</p>
                </div>
                <IconCircleCheck className="h-8 w-8 text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Échecs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
                </div>
                <IconCircleX className="h-8 w-8 text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-foreground">Type d'événement</label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-full border-border bg-background hover:bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="signup">Inscription</SelectItem>
                    <SelectItem value="activation">Activation</SelectItem>
                    <SelectItem value="waitlist_promotion">Promotion liste d'attente</SelectItem>
                    <SelectItem value="class_cancellation">Annulation de cours</SelectItem>
                    <SelectItem value="subscription_request">Demande d'abonnement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 flex-1 sm:flex-initial sm:min-w-[140px]">
                <label className="text-sm font-medium text-foreground">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full border-border bg-background hover:bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failed">Échec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Logs List */}
      {logs.length === 0 ? (
        <Card className="border-border bg-background">
          <CardContent className="text-center py-12">
            <IconMessage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun log WhatsApp</h3>
            <p className="text-muted-foreground">
              Aucun message WhatsApp trouvé avec les filtres sélectionnés.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const borderClass = log.status === 'success'
              ? 'border-l-4 border-l-foreground'
              : log.status === 'failed'
              ? 'border-l-4 border-l-border'
              : 'border-l-4 border-l-muted-foreground'

            return (
              <Card key={log.id} className={`${borderClass} border-border bg-background hover:bg-muted/50 transition-colors`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Status and Timestamp */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge className={getEventTypeColor(log.event_type)} variant="outline">
                          {getEventTypeLabel(log.event_type)}
                        </Badge>
                        <Badge className={getStatusColor(log.status)} variant="outline">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconCalendar className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {format(new Date(log.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </span>
                          <span className="sm:hidden">
                            {format(new Date(log.created_at), 'dd/MM à HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {/* User and Phone Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <IconUser className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {log.profiles?.full_name || 'Utilisateur inconnu'}
                            </div>
                            <div className="text-muted-foreground text-xs truncate">
                              {log.profiles?.email || 'Email inconnu'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconPhone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground font-mono text-sm">{log.phone_number}</span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="space-y-2">
                        <div className="font-medium text-foreground text-sm">Message envoyé:</div>
                        <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs font-mono whitespace-pre-wrap text-foreground">
                          {log.message_content}
                        </div>
                      </div>

                      {/* Error Message */}
                      {log.error_message && (
                        <div className="p-3 bg-background border border-border rounded-lg">
                          <div className="font-medium text-foreground text-sm mb-1 flex items-center gap-2">
                            <IconAlertTriangle className="h-4 w-4" />
                            Erreur:
                          </div>
                          <div className="text-muted-foreground text-xs font-mono">{log.error_message}</div>
                        </div>
                      )}

                      {/* Message ID */}
                      {log.wasender_message_id && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Message ID: {log.wasender_message_id}
                        </div>
                      )}

                      {/* API Response */}
                      {log.api_response && (
                        <details className="group">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 transition-colors">
                            <IconChevronDown className="h-3 w-3 group-open:rotate-90 transition-transform" />
                            Réponse API
                          </summary>
                          <div className="mt-2 p-3 bg-muted/50 border border-border rounded-lg text-xs font-mono text-foreground">
                            {log.api_response}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex flex-row sm:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendMessage(log.id)}
                        disabled={resendingIds.has(log.id) || deletingIds.has(log.id)}
                        className="flex-1 sm:flex-initial gap-2 border-border hover:bg-foreground hover:text-background transition-colors"
                      >
                        <IconSend className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {resendingIds.has(log.id) ? 'Envoi...' : 'Renvoyer'}
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingIds.has(log.id) || resendingIds.has(log.id)}
                        className="flex-1 sm:flex-initial gap-2 border-border hover:bg-foreground hover:text-background transition-colors"
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {deletingIds.has(log.id) ? 'Suppression...' : 'Supprimer'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-border bg-background">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Page {currentPage + 1} sur {totalPages} ({totalCount} résultats)
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="border-border hover:bg-foreground hover:text-background transition-colors"
                >
                  <IconChevronLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Précédent</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="border-border hover:bg-foreground hover:text-background transition-colors"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <IconChevronRight className="h-4 w-4 sm:ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}