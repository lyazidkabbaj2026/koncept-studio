'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { IconUserCheck, IconMessage, IconCreditCard, IconUsers, IconUserPlus, IconPhone, IconUserMinus, IconChevronLeft, IconChevronRight, IconSearch, IconX, IconSettings, IconPlus, IconTrash, IconEye, IconUserX } from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { formatDesiredPlansDisplay, parseDesiredPlans } from '@/lib/utils/plan-utils'
import { assignSubscriptionToUser } from './actions'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  desired_plan?: string
  has_subscription_request?: boolean
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
  weekly_limit?: number | null
}

interface SubscriptionFormData {
  plan_id: string
  start_date: string
}

interface UserSubscription {
  id: string
  plan_id: string
  plan_name: string
  plan_type: string
  plan_price: number
  credits_remaining: number
  credits_used: number
  weekly_credits_used: number
  weekly_limit: number | null
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
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
  const [showSubscriptionManagementDialog, setShowSubscriptionManagementDialog] = useState(false)
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
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
  const [planInformeFilter, setPlanInformeFilter] = useState('all')
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

    // Apply plan informé filter
    if (planInformeFilter !== 'all') {
      if (planInformeFilter === 'oui') {
        filtered = filtered.filter(user => user.has_subscription_request === true)
      } else if (planInformeFilter === 'non') {
        filtered = filtered.filter(user => user.has_subscription_request === false)
      }
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

      // Fetch all users (excluding admins)
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          desired_plan,
          subscription_status,
          created_at
        `)
        .eq('role', 'user')
        .order('created_at', { ascending: false })

      if (allUsersError) throw allUsersError

      // Fetch active subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          status,
          credits_remaining,
          credits_used,
          weekly_credits_used,
          start_date,
          end_date,
          subscription_plans (
            name,
            type,
            price_dhs,
            weekly_limit
          )
        `)
        .eq('status', 'active')

      if (subscriptionsError) throw subscriptionsError

      // Create a map of active subscriptions by user_id
      const subscriptionsMap = new Map()
      subscriptionsData?.forEach(sub => {
        subscriptionsMap.set(sub.user_id, sub)
      })

      // Get subscription request information for all users
      const allUserIds = (allUsersData || []).map(u => u.id)

      const { data: requestsData, error: requestsError } = await supabase
        .from('subscription_requests')
        .select('user_id')
        .in('user_id', allUserIds)
        .eq('is_active', true)

      if (requestsError) throw requestsError

      const usersWithRequests = new Set((requestsData || []).map(r => r.user_id))

