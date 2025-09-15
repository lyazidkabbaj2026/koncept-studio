export * from './booking'
export * from './class'
export * from './subscription'

// Common types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  error: string | null
  success: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface DateRange {
  start: string
  end: string
}

export interface FilterOptions {
  search?: string
  status?: string
  date_range?: DateRange
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

// Dashboard types
export interface DashboardStats {
  total_users: number
  active_subscriptions: number
  total_bookings: number
  revenue_monthly: number
}

export interface DashboardData {
  stats: DashboardStats
  recent_bookings: any[]
  upcoming_classes: any[]
  pending_requests: any[]
}