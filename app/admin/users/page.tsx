'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconUserCheck, IconMessage, IconCreditCard, IconUsers, IconUserPlus, IconPhone, IconUserMinus, IconChevronLeft, IconChevronRight, IconSearch, IconX } from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { formatDesiredPlansDisplay, getDesiredPlansTooltip } from '@/lib/utils/plan-utils'
import { assignSubscriptionToUser } from './actions'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  desired_plan?: string
  subscription_status: 'pending' | 'active' | 'inactive' | 'expired'
  created_at: string
  active_subscription?: {
    id: string
    status: string
    credits_remaining: number
    credits_used?: number
    weekly_credits_used?: number
    start_date?: string
    end_date: string
    plan_name: string
    plan_type?: string
    plan_price?: number
    weekly_limit?: number
  } | null
}

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number | null
  price_dhs: number
  validity_months: number | null
  validity_days?: number | null
  weekly_limit?: number | null
}

interface SubscriptionFormData {
  plan_id: string
  start_date: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [showSubscriptionDetailsDialog, setShowSubscriptionDetailsDialog] = useState(false)
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormData>({
    plan_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd')
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [displayUsers, setDisplayUsers] = useState<User[]>([])
  const [filteredTotalCount, setFilteredTotalCount] = useState(0)

  const supabase = createClient()

  const applyFilters = (usersData: User[], page = 0) => {
    let filtered = [...usersData]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        formatDesiredPlansDisplay(user.desired_plan || null)?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_status === statusFilter)
    }

    setFilteredUsers(filtered)
    setFilteredTotalCount(filtered.length)

    // Apply pagination
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const paginatedUsers = filtered.slice(startIndex, endIndex)

    setUsers(paginatedUsers)
    setDisplayUsers(paginatedUsers)
    setCurrentPage(page)
  }

