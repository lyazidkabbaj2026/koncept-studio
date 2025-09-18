/**
 * Application configuration constants
 * Centralizes all configuration values used across the application
 */

export const APP_CONFIG = {
  // Application metadata
  APP_NAME: 'Koncept Studio',
  APP_DESCRIPTION: 'Réservez vos cours de fitness en ligne',

  // Contact information
  CONTACT: {
    PHONE: '0663235797',
    EMAIL: 'contact@konceptstudio.ma',
    LOCATION: '155 SECT 02 SAHL EL HIJAZ RYAD OULAD MTAA, Temara',
    ADDRESS: '155 SECT 02 SAHL EL HIJAZ RYAD OULAD MTAA, Temara',
    INSTAGRAM: {
      URL: 'https://instagram.com/k_oncept_training',
      HANDLE: '@k_oncept_training'
    }
  },

  // Supabase configuration
  SUPABASE: {
    PLACEHOLDER_URL: 'https://placeholder.supabase.co',
    PLACEHOLDER_KEY: 'placeholder-key'
  },

  // Business logic constants
  BUSINESS: {
    // Subscription limits
    DEFAULT_WEEKLY_LIMIT: 3,
    MAX_BOOKING_DAYS_AHEAD: 30,
    MIN_CANCELLATION_HOURS: 2,

    // Class duration defaults
    DEFAULT_CLASS_DURATION: 45, // minutes

    // Booking statuses
    BOOKING_STATUS: {
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      NO_SHOW: 'no_show',
      PENDING: 'pending'
    } as const,

    // Plan types
    PLAN_TYPES: {
      ABONNEMENT: 'abonnement',
      CARNET: 'carnet',
      PERSONAL_TRAINING: 'personal_training'
    } as const,

    // Difficulty levels
    DIFFICULTY_LEVELS: {
      ALL_LEVELS: 'all_levels',
      BEGINNER: 'beginner',
      INTERMEDIATE: 'intermediate',
      ADVANCED: 'advanced'
    } as const
  },

  // UI Configuration
  UI: {
    // Animation durations (ms)
    ANIMATION_DURATION: {
      SHORT: 150,
      MEDIUM: 300,
      LONG: 500
    },

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Toast notification durations (ms)
    TOAST_DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
      INFO: 3000
    }
  },

  // Error messages
  ERRORS: {
    NETWORK: 'Erreur de connexion. Veuillez réessayer.',
    UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action.',
    FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
    NOT_FOUND: 'Ressource introuvable.',
    VALIDATION: 'Données invalides. Veuillez vérifier vos informations.',
    GENERIC: 'Une erreur inattendue s\'est produite.'
  }
} as const;

// Type definitions for better type safety
export type BookingStatus = typeof APP_CONFIG.BUSINESS.BOOKING_STATUS[keyof typeof APP_CONFIG.BUSINESS.BOOKING_STATUS];
export type PlanType = typeof APP_CONFIG.BUSINESS.PLAN_TYPES[keyof typeof APP_CONFIG.BUSINESS.PLAN_TYPES];
export type DifficultyLevel = typeof APP_CONFIG.BUSINESS.DIFFICULTY_LEVELS[keyof typeof APP_CONFIG.BUSINESS.DIFFICULTY_LEVELS];