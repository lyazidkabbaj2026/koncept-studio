import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const phoneSchema = z
  .string()
  .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Invalid French phone number format')
  .optional()

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

// User registration validation
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  phone: phoneSchema.optional(),
  desiredPlan: z.string().optional(),
})

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Class creation validation
export const classSchema = z.object({
  name: z.string()
    .min(2, 'Class name must be at least 2 characters')
    .max(100, 'Class name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  maxParticipants: z.number()
    .int('Max participants must be a whole number')
    .min(1, 'Max participants must be at least 1')
    .max(50, 'Max participants cannot exceed 50'),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(200, 'Price cannot exceed 200€'),
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
  type: z.enum(['package', 'abonnement']),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(500, 'Price cannot exceed 500€'),
  creditsIncluded: z.number()
    .int('Credits must be a whole number')
    .min(1, 'Credits must be at least 1')
    .max(100, 'Credits cannot exceed 100')
    .optional(),
  weeklyLimit: z.number()
    .int('Weekly limit must be a whole number')
    .min(1, 'Weekly limit must be at least 1')
    .max(20, 'Weekly limit cannot exceed 20')
    .optional(),
  validityMonths: z.number()
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
    `${err.path?.join?.('.') || 'field'}: ${err.message || 'Invalid value'}`
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