// =====================================================
// Enhanced Subscription Requests Types
// =====================================================

export type RequestStatus = 'pending' | 'contacted' | 'approved' | 'fulfilled' | 'cancelled' | 'expired'
export type RequestType = 'new' | 'renewal' | 'upgrade' | 'additional'
// ContactMethod removed - no longer tracking contact methods

// Base subscription request interface
export interface SubscriptionRequest {
  id: string
  userId: string
  planId: string
  status: RequestStatus
  priority: number
  requestType: RequestType
  userNotes?: string
  preferredStartDate?: string
  budgetMax?: number
  notes?: string // Admin notes
  assignedTo?: string
  fulfilledAt?: string
  fulfilledBy?: string
  resultingSubscriptionId?: string
  expiresAt: string
  requestedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// Subscription request with plan details (for display)
export interface SubscriptionRequestWithPlan extends SubscriptionRequest {
  plan: {
    id: string
    name: string
    type: string
    credits?: number
    priceDhs: number
    validityMonths?: number
    weeklyLimit?: number
  }
}

// Subscription request with user details (for admin)
export interface SubscriptionRequestWithUser extends SubscriptionRequestWithPlan {
  user: {
    id: string
    fullName: string
    email: string
    phone?: string
    subscriptionStatus: string
  }
  assignedToAdmin?: {
    id: string
    fullName: string
  }
}

// Form data interfaces
export interface CreateRequestData {
  planId: string
  requestType?: RequestType
  userNotes?: string
  preferredStartDate?: Date
  budgetMax?: number
}

export interface UpdateRequestData {
  userNotes?: string
  preferredStartDate?: Date
  budgetMax?: number
}

export interface AdminUpdateRequestData {
  status?: RequestStatus
  notes?: string
  assignedTo?: string
}

// Display interfaces
export interface RequestStatusInfo {
  label: string
  color: string
  description: string
  icon?: string
}

export interface RequestTypeInfo {
  label: string
  description: string
  icon?: string
}

// Statistics interface for admin dashboard
export interface RequestStatistics {
  total: number
  pending: number
  contacted: number
  approved: number
  fulfilled: number
  cancelled: number
  expired: number
  averageProcessingTime: number // in days
  conversionRate: number // percentage
}

// Filter interface for admin dashboard
export interface RequestFilters {
  status?: RequestStatus[]
  requestType?: RequestType[]
  priority?: number[]
  assignedTo?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

// Bulk action interface
export interface BulkAction {
  type: 'contact' | 'approve' | 'assign' | 'cancel'
  requestIds: string[]
  data?: {
    assignedTo?: string
    notes?: string
  }
}

// Dashboard data interface
export interface SubscriptionRequestsDashboard {
  statistics: RequestStatistics
  recentRequests: SubscriptionRequestWithUser[]
  priorityRequests: SubscriptionRequestWithUser[]
  expiringSoon: SubscriptionRequestWithUser[]
  myAssignedRequests: SubscriptionRequestWithUser[]
}

// User dashboard data interface
export interface UserSubscriptionDashboard {
  activeRequests: SubscriptionRequestWithPlan[]
  requestHistory: SubscriptionRequestWithPlan[]
  activeSubscriptions: any[] // Using existing subscription type
  canCreateRequest: boolean
  maxActiveRequests: number
}

// API response interfaces
export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Validation schemas (for form validation)
export interface RequestValidationRules {
  maxActiveRequestsPerUser: number
  maxRequestsPerPlanType: number
  requestExpirationDays: number
  duplicateRequestCooldownDays: number
  maxUserNotesLength: number
  maxAdminNotesLength: number
}

// Database function response types
export interface GetUserRequestsResponse {
  id: string
  planName: string
  planType: string
  planPrice: number
  status: RequestStatus
  priority: number
  requestType: RequestType
  userNotes?: string
  preferredStartDate?: string
  budgetMax?: number
  expiresAt: string
  createdAt: string
  fulfilledAt?: string
  isActive: boolean
}

export interface GetAdminRequestsResponse {
  id: string
  userName: string
  userEmail: string
  userPhone?: string
  planName: string
  planType: string
  planPrice: number
  status: RequestStatus
  priority: number
  requestType: RequestType
  userNotes?: string
  adminNotes?: string
  preferredStartDate?: string
  budgetMax?: number
  expiresAt: string
  createdAt: string
  fulfilledAt?: string
  assignedToName?: string
}

// Constants
export const REQUEST_STATUSES: RequestStatus[] = [
  'pending',
  'contacted',
  'approved',
  'fulfilled',
  'cancelled',
  'expired'
]

export const REQUEST_TYPES: RequestType[] = [
  'new',
  'renewal',
  'upgrade',
  'additional'
]

// CONTACT_METHODS removed - no longer tracking contact methods

export const PRIORITY_LEVELS = [
  { value: 1, label: 'Très urgent', color: 'foreground' },
  { value: 2, label: 'Urgent', color: 'foreground' },
  { value: 3, label: 'Important', color: 'muted-foreground' },
  { value: 4, label: 'Normal', color: 'muted-foreground' },
  { value: 5, label: 'Faible', color: 'muted-foreground' }
]

// Utility type guards
export function isValidRequestStatus(status: string): status is RequestStatus {
  return REQUEST_STATUSES.includes(status as RequestStatus)
}

export function isValidRequestType(type: string): type is RequestType {
  return REQUEST_TYPES.includes(type as RequestType)
}

// isValidContactMethod removed - no longer tracking contact methods

// Helper functions for status and type information
export function getStatusInfo(status: RequestStatus): RequestStatusInfo {
  const statusConfig: Record<RequestStatus, RequestStatusInfo> = {
    pending: {
      label: 'En attente',
      color: 'bg-muted text-muted-foreground',
      description: 'Demande en cours de traitement',
      icon: 'Clock'
    },
    contacted: {
      label: 'Contacté',
      color: 'bg-muted text-foreground',
      description: 'Client contacté',
      icon: 'Phone'
    },
    approved: {
      label: 'Approuvé',
      color: 'bg-foreground text-background',
      description: 'Demande approuvée',
      icon: 'CheckCircle'
    },
    fulfilled: {
      label: 'Réalisé',
      color: 'bg-foreground text-background',
      description: 'Abonnement activé',
      icon: 'Check'
    },
    cancelled: {
      label: 'Annulé',
      color: 'bg-muted text-muted-foreground',
      description: 'Demande annulée',
      icon: 'X'
    },
    expired: {
      label: 'Expiré',
      color: 'bg-muted text-muted-foreground',
      description: 'Demande expirée',
      icon: 'XCircle'
    }
  }

  return statusConfig[status]
}

export function getTypeInfo(requestType: RequestType): RequestTypeInfo {
  const typeConfig: Record<RequestType, RequestTypeInfo> = {
    new: {
      label: 'Nouvelle demande',
      description: 'Premier abonnement',
      icon: 'Plus'
    },
    renewal: {
      label: 'Renouvellement',
      description: 'Renouveler un abonnement',
      icon: 'Refresh'
    },
    upgrade: {
      label: 'Mise à niveau',
      description: 'Améliorer l\'abonnement',
      icon: 'ArrowUp'
    },
    additional: {
      label: 'Abonnement supplémentaire',
      description: 'Ajouter un abonnement',
      icon: 'PlusCircle'
    }
  }

  return typeConfig[requestType]
}

export function getPriorityInfo(priority: number) {
  return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[3] // Default to normal
}

// Utility functions for date handling
export function isRequestExpiringSoon(expiresAt: string, daysThreshold: number = 3): boolean {
  const expiry = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= daysThreshold && diffDays > 0
}

export function isRequestExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function formatTimeUntilExpiry(expiresAt: string): string {
  const expiry = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expiré'
  if (diffDays === 0) return 'Expire aujourd\'hui'
  if (diffDays === 1) return 'Expire demain'
  return `Expire dans ${diffDays} jours`
}