      // Combine and format the data
      const formattedUsers: User[] = (allUsersData || []).map((user: any) => {
        const subscription = subscriptionsMap.get(user.id)

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          desired_plan: user.desired_plan,
          has_subscription_request: usersWithRequests.has(user.id),
          subscription_status: user.subscription_status,
          created_at: user.created_at,
          active_subscription: subscription ? {
            id: subscription.id,
            status: subscription.status,
            credits_remaining: subscription.credits_remaining,
            credits_used: subscription.credits_used,
            weekly_credits_used: subscription.weekly_credits_used,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            plan_name: subscription.subscription_plans?.name || 'Plan inconnu',
            plan_type: subscription.subscription_plans?.type,
            plan_price: subscription.subscription_plans?.price_dhs,
            weekly_limit: subscription.subscription_plans?.weekly_limit
          } : null
        }
      })

      setAllUsers(formattedUsers)
      setTotalCount(formattedUsers.length)
      // Apply current filters
      applyFilters(formattedUsers, page)
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
        .select('id, name, type, credits, price_dhs, validity_months, weekly_limit')
        .order('price_dhs', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err: any) {
      console.error('Error fetching plans:', err)
    }
  }

  const fetchUserSubscriptions = async (userId: string) => {
    try {
      setLoadingSubscriptions(true)
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            type,
            price_dhs,
            weekly_limit
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedSubscriptions: UserSubscription[] = (data || []).map((sub: any) => ({
        id: sub.id,
        plan_id: sub.plan_id,
        plan_name: sub.subscription_plans?.name || 'Plan inconnu',
        plan_type: sub.subscription_plans?.type || '',
        plan_price: sub.subscription_plans?.price_dhs || 0,
        credits_remaining: sub.credits_remaining || 0,
        credits_used: sub.credits_used || 0,
        weekly_credits_used: sub.weekly_credits_used || 0,
        weekly_limit: sub.subscription_plans?.weekly_limit || null,
        start_date: sub.start_date,
        end_date: sub.end_date,
        status: sub.status,
        created_at: sub.created_at
      }))

      setUserSubscriptions(formattedSubscriptions)
    } catch (err: any) {
      console.error('Error fetching user subscriptions:', err)
      toast.error('Erreur lors du chargement des abonnements')
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  // Effect for applying filters when search or status changes
  useEffect(() => {
    if (allUsers.length > 0) {
      applyFilters(allUsers, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, planInformeFilter])

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

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      if (error) throw error

      if (selectedUser) {
        await fetchUserSubscriptions(selectedUser.id)
        await fetchUsers(0)
      }

      toast.success('Abonnement annulé avec succès')
    } catch (err: any) {
      console.error('Error cancelling subscription:', err)
      toast.error('Erreur lors de l\'annulation de l\'abonnement')
    }
  }

  const handleAssignNewSubscription = async (e: React.FormEvent) => {
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

      // Refresh subscriptions and users data
      await fetchUserSubscriptions(selectedUser.id)
      await fetchUsers(0)

      // Reset form
      setSubscriptionForm({
        plan_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd')
      })

      toast.success(`Nouvel abonnement assigné à ${selectedUser.full_name}`)
    } catch (err: any) {
      console.error('Error assigning subscription:', err)
      toast.error(`Erreur lors de l'assignation: ${err?.message || 'Erreur inconnue'}`)
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
    const pendingUsers = dataSource.filter(u => u.subscription_status === 'pending')
    const pendingCount = pendingUsers.length
    const pendingWithRequests = pendingUsers.filter(u => u.has_subscription_request).length
    const pendingWithoutRequests = pendingUsers.filter(u => !u.has_subscription_request).length
    const activeCount = dataSource.filter(u => u.subscription_status === 'active').length
    const expiredCount = dataSource.filter(u => u.subscription_status === 'expired').length
    const inactiveCount = dataSource.filter(u => u.subscription_status === 'inactive').length

    return {
      pending: pendingCount,
      pendingWithRequests,
      pendingWithoutRequests,
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
    setPlanInformeFilter('all')
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <IconUserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            {stats.pending > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingWithRequests} informés • {stats.pendingWithoutRequests} non informés
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <IconUserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
                  placeholder="Rechercher par nom, email, téléphone ou plan informé..."
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
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan Informé Filter */}
            <div className="w-full sm:w-48">
              <Select value={planInformeFilter} onValueChange={setPlanInformeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan informé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous (Plan informé)</SelectItem>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all') && (
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
          {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all') && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {filteredTotalCount} utilisateur{filteredTotalCount !== 1 ? 's' : ''} trouvé{filteredTotalCount !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
                {statusFilter !== 'all' && ` avec le statut "${statusFilter}"`}
                {planInformeFilter !== 'all' && ` plan informé "${planInformeFilter}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all') ? 'Aucun résultat trouvé' : 'Aucun utilisateur trouvé'}
            </h3>
            <p className="text-muted-foreground">
              {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all')
                ? 'Essayez de modifier vos critères de recherche ou de supprimer les filtres.'
                : 'Les utilisateurs apparaîtront ici une fois qu\'ils se seront inscrits.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all') && (
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
                  <TableHead>Plan Informé</TableHead>
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
                      <div className="text-sm">
                        {user.has_subscription_request ? (
                          <Badge variant="secondary">Oui</Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            fetchUserSubscriptions(user.id)
                            setShowSubscriptionManagementDialog(true)
                          }}
                        >
                          <IconCreditCard className="h-4 w-4 mr-1" />
                          Gérer abonnement
                        </Button>
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
      {(totalPages > 1 || (searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all')) && filteredTotalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages} •
            Affichage de {Math.min(currentPage * pageSize + 1, filteredTotalCount)} à {Math.min((currentPage + 1) * pageSize, filteredTotalCount)} sur {filteredTotalCount} résultat{filteredTotalCount !== 1 ? 's' : ''}
            {(searchTerm || statusFilter !== 'all' || planInformeFilter !== 'all') && ` filtrés (${totalCount} au total)`}
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
                      <p className="text-lg font-bold font-mono text-foreground">
                        {selectedUser.active_subscription.credits_remaining}
                      </p>
                    </div>
                    <div className="text-center">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Utilisés</h5>
                      <p className="text-lg font-bold font-mono text-foreground">
                        {selectedUser.active_subscription.credits_used || 0}
                      </p>
                    </div>
                    {selectedUser.active_subscription.weekly_limit && (
                      <div className="text-center">
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Cette semaine</h5>
                        <p className="text-lg font-bold font-mono text-foreground">
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

      {/* Comprehensive Subscription Management Dialog */}
      <Dialog open={showSubscriptionManagementDialog} onOpenChange={setShowSubscriptionManagementDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              Gestion des abonnements
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <Card className="border-muted-foreground/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-foreground">{selectedUser.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      {selectedUser.phone && (
                        <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Statut</div>
                      {getStatusBadge(selectedUser.subscription_status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="subscriptions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
                  <TabsTrigger value="assign">Assigner nouveau</TabsTrigger>
                  <TabsTrigger value="user-actions">Actions utilisateur</TabsTrigger>
                </TabsList>

                {/* Current and Historical Subscriptions */}
                <TabsContent value="subscriptions" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">Abonnements</h3>
                    <Badge variant="secondary" className="text-xs">
                      {userSubscriptions.length} abonnement{userSubscriptions.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {loadingSubscriptions ? (
                    <Card className="border-muted-foreground/20">
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">Chargement des abonnements...</p>
                      </CardContent>
                    </Card>
                  ) : userSubscriptions.length === 0 ? (
                    <Card className="border-muted-foreground/20">
                      <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                          <IconCreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-semibold text-lg mb-2">Aucun abonnement trouvé</p>
                        <p className="text-sm text-muted-foreground">Assignez un premier abonnement à cet utilisateur</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {userSubscriptions.map((subscription) => (
                        <Card key={subscription.id} className={`border-2 ${
                          subscription.status === 'active'
                            ? 'border-primary/20 bg-primary/5'
                            : subscription.status === 'expired'
                            ? 'border-muted-foreground/20 bg-muted/20'
                            : 'border-muted-foreground/20 bg-muted/10'
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{subscription.plan_name}</CardTitle>
                                <p className="text-sm text-muted-foreground capitalize">{subscription.plan_type}</p>
                              </div>
                              <Badge
                                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                              >
                                {subscription.status === 'active' ? 'Actif' :
                                 subscription.status === 'expired' ? 'Expiré' : 'Annulé'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Usage Statistics */}
                            <div className={`grid gap-6 ${subscription.weekly_limit ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
                              <div className="text-center space-y-2">
                                <div className="text-2xl font-bold text-foreground">
                                  {subscription.credits_remaining}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Crédits restants</div>
                              </div>
                              <div className="text-center space-y-2">
                                <div className="text-2xl font-bold text-foreground">
                                  {subscription.credits_used}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Crédits utilisés</div>
                              </div>
                              {subscription.weekly_limit && (
                                <div className="text-center space-y-2">
                                  <div className="text-2xl font-bold text-foreground">
                                    {subscription.weekly_credits_used}/{subscription.weekly_limit}
                                  </div>
                                  <div className="text-xs font-medium text-muted-foreground">Cette semaine</div>
                                </div>
                              )}
                              <div className="text-center space-y-2">
                                <div className="text-2xl font-bold text-foreground">
                                  {subscription.plan_price} DH
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Prix</div>
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                              <div className="text-center space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Date de début</div>
                                <div className="text-sm font-semibold text-foreground">
                                  {format(new Date(subscription.start_date), 'dd MMM yyyy', { locale: fr })}
                                </div>
                              </div>
                              <div className="text-center space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Date d'expiration</div>
                                <div className="text-sm font-semibold text-foreground">
                                  {format(new Date(subscription.end_date), 'dd MMM yyyy', { locale: fr })}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {subscription.status === 'active' && (
                              <div className="flex justify-end pt-4 border-t border-border">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelSubscription(subscription.id)}
                                  className="text-muted-foreground hover:text-foreground hover:bg-muted/10"
                                >
                                  <IconTrash className="h-4 w-4 mr-2" />
                                  Supprimer
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Assign New Subscription */}
                <TabsContent value="assign" className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Assigner un nouvel abonnement</h3>

                  <Card className="border-muted-foreground/20">
                    <CardContent className="p-6">
                      <form onSubmit={handleAssignNewSubscription} className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="new_plan_id" className="text-sm font-medium text-foreground">Plan d'abonnement</Label>
                          <Select
                            value={subscriptionForm.plan_id}
                            onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, plan_id: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Sélectionner un plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{plan.name}</span>
                                    <span className="ml-3 text-sm text-muted-foreground">
                                      {plan.price_dhs} DH
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="new_start_date" className="text-sm font-medium text-foreground">Date de début</Label>
                          <Input
                            id="new_start_date"
                            type="date"
                            value={subscriptionForm.start_date}
                            onChange={(e) => setSubscriptionForm(prev => ({ ...prev, start_date: e.target.value }))}
                            required
                            className="h-12"
                          />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border">
                          <Button type="submit" disabled={!subscriptionForm.plan_id} className="h-12 px-6">
                            <IconPlus className="h-4 w-4 mr-2" />
                            Assigner l'abonnement
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* User Actions */}
                <TabsContent value="user-actions" className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Actions utilisateur</h3>

                  <Card className="border-muted-foreground/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-foreground flex items-center gap-3">
                        <IconUserMinus className="h-5 w-5" />
                        Désactiver l'utilisateur
                      </CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Cette action désactivera l'utilisateur et annulera tous ses abonnements actifs.
                        L'utilisateur ne pourra plus se connecter à son compte.
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleDeactivateUser(selectedUser.id, selectedUser.full_name)
                            setShowSubscriptionManagementDialog(false)
                          }}
                          className="border-foreground text-foreground hover:bg-foreground hover:text-background h-12 px-6"
                        >
                          <IconUserMinus className="h-4 w-4 mr-2" />
                          Désactiver définitivement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Footer Actions */}
              <div className="flex justify-end pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscriptionManagementDialog(false)}
                  className="h-12 px-6"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}