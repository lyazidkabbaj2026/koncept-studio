// =====================================================
// Utility Functions for Subscription Requests
// =====================================================

/**
 * Get request status display information
 */
export function getRequestStatusInfo(status: string) {
  const statusConfig = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Votre demande est en cours de traitement'
    },
    contacted: {
      label: 'Contacté',
      color: 'bg-blue-100 text-blue-800',
      description: 'Nous vous avons contacté concernant cette demande'
    },
    approved: {
      label: 'Approuvé',
      color: 'bg-green-100 text-green-800',
      description: 'Votre demande a été approuvée'
    },
    fulfilled: {
      label: 'Réalisé',
      color: 'bg-green-100 text-green-800',
      description: 'Votre abonnement a été activé'
    },
    cancelled: {
      label: 'Annulé',
      color: 'bg-red-100 text-red-800',
      description: 'Cette demande a été annulée'
    },
    expired: {
      label: 'Expiré',
      color: 'bg-gray-100 text-gray-800',
      description: 'Cette demande a expiré'
    }
  }

  return statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    description: 'Statut inconnu'
  }
}

/**
 * Get request type display information
 */
export function getRequestTypeInfo(requestType: string) {
  const typeConfig = {
    new: {
      label: 'Nouvelle demande',
      description: 'Premier abonnement'
    },
    renewal: {
      label: 'Renouvellement',
      description: 'Renouveler un abonnement existant'
    },
    upgrade: {
      label: 'Mise à niveau',
      description: 'Améliorer votre abonnement actuel'
    },
    additional: {
      label: 'Abonnement supplémentaire',
      description: 'Ajouter un abonnement en plus de l\'existant'
    }
  }

  return typeConfig[requestType as keyof typeof typeConfig] || {
    label: requestType,
    description: 'Type de demande'
  }
}