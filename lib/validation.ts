import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')

export const emailSchema = z
  .string()
  .email('Format email invalide')
  .min(1, 'Une adresse e-mail est requise.')

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit comporter au moins 8 caractères.')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule.')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.')

export const phoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(/^0[6-7]\d{8}$/, 'Format de téléphone invalide (ex: 0612345678)')

export const nameSchema = z
  .string()
  .min(2, 'Le nom doit comporter au moins 2 caractères.')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères.')
  .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres, des espaces, des tirets et des apostrophes.')

// User registration validation
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  phone: phoneSchema,
})

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
})

// Class creation validation
export const classSchema = z.object({
  title: z.string()
    .min(2, 'Class title must be at least 2 characters')
    .max(100, 'Class title cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  max_capacity: z.number()
    .int('Max capacity must be a whole number')
    .min(1, 'Max capacity must be at least 1')
    .max(50, 'Max capacity cannot exceed 50'),
  coach: z.string()
    .min(2, 'Coach name must be at least 2 characters')
    .max(100, 'Coach name cannot exceed 100 characters'),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location cannot exceed 100 characters'),
  difficulty_level: z.string()
    .min(2, 'Difficulty level is required')
    .max(50, 'Difficulty level cannot exceed 50 characters'),
})

// Schedule creation validation
export const scheduleSchema = z.object({
  classId: uuidSchema,
  startTime: z.string().datetime('Invalid datetime format'),
  endTime: z.string().datetime('Invalid datetime format'),
  instructorId: uuidSchema.optional(),
  maxParticipants: z.number()
    .int('Max participants must be a whole number')
    .min(1, 'Max participants must be at least 1')
    .max(50, 'Max participants cannot exceed 50')
    .optional(),
}).refine((data) => {
  const start = new Date(data.startTime)
  const end = new Date(data.endTime)
  return end > start
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

// Booking validation
export const bookingSchema = z.object({
  scheduleId: uuidSchema,
  subscriptionId: uuidSchema.optional(),
})

// Subscription plan validation
export const subscriptionPlanSchema = z.object({
  name: z.string()
    .min(2, 'Plan name must be at least 2 characters')
    .max(50, 'Plan name cannot exceed 50 characters'),
  type: z.enum(['carnet', 'personal_training', 'abonnement']),
  price_dhs: z.number()
    .min(0, 'Price cannot be negative')
    .max(5000, 'Price cannot exceed 5000 DHS'),
  credits: z.number()
    .int('Credits must be a whole number')
    .min(1, 'Credits must be at least 1')
    .max(100, 'Credits cannot exceed 100'),
  weekly_limit: z.number()
    .int('Weekly limit must be a whole number')
    .min(1, 'Weekly limit must be at least 1')
    .max(20, 'Weekly limit cannot exceed 20')
    .optional()
    .nullable(),
  validity_months: z.number()
    .int('Validity must be a whole number')
    .min(1, 'Validity must be at least 1 month')
    .max(24, 'Validity cannot exceed 24 months'),
})

// Query parameter validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
})

// Profile update validation
export const profileUpdateSchema = z.object({
  fullName: nameSchema.optional(),
  phone: phoneSchema,
  emergencyContact: z.object({
    name: nameSchema,
    phone: phoneSchema,
  }).optional(),
})

// Validation helper functions
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors = (result.error?.issues || []).map((err) =>
    err.message || 'Invalid value'
  )

  return { success: false, errors }
}

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Sanitize HTML input (for rich text)
export function sanitizeHtml(input: string): string {
  // For now, just remove all HTML tags
  // In production, use a proper HTML sanitizer like DOMPurify
  return input.replace(/<[^>]*>/g, '').trim()
}

// Rate limiting validation (for API endpoints)
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  action: z.enum(['login', 'signup', 'booking', 'api_call']),
  timestamp: z.number().default(() => Date.now()),
})

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB'),
  type: z.string().refine((type) => 
    ['image/jpeg', 'image/png', 'image/webp'].includes(type),
    'Only JPEG, PNG, and WebP images are allowed'
  ),
})

// Admin action validation
export const adminActionSchema = z.object({
  userId: uuidSchema,
  action: z.enum(['approve_user', 'reject_user', 'make_admin', 'remove_admin']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
})

export type SignupData = z.infer<typeof signupSchema>
export type LoginData = z.infer<typeof loginSchema>
export type ClassData = z.infer<typeof classSchema>
export type ScheduleData = z.infer<typeof scheduleSchema>
export type BookingData = z.infer<typeof bookingSchema>
export type SubscriptionPlanData = z.infer<typeof subscriptionPlanSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type AdminActionData = z.infer<typeof adminActionSchema>