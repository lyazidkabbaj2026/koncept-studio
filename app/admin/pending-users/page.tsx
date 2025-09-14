'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Phone, Mail, Calendar, CreditCard, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PendingUser {
  id: string
  email: string
  full_name: string
  phone?: string
  desired_plan?: string
  subscription_status: 'pending' | 'contacted' | 'active' | 'inactive'
  created_at: string
}

interface SubscriptionPlan {
  id: string
  name: string
  type: string
  credits: number
  price_dhs: number
  validity_months: number
  weekly_limit?: number
  is_active: boolean
}

interface SubscriptionFormData {
  plan_id: string
  start_date: string
  notes: string
}

export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [showAssignSubscription, setShowAssignSubscription] = useState(false)
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormData>({
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const supabase = createClient()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users...') // Debug log
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('subscription_status', ['pending', 'contacted'])
        .order('created_at', { ascending: true })

      console.log('Users data:', data) // Debug log
      console.log('Users error:', error) // Debug log

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      setUsers(data || [])
    } catch (err) {
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
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('price_dhs', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err) {
      console.error('Error fetching plans:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchPlans()
  }, [])

  const handleMarkContacted = async (userId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'contacted'
        })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
      setSelectedUser(null)
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSubscription = async () => {
    if (!selectedUser || !subscriptionForm.plan_id) return

    try {
      setLoading(true)
      const selectedPlan = plans.find(p => p.id === subscriptionForm.plan_id)
      if (!selectedPlan) throw new Error('Plan non trouvé')

      const startDate = new Date(subscriptionForm.start_date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + selectedPlan.validity_months)

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: selectedUser.id,
          plan_id: subscriptionForm.plan_id,
          credits_remaining: selectedPlan.credits,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }])

      if (subscriptionError) throw subscriptionError

      // Update user status
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active'
        })
        .eq('id', selectedUser.id)

      if (userError) throw userError

      await fetchUsers()
      setShowAssignSubscription(false)
      setSubscriptionForm({
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setSelectedUser(null)
    } catch (err: any) {
      console.error('Error assigning subscription:', err)
      setError(err.message || 'Erreur lors de l\'attribution de l\'abonnement')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-secondary text-secondary-foreground'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'contacted': return 'Contacté'
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carnet': return 'Carnet'
      case 'personal_training': return 'Personal Training'
      case 'abonnement': return 'Abonnement'
      default: return type
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Utilisateurs en Attente</h1>
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
        <h1 className="text-3xl font-bold">Utilisateurs en Attente</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {users.filter(u => u.subscription_status === 'pending').length} en attente
          </Badge>
          <Badge variant="outline">
            {users.filter(u => u.subscription_status === 'contacted').length} contactés
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun utilisateur en attente</h3>
            <p className="text-muted-foreground">
              Tous les utilisateurs ont été traités ou aucune nouvelle inscription n'est en attente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{user.full_name}</CardTitle>
                  <Badge className={getStatusColor(user.subscription_status)}>
                    {getStatusLabel(user.subscription_status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Inscrit le {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.desired_plan && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Plan souhaité: {user.desired_plan}</span>
                    </div>
                  )}
                </div>


                <div className="flex space-x-2 pt-2">
                  {user.subscription_status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contacter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Marquer comme contacté</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Marquer cet utilisateur comme ayant été contacté ?
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">
                              Annuler
                            </Button>
                            <Button
                              onClick={() => handleMarkContacted(user.id)}
                              disabled={loading}
                            >
                              Marquer comme contacté
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedUser(user)
                      setShowAssignSubscription(true)
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assigner Abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Subscription Dialog */}
      <Dialog open={showAssignSubscription} onOpenChange={setShowAssignSubscription}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Assigner un abonnement à {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan d'abonnement</Label>
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
                        <span className="ml-2 text-muted-foreground">
                          {plan.price_dhs} DHS - {getTypeLabel(plan.type)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="date"
                value={subscriptionForm.start_date}
                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription-notes">Notes</Label>
              <Textarea
                id="subscription-notes"
                value={subscriptionForm.notes}
                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes sur l'attribution de l'abonnement..."
                rows={3}
              />
            </div>

            {subscriptionForm.plan_id && (
              <div className="p-4 bg-muted rounded">
                {(() => {
                  const selectedPlan = plans.find(p => p.id === subscriptionForm.plan_id)
                  if (!selectedPlan) return null
                  
                  const startDate = new Date(subscriptionForm.start_date)
                  const endDate = new Date(startDate)
                  endDate.setMonth(endDate.getMonth() + selectedPlan.validity_months)
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <h4 className="font-medium">Récapitulatif de l'abonnement</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Plan: {selectedPlan.name}</div>
                        <div>Prix: {selectedPlan.price_dhs} DHS</div>
                        <div>Crédits: {selectedPlan.type === 'abonnement' ? 'Illimité' : selectedPlan.credits}</div>
                        <div>Validité: {selectedPlan.validity_months} mois</div>
                        {selectedPlan.weekly_limit && (
                          <>
                            <div>Limite/semaine: {selectedPlan.weekly_limit}</div>
                          </>
                        )}
                        <div>Début: {format(startDate, 'dd MMM yyyy', { locale: fr })}</div>
                        <div>Fin: {format(endDate, 'dd MMM yyyy', { locale: fr })}</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignSubscription(false)
                  setSelectedUser(null)
                  setSubscriptionForm({
                    plan_id: '',
                    start_date: new Date().toISOString().split('T')[0],
                    notes: ''
                  })
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignSubscription}
                disabled={loading || !subscriptionForm.plan_id}
              >
                {loading ? 'Attribution...' : 'Assigner l\'abonnement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}