'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconUsers, IconRefresh, IconDownload, IconSearch, IconEye, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface Client {
  id: string
  email: string
  full_name: string
  phone?: string
  subscription_status: 'pending' | 'active' | 'inactive' | 'expired'
  active_subscriptions: ClientSubscription[]
  expired_subscriptions: ClientSubscription[]
}

interface ClientSubscription {
  id: string
  status: 'active' | 'expired' | 'cancelled'
  credits_remaining: number
  credits_used?: number
  start_date?: string
  end_date: string
  plan_name: string
  plan_type?: string
  plan_price?: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState('all')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10

  const supabase = createClient()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filterClients = useCallback(() => {
    let filtered = [...clients]

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim()
      filtered = filtered.filter(client =>
        client.full_name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)
      )
    }

    // Apply subscription type filter
    if (subscriptionTypeFilter !== 'all') {
      filtered = filtered.filter(client => {
        const allSubscriptions = [...client.active_subscriptions, ...client.expired_subscriptions]
        return allSubscriptions.some(sub => sub.plan_name === subscriptionTypeFilter)
      })
    }

    setFilteredClients(filtered)
    setCurrentPage(0)
  }, [clients, debouncedSearchTerm, subscriptionTypeFilter])

  useEffect(() => {
    filterClients()
  }, [filterClients])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch active users only
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          subscription_status
        `)
        .eq('role', 'user')
        .eq('subscription_status', 'active')
        .order('full_name', { ascending: true })

      if (usersError) throw usersError

      // Fetch all subscriptions for these users
      const userIds = usersData?.map(user => user.id) || []
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          status,
          credits_remaining,
          credits_used,
          start_date,
          end_date,
          subscription_plans (
            name,
            type,
            price_dhs
          )
        `)
        .in('user_id', userIds)
        .order('created_at', { ascending: false })

      if (subscriptionsError) throw subscriptionsError

      // Group subscriptions by user and status
      const clientsWithSubscriptions = usersData?.map(user => {
        const userSubscriptions = subscriptionsData?.filter(sub => sub.user_id === user.id) || []

        const activeSubscriptions = userSubscriptions
          .filter(sub => sub.status === 'active')
          .map(sub => ({
            id: sub.id,
            status: sub.status as 'active' | 'expired' | 'cancelled',
            credits_remaining: sub.credits_remaining || 0,
            credits_used: sub.credits_used || 0,
            start_date: sub.start_date,
            end_date: sub.end_date,
            plan_name: (sub.subscription_plans as any)?.name || 'Plan inconnu',
            plan_type: (sub.subscription_plans as any)?.type || '',
            plan_price: (sub.subscription_plans as any)?.price_dhs || 0
          }))

        const expiredSubscriptions = userSubscriptions
          .filter(sub => sub.status === 'expired')
          .map(sub => ({
            id: sub.id,
            status: sub.status as 'active' | 'expired' | 'cancelled',
            credits_remaining: sub.credits_remaining || 0,
            credits_used: sub.credits_used || 0,
            start_date: sub.start_date,
            end_date: sub.end_date,
            plan_name: (sub.subscription_plans as any)?.name || 'Plan inconnu',
            plan_type: (sub.subscription_plans as any)?.type || '',
            plan_price: (sub.subscription_plans as any)?.price_dhs || 0
          }))

        return {
          ...user,
          active_subscriptions: activeSubscriptions,
          expired_subscriptions: expiredSubscriptions
        }
      }) || []

      setClients(clientsWithSubscriptions)
      setFilteredClients(clientsWithSubscriptions)

    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Erreur lors du chargement des clients')
      toast.error('Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchClients()
    toast.success('Liste actualisée')
  }

  const handleExport = () => {
    try {
      const exportData = filteredClients.map(client => ({
        'Nom': client.full_name,
        'Email': client.email,
        'Téléphone': client.phone || '',
        'Abonnements Actifs': client.active_subscriptions.length,
        'Abonnements Expirés': client.expired_subscriptions.length,
        'Plans Actifs': client.active_subscriptions.map(sub => sub.plan_name).join(', '),
        'Crédits Restants': client.active_subscriptions.reduce((total, sub) => total + sub.credits_remaining, 0)
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Clients')

      const fileName = `clients-${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success('Export réussi')
    } catch (err) {
      console.error('Error exporting:', err)
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleViewSubscriptions = (client: Client) => {
    setSelectedClient(client)
    setShowSubscriptionDialog(true)
  }

  const getUniqueSubscriptionTypes = () => {
    const types = new Set<string>()
    clients.forEach(client => {
      [...client.active_subscriptions, ...client.expired_subscriptions].forEach(sub => {
        types.add(sub.plan_name)
      })
    })
    return Array.from(types).sort()
  }

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = filteredClients.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Chargement des clients...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gestion des clients actifs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={subscriptionTypeFilter} onValueChange={setSubscriptionTypeFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Type d'abonnement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {getUniqueSubscriptionTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {clients.length === 0 ? 'Aucun client trouvé' : 'Aucun client ne correspond aux critères de recherche'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                      <TableHead>Abonnements</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">{client.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {client.active_subscriptions.length > 0 && (
                              <Badge variant="default" className="text-xs">
                                {client.active_subscriptions.length} actif{client.active_subscriptions.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {client.expired_subscriptions.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {client.expired_subscriptions.length} expiré{client.expired_subscriptions.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubscriptions(client)}
                          >
                            <IconEye className="h-4 w-4 mr-2" />
                            Voir abonnement
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details Modal */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abonnements de {selectedClient?.full_name}</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Nom:</strong> {selectedClient.full_name}</div>
                  <div><strong>Email:</strong> {selectedClient.email}</div>
                  <div><strong>Téléphone:</strong> {selectedClient.phone || 'Non renseigné'}</div>
                </CardContent>
              </Card>

              {/* Active Subscriptions */}
              {selectedClient.active_subscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Abonnements actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedClient.active_subscriptions.map((subscription) => (
                        <div key={subscription.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{subscription.plan_name}</h4>
                            <Badge variant="default">Actif</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div><strong>Type:</strong> {subscription.plan_type || 'N/A'}</div>
                            <div><strong>Prix:</strong> {subscription.plan_price || 0} DH</div>
                            <div><strong>Crédits restants:</strong> {subscription.credits_remaining}</div>
                            <div><strong>Crédits utilisés:</strong> {subscription.credits_used || 0}</div>
                            <div><strong>Date de fin:</strong> {new Date(subscription.end_date).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Expired Subscriptions */}
              {selectedClient.expired_subscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-600">Abonnements expirés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedClient.expired_subscriptions.map((subscription) => (
                        <div key={subscription.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{subscription.plan_name}</h4>
                            <Badge variant="secondary">Expiré</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div><strong>Type:</strong> {subscription.plan_type || 'N/A'}</div>
                            <div><strong>Prix:</strong> {subscription.plan_price || 0} DH</div>
                            <div><strong>Crédits utilisés:</strong> {subscription.credits_used || 0}</div>
                            <div><strong>Date de fin:</strong> {new Date(subscription.end_date).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedClient.active_subscriptions.length === 0 && selectedClient.expired_subscriptions.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">Aucun abonnement trouvé pour ce client.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}