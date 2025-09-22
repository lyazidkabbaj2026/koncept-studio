'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconUserPlus,
  IconPhone,
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconCurrencyDollar,
  IconCalendar,
  IconNote,
  IconAlertTriangle,
  IconEye,
  IconUsers,
  IconActivity,
  IconFileText
} from '@tabler/icons-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { getAdminSubscriptionRequests, updateSubscriptionRequest, assignSubscriptionToUser, type AdminSubscriptionRequest, type RequestStats } from './actions'

export default function AdminSubscriptionRequestsPage() {
  const [requests, setRequests] = useState<AdminSubscriptionRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<AdminSubscriptionRequest[]>([])
  const [stats, setStats] = useState<RequestStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AdminSubscriptionRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Assign form data
  const [assignData, setAssignData] = useState({
    startDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  const loadRequests = async () => {
    try {
      setIsLoading(true)

      const result = await getAdminSubscriptionRequests()

      if (result.success && result.data) {
        setRequests(result.data.requests)
        setStats(result.data.stats)
      } else {
        toast.error(result.error || 'Erreur lors du chargement des demandes')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.planName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const getStatusInfo = (status: string) => {
    const configs = {
      pending: { label: 'En attente', color: 'bg-muted text-muted-foreground' },
      contacted: { label: 'Contacté', color: 'bg-muted text-foreground' },
      approved: { label: 'Approuvé', color: 'bg-foreground text-background' },
      fulfilled: { label: 'Réalisé', color: 'bg-foreground text-background' },
      cancelled: { label: 'Annulé', color: 'bg-muted text-muted-foreground' },
      expired: { label: 'Expiré', color: 'bg-muted text-muted-foreground' }
    }
    return configs[status as keyof typeof configs] || { label: status, color: 'bg-muted text-muted-foreground' }
  }

  const getTypeInfo = (type: string) => {
    const configs = {
      new: { label: 'Nouvelle demande' },
      renewal: { label: 'Renouvellement' },
      upgrade: { label: 'Mise à niveau' },
      additional: { label: 'Supplémentaire' }
    }
    return configs[type as keyof typeof configs] || { label: type }
  }


  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays > 0
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      // TODO: Implement API call
      toast.success('Statut mis à jour')
      loadRequests()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleAssignRequest = (request: AdminSubscriptionRequest) => {
    setSelectedRequest(request)
    setAssignData({
      startDate: new Date().toISOString().split('T')[0]
    })
    setShowAssignModal(true)
  }

  const handleSaveAssignment = async () => {
    if (!selectedRequest) return

    try {
      const result = await assignSubscriptionToUser(selectedRequest.id, {
        startDate: assignData.startDate
      })

      if (result.success) {
        toast.success('Abonnement assigné avec succès')
        setShowAssignModal(false)
        loadRequests()
      } else {
        toast.error(result.error || 'Erreur lors de l\'assignation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'assignation')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Chargement des demandes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demandes d'Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes les demandes d'abonnement des utilisateurs
          </p>
        </div>
        <Button onClick={loadRequests} variant="outline" className="gap-2">
          <IconRefresh className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <IconFileText className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <IconClock className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <IconCheck className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Traités</p>
                  <p className="text-2xl font-bold">{stats.fulfilled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <IconActivity className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux conversion</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="fulfilled">Traité</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="gap-2"
            >
              <IconFilter className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusInfo = getStatusInfo(request.status)
              const typeInfo = getTypeInfo(request.requestType)
              const expiringSoon = isExpiringSoon(request.expiresAt)

              return (
                <Card key={request.id} className={`transition-all hover:shadow-md ${expiringSoon ? 'border-amber-200 bg-amber-50/50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-lg">{request.userName}</h4>
                          <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          {expiringSoon && (
                            <Badge variant="destructive" className="text-xs">
                              <IconAlertTriangle className="h-3 w-3 mr-1" />
                              Expire bientôt
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Plan:</span>
                            <div className="font-medium">{request.planName}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prix:</span>
                            <div className="font-medium">{request.planPrice} DHS</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <div className="font-medium">{request.userEmail}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Créé le:</span>
                            <div className="font-medium">
                              {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailsModal(true)
                          }}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignRequest(request)}
                          disabled={request.status === 'fulfilled'}
                          title={request.status === 'fulfilled' ? 'Déjà traité' : 'Assigner abonnement'}
                        >
                          <IconUserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
                <p className="text-muted-foreground">
                  Aucune demande ne correspond aux filtres sélectionnés.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Utilisateur</Label>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <Label>Plan</Label>
                  <p className="font-medium">{selectedRequest.planName}</p>
                </div>
                <div>
                  <Label>Prix</Label>
                  <p className="font-medium">{selectedRequest.planPrice} DHS</p>
                </div>
              </div>


              {selectedRequest.adminNotes && (
                <div>
                  <Label>Notes admin</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Subscription Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un abonnement</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Utilisateur:</span>
                    <div className="font-medium">{selectedRequest.userName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <div className="font-medium">{selectedRequest.planName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium">{selectedRequest.planType}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={assignData.startDate}
                  onChange={(e) => setAssignData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveAssignment}>
                  Assigner l'abonnement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}