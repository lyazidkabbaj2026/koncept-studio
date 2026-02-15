import { z } from 'zod'

// =====================================================
// Validation Schemas
// =====================================================

export const createRequestSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
})

// Update schema removed since we no longer allow editing requests

export type CreateRequestData = z.infer<typeof createRequestSchema>

// =====================================================
// Interface Types
// =====================================================

export interface SubscriptionRequestWithPlan {
  id: string
  planName: string
  planType: string
  planPrice: number
  status: string
  priority: number
  requestType: string
  userNotes?: string
  preferredStartDate?: string
  budgetMax?: number
  expiresAt: string
  createdAt: string
  contactedAt?: string
  fulfilledAt?: string
  isActive: boolean
}

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}