  const fetchUsers = async (page = 0) => {
    try {
      setLoading(true)
      // Fetch all users for client-side filtering
      const { data, error } = await supabase.rpc('get_admin_users_data', {
        page_offset: 0,
        page_limit: 1000 // Fetch a large number to get all users
      })

      if (error) throw error

      if (data) {
        setAllUsers(data.users || [])
        setTotalCount(data.total_count || 0)
        // Apply current filters
        applyFilters(data.users || [], page)
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(`Erreur lors du chargement des utilisateurs: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, type, credits, price_dhs, validity_months, validity_days, weekly_limit')
        .order('price_dhs', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err: any) {
      console.error('Error fetching plans:', err)
    }
  }

  // Effect for applying filters when search or status changes
  useEffect(() => {
    if (allUsers.length > 0) {
      applyFilters(allUsers, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchUsers(0)
    fetchPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const result = await assignSubscriptionToUser({
        userId: selectedUser.id,
        planId: subscriptionForm.plan_id,
        startDate: subscriptionForm.start_date
      })

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'attribution de l\'abonnement')
      }

      await fetchUsers(0)
      setShowSubscriptionDialog(false)
      setSelectedUser(null)
      setSubscriptionForm({
        plan_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd')
      })

      toast.success(`Abonnement assigné à ${selectedUser.full_name}`)
    } catch (err: any) {
      console.error('Error assigning subscription:', err)
      toast.error(`Erreur lors de l'assignation: ${err?.message || 'Erreur inconnue'}`)
    }
  }

  const handleDeactivateUser = async (userId: string, userName: string) => {
    try {
      // Update user status to inactive
      const { error: userError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('id', userId)

      if (userError) throw userError

      // Cancel current subscription if exists
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (subscriptionError) throw subscriptionError

      await fetchUsers(0)
      toast.success(`Utilisateur ${userName} désactivé`)
    } catch (err: any) {
      console.error('Error deactivating user:', err)
      toast.error('Erreur lors de la désactivation')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      case 'active':
        return <Badge variant="secondary">Actif</Badge>
      case 'expired':
        return <Badge variant="secondary">Expiré</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStats = () => {
    // Use filtered users for stats calculation
    const dataSource = filteredUsers.length > 0 ? filteredUsers : allUsers
    const pendingCount = dataSource.filter(u => u.subscription_status === 'pending').length
    const activeCount = dataSource.filter(u => u.subscription_status === 'active').length
    const expiredCount = dataSource.filter(u => u.subscription_status === 'expired').length
    const inactiveCount = dataSource.filter(u => u.subscription_status === 'inactive').length

    return {
      pending: pendingCount,
      active: activeCount,
      expired: expiredCount,
      inactive: inactiveCount,
      total: dataSource.length,
      needsAttention: pendingCount
    }
  }

  const stats = getStats()
  const totalPages = Math.ceil(filteredTotalCount / pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      applyFilters(allUsers, newPage)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex-1 space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground mt-2">
              Gérer tous les utilisateurs inscrits
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérer tous les utilisateurs inscrits
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <IconUserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">À contacter</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Avec abonnement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSearch className="h-4 w-4" />
            Recherche et filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone ou plan désiré..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
              >
                <IconX className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>

          {/* Results Summary */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {filteredTotalCount} utilisateur{filteredTotalCount !== 1 ? 's' : ''} trouvé{filteredTotalCount !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
                {statusFilter !== 'all' && ` avec le statut "${statusFilter}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              {(searchTerm || statusFilter !== 'all') ? 'Aucun résultat trouvé' : 'Aucun utilisateur trouvé'}
            </h3>
            <p className="text-muted-foreground">
              {(searchTerm || statusFilter !== 'all')
                ? 'Essayez de modifier vos critères de recherche ou de supprimer les filtres.'
                : 'Les utilisateurs apparaîtront ici une fois qu\'ils se seront inscrits.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4"
              >
                <IconX className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Plan Désiré</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.full_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <IconPhone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non renseigné</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm" title={getDesiredPlansTooltip(user.desired_plan || null)}>
                        {formatDesiredPlansDisplay(user.desired_plan || null)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.subscription_status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">

                        {user.subscription_status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowSubscriptionDialog(true)
                            }}
                          >
                            <IconCreditCard className="h-4 w-4 mr-1" />
                            Assigner abonnement
                          </Button>
                        )}
                        {user.subscription_status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowSubscriptionDetailsDialog(true)
                            }}
                          >
                            <IconCreditCard className="h-4 w-4 mr-1" />
                            Voir abonnement
                          </Button>
                        )}
                        {user.subscription_status === 'expired' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowSubscriptionDialog(true)
                              }}
                            >
                              <IconCreditCard className="h-4 w-4 mr-1" />
                              Assigner abonnement
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateUser(user.id, user.full_name)}
                            >
                              <IconUserMinus className="h-4 w-4 mr-1" />
                              Désactiver
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {(totalPages > 1 || (searchTerm || statusFilter !== 'all')) && filteredTotalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages} •
            Affichage de {Math.min(currentPage * pageSize + 1, filteredTotalCount)} à {Math.min((currentPage + 1) * pageSize, filteredTotalCount)} sur {filteredTotalCount} résultat{filteredTotalCount !== 1 ? 's' : ''}
            {(searchTerm || statusFilter !== 'all') && ` filtrés (${totalCount} au total)`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <IconChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Suivant
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Subscription Details Dialog */}
      <Dialog open={showSubscriptionDetailsDialog} onOpenChange={setShowSubscriptionDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'abonnement</DialogTitle>
          </DialogHeader>

          {selectedUser && selectedUser.active_subscription && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-foreground">Utilisateur</h4>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-sm font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  )}
                </div>
              </div>

              {/* Plan Details */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-foreground">Détails du plan</h4>
                <div className="bg-muted/20 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Plan</h5>
                      <p className="text-sm font-medium">{selectedUser.active_subscription.plan_name}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Statut</h5>
                      <Badge variant="secondary">
                        {selectedUser.active_subscription.status === 'active' ? 'Actif' :
                         selectedUser.active_subscription.status === 'expired' ? 'Expiré' :
                         selectedUser.active_subscription.status === 'cancelled' ? 'Annulé' :
                         selectedUser.active_subscription.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Date de début</h5>
                      <p className="text-sm">
                        {selectedUser.active_subscription.start_date
                          ? format(new Date(selectedUser.active_subscription.start_date), 'dd/MM/yyyy', { locale: fr })
                          : 'Non spécifiée'
                        }
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Date d'expiration</h5>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedUser.active_subscription.end_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-foreground">Utilisation des crédits</h4>
                <div className="bg-muted/20 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Restants</h5>
                      <p className="text-lg font-bold font-mono text-green-600 dark:text-green-400">
                        {selectedUser.active_subscription.credits_remaining}
                      </p>
                    </div>
                    <div className="text-center">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Utilisés</h5>
                      <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                        {selectedUser.active_subscription.credits_used || 0}
                      </p>
                    </div>
                    {selectedUser.active_subscription.weekly_limit && (
                      <div className="text-center">
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Cette semaine</h5>
                        <p className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400">
                          {selectedUser.active_subscription.weekly_credits_used || 0}/{selectedUser.active_subscription.weekly_limit}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedUser.active_subscription.plan_price && (
                    <div className="pt-2 border-t border-border">
                      <div className="text-center">
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Prix du plan</h5>
                        <p className="text-sm font-medium">{selectedUser.active_subscription.plan_price} DHS</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscriptionDetailsDialog(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDeactivateUser(selectedUser.id, selectedUser.full_name)
                    setShowSubscriptionDetailsDialog(false)
                  }}
                  className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  <IconUserMinus className="h-4 w-4 mr-2" />
                  Désactiver l'utilisateur
                </Button>
              </div>
            </div>
          )}

          {selectedUser && !selectedUser.active_subscription && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-foreground">Utilisateur</h4>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-sm font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  )}
                </div>
              </div>

              {/* No Subscription */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Aucun abonnement actif trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">Cet utilisateur n'a pas d'abonnement actif</p>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscriptionDetailsDialog(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Assignment Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner un Abonnement</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={handleAssignSubscription} className="space-y-4">
              <div>
                <p className="text-sm font-medium">
                  Utilisateur: {selectedUser.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_id">Plan d'abonnement</Label>
                <Select
                  value={subscriptionForm.plan_id}
                  onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, plan_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {plan.price_dhs} DHS
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={subscriptionForm.start_date}
                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>


              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Assigner l'abonnement
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}