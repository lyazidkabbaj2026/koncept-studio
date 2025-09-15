// Note: Badge component import removed for utility purity

// Status color mappings
export const STATUS_COLORS = {
  // Subscription statuses
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',

  // Class difficulty
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200',

  // Class status
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  ongoing: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  classCancelled: 'bg-red-100 text-red-800 border-red-200',

  // Booking status
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  waitlist: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  checkedIn: 'bg-blue-100 text-blue-800 border-blue-200',
  noShow: 'bg-red-100 text-red-800 border-red-200',

  // User status
  member: 'bg-green-100 text-green-800 border-green-200',
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  coach: 'bg-blue-100 text-blue-800 border-blue-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',

  // Payment status
  paid: 'bg-green-100 text-green-800 border-green-200',
  unpaid: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200'
} as const

// Status label mappings
export const STATUS_LABELS = {
  // Subscription statuses
  active: 'Actif',
  inactive: 'Inactif',
  expired: 'Expiré',
  pending: 'En attente',
  cancelled: 'Annulé',

  // Class difficulty
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',

  // Class status
  scheduled: 'Programmé',
  ongoing: 'En cours',
  completed: 'Terminé',
  classCancelled: 'Annulé',

  // Booking status
  confirmed: 'Confirmé',
  waitlist: 'Liste d\'attente',
  checkedIn: 'Présent',
  noShow: 'Absent',

  // User status
  member: 'Membre',
  admin: 'Administrateur',
  coach: 'Coach',
  suspended: 'Suspendu',

  // Payment status
  paid: 'Payé',
  unpaid: 'Impayé',
  partial: 'Partiellement payé'
} as const

export type StatusKey = keyof typeof STATUS_COLORS
export type StatusLabel = typeof STATUS_LABELS[StatusKey]

/**
 * Get status configuration (color and label) for a given status key
 */
export function getStatusConfig(status: StatusKey | string) {
  const normalizedStatus = status.toLowerCase() as StatusKey

  return {
    color: STATUS_COLORS[normalizedStatus] || STATUS_COLORS.inactive,
    label: STATUS_LABELS[normalizedStatus] || status,
  }
}

/**
 * Get appropriate color class for a status
 */
export function getStatusColor(status: StatusKey | string): string {
  const normalizedStatus = status.toLowerCase() as StatusKey
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.inactive
}

/**
 * Get localized label for a status
 */
export function getStatusLabel(status: StatusKey | string): string {
  const normalizedStatus = status.toLowerCase() as StatusKey
  return STATUS_LABELS[normalizedStatus] || status
}

/**
 * Get status badge configuration for use in components
 * Note: Use this with your Badge component to create status badges
 */
export interface StatusBadgeConfig {
  color: string
  label: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function getStatusBadgeConfig(
  status: StatusKey | string,
  variant?: 'default' | 'secondary' | 'destructive' | 'outline',
  className?: string
): StatusBadgeConfig & { className: string } {
  const config = getStatusConfig(status)

  return {
    color: config.color,
    label: config.label,
    variant,
    className: `${config.color} ${className || ''}`
  }
}

/**
 * Subscription-specific utilities
 */
export const subscriptionUtils = {
  isActive: (status: string) => status.toLowerCase() === 'active',
  isExpired: (status: string) => status.toLowerCase() === 'expired',
  isPending: (status: string) => status.toLowerCase() === 'pending',

  getCreditsDisplay: (remaining: number, total?: number) => {
    if (total) {
      return `${remaining}/${total} crédits restants`
    }
    return `${remaining} crédits restants`
  },

  getSubscriptionTypeLabel: (type: string) => {
    const types: Record<string, string> = {
      'monthly': 'Mensuel',
      'annual': 'Annuel',
      'credits': 'Carnet',
      'unlimited': 'Illimité'
    }
    return types[type.toLowerCase()] || type
  }
}

/**
 * Class-specific utilities
 */
export const classUtils = {
  getDifficultyColor: (difficulty: string) => getStatusColor(difficulty.toLowerCase()),
  getDifficultyLabel: (difficulty: string) => getStatusLabel(difficulty.toLowerCase()),

  getCapacityStatus: (current: number, max: number) => {
    const percentage = (current / max) * 100

    if (percentage >= 100) return { status: 'full', label: 'Complet', color: STATUS_COLORS.cancelled }
    if (percentage >= 80) return { status: 'almost-full', label: 'Presque complet', color: STATUS_COLORS.pending }
    if (percentage >= 50) return { status: 'half-full', label: 'Places limitées', color: STATUS_COLORS.intermediate }
    return { status: 'available', label: 'Places disponibles', color: STATUS_COLORS.active }
  },

  formatCapacity: (current: number, max: number) => `${current}/${max} places`
}

/**
 * User-specific utilities
 */
export const userUtils = {
  getRoleColor: (role: string) => getStatusColor(role.toLowerCase()),
  getRoleLabel: (role: string) => getStatusLabel(role.toLowerCase()),

  getLastSeenStatus: (lastSeen: string | Date | null) => {
    if (!lastSeen) return { status: 'never', label: 'Jamais connecté', color: STATUS_COLORS.inactive }

    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInDays = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return { status: 'today', label: 'Aujourd\'hui', color: STATUS_COLORS.active }
    if (diffInDays === 1) return { status: 'yesterday', label: 'Hier', color: STATUS_COLORS.active }
    if (diffInDays <= 7) return { status: 'week', label: `Il y a ${diffInDays} jours`, color: STATUS_COLORS.pending }
    if (diffInDays <= 30) return { status: 'month', label: `Il y a ${Math.floor(diffInDays / 7)} semaines`, color: STATUS_COLORS.inactive }

    return { status: 'long', label: 'Il y a longtemps', color: STATUS_COLORS.inactive }
  }
}

export default {
  getStatusConfig,
  getStatusColor,
  getStatusLabel,
  getStatusBadgeConfig,
  subscriptionUtils,
  classUtils,
  userUtils
}