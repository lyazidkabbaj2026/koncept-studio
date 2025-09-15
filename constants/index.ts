export { MESSAGES, getMessage } from './messages'

// Common constants
export const APP_NAME = 'Koncept Studio'
export const COMPANY_EMAIL = 'contact.upMotion@gmail.com'
export const COMPANY_PHONE = '+212 6 12 34 56 78'

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy'
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm'
export const TIME_FORMAT = 'HH:mm'

// File size limits (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// API timeouts (in milliseconds)
export const API_TIMEOUT = 10000 // 10 seconds
export const UPLOAD_TIMEOUT = 30000 // 30 seconds

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'koncept-studio-theme',
  USER_PREFERENCES: 'koncept-studio-preferences',
  LAST_VISIT: 'koncept-studio-last-visit',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/espace',
  ADMIN: '/admin',
  CLASSES: '/espace/planning',
  BOOKINGS: '/espace/reservations',
  SUBSCRIPTION: '/espace/abonnement',
  ADMIN_USERS: '/admin/users',
  ADMIN_CLASSES: '/admin/classes',
  ADMIN_CALENDAR: '/admin/calendar',
} as const