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
import { IconUserCheck, IconMessage, IconCreditCard, IconUsers, IconUserPlus, IconPhone, IconUserMinus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  desired_plan?: string
  subscription_status: 'pending' | 'contacted' | 'active' | 'inactive' | 'expired'
  created_at: string
  active_subscription?: {
    id: string
    status: string
    credits_remaining: number
    end_date: string
    plan_name: string
  } | null
}

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number
  price_dhs: number
  validity_months: number
  weekly_limit?: number
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
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormData>({
    plan_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd')
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 25

  const supabase = createClient()

  const fetchUsers = async (page = 0) => {
    try {
      setLoading(true)
      // Use optimized admin function instead of separate queries
      const { data, error } = await supabase.rpc('get_admin_users_data', {
        page_offset: page * pageSize,
        page_limit: pageSize
      })

      if (error) throw error

      if (data) {
        setUsers(data.users || [])
        setTotalCount(data.total_count || 0)
        setCurrentPage(page)
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
        .select('id, name, type, credits, price_dhs, validity_months, weekly_limit')
        .order('price_dhs', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err: any) {
      console.error('Error fetching plans:', err)
    }
  }

  useEffect(() => {
    fetchUsers(0)
    fetchPlans()
  }, [])

  const handleMarkAsContacted = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'contacted' })
        .eq('id', userId)

      if (error) throw error

      await fetchUsers(currentPage)
      toast.success('Utilisateur marqué comme contacté')
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const selectedPlan = plans.find(p => p.id === subscriptionForm.plan_id)
      if (!selectedPlan) {
        toast.error('Plan sélectionné introuvable')
        return
      }

      // Calculate expiry date
      const startDate = new Date(subscriptionForm.start_date)
      const expiryDate = new Date(startDate)
      expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.validity_months)

      const subscriptionData = {
        user_id: selectedUser.id,
        plan_id: subscriptionForm.plan_id,
        start_date: startDate.toISOString(),
        end_date: expiryDate.toISOString(),
        credits_remaining: selectedPlan.credits,
        status: 'active'
      }

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)

      if (subscriptionError) throw subscriptionError

      // Update user status
      const { error: userError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', selectedUser.id)

      if (userError) throw userError

      await fetchUsers(currentPage)
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

      await fetchUsers(currentPage)
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
      case 'contacted':
        return <Badge variant="secondary">Contacté</Badge>
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
    const pendingCount = users.filter(u => u.subscription_status === 'pending').length
    const contactedCount = users.filter(u => u.subscription_status === 'contacted').length
    const activeCount = users.filter(u => u.subscription_status === 'active').length
    const expiredCount = users.filter(u => u.subscription_status === 'expired').length
    const inactiveCount = users.filter(u => u.subscription_status === 'inactive').length

    return {
      pending: pendingCount,
      contacted: contactedCount,
      active: activeCount,
      expired: expiredCount,
      inactive: inactiveCount,
      total: users.length,
      needsAttention: pendingCount + contactedCount
    }
  }

  const stats = getStats()
  const totalPages = Math.ceil(totalCount / pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUsers(newPage)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Active User Info</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
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
            <CardTitle className="text-sm font-medium">Contactés</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">En attente d'abonnement</p>
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

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground">
              Les utilisateurs apparaîtront ici une fois qu'ils se seront inscrits.
            </p>
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
                      <div className="text-sm">
                        {user.desired_plan || (
                          <span className="text-muted-foreground">Non spécifié</span>
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
                        {user.subscription_status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsContacted(user.id)}
                          >
                            <IconPhone className="h-4 w-4 mr-1" />
                            Marquer contacté
                          </Button>
                        )}
                        {user.subscription_status === 'contacted' && (
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
                            onClick={() => handleDeactivateUser(user.id, user.full_name)}
                          >
                            <IconUserMinus className="h-4 w-4 mr-1" />
                            Désactiver
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages} • {totalCount} utilisateurs au total
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