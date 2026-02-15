'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  createRequestSchema,
  type CreateRequestData,
  type ActionResult
} from '@/lib/schemas/subscription-requests'
import { type SubscriptionRequestWithPlan } from '@/lib/types/subscription-requests'
import { whatsappServerService } from '@/lib/services/server'
import { generateSubscriptionRequestMessage } from '@/lib/utils/whatsapp-messages'

// =====================================================
// User-Facing Actions
// =====================================================

/**
 * Get user's subscription requests and current subscriptions
 */
export async function getUserSubscriptionData(): Promise<ActionResult<{
  requests: SubscriptionRequestWithPlan[]
  activeSubscriptions: any[]
  canCreateRequest: boolean
  maxActiveRequests: number
}>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's subscription requests with plan details
    const { data: requests, error: requestsError } = await supabase
      .from('subscription_requests')
      .select(`
        id,
        status,
        request_type,
        expires_at,
        created_at,
        fulfilled_at,
        is_active,
        subscription_plans!inner (
          id,
          name,
          type,
          price_dhs,
          credits,
          validity_months,
          weekly_limit
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching subscription requests:', requestsError)
      return { success: false, error: 'Failed to fetch subscription requests' }
    }

    // Transform the data to match expected format
    const transformedRequests = requests?.map(req => {
      const plan = req.subscription_plans as any
      return {
        id: req.id,
        userId: user.id,
        planId: plan?.id,
        status: req.status,
        priority: 3, // Default priority since we removed it
        requestType: req.request_type,
        expiresAt: req.expires_at,
        requestedAt: req.created_at,
        resolvedAt: req.fulfilled_at,
        createdAt: req.created_at,
        updatedAt: req.created_at,
        isActive: req.is_active,
        plan: {
          id: plan?.id,
          name: plan?.name,
          type: plan?.type,
          credits: plan?.credits,
          priceDhs: plan?.price_dhs,
          validityMonths: plan?.validity_months,
          weeklyLimit: plan?.weekly_limit
        }
      }
    }) || []

    // Get user's active subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          type,
          price_dhs,
          credits,
          validity_months,
          weekly_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())

    if (subscriptionsError) {
      console.error('Error fetching active subscriptions:', subscriptionsError)
      return { success: false, error: 'Failed to fetch active subscriptions' }
    }

    // Check if user can create new requests (max 5 active requests)
    const activeRequestCount = transformedRequests?.filter(r =>
      ['pending', 'contacted', 'approved'].includes(r.status)
    ).length || 0

    return {
      success: true,
      data: {
        requests: transformedRequests,
        activeSubscriptions: subscriptions || [],
        canCreateRequest: activeRequestCount < 5,
        maxActiveRequests: 5,
      }
    }
  } catch (error) {
    console.error('Error in getUserSubscriptionData:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create a new subscription request
 */
export async function createSubscriptionRequest(data: CreateRequestData): Promise<ActionResult<string>> {
  try {
    const validatedData = createRequestSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Create subscription request directly
    const { data: requestData, error } = await supabase
      .from('subscription_requests')
      .insert({
        user_id: user.id,
        plan_id: validatedData.planId,
        request_type: 'new', // Always 'new' for user requests
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        requested_at: new Date().toISOString(),
        is_active: true
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating subscription request:', error)
      return {
        success: false,
        error: error.message || 'Failed to create subscription request'
      }
    }

    // Send WhatsApp subscription request notification
    try {
      // Get user profile and plan details
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single()

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('name')
        .eq('id', validatedData.planId)
        .single()

      if (profile?.phone && plan?.name) {
        const message = generateSubscriptionRequestMessage(profile, plan.name)
        await whatsappServerService.sendMessage({
          phoneNumber: profile.phone,
          message,
          eventType: 'subscription_request',
          userId: user.id
        })
        console.log('WhatsApp subscription request notification sent successfully')
      }
    } catch (error) {
      console.error('Error sending WhatsApp subscription request notification:', error)
      // Don't fail the process if WhatsApp fails
    }

    // Revalidate the subscriptions page
    revalidatePath('/espace/subscriptions')
    revalidatePath('/admin/subscription-requests')

    return {
      success: true,
      data: requestData?.id,
    }
  } catch (error) {
    console.error('Error in createSubscriptionRequest:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${(error as any).errors.map((e: any) => e.message).join(', ')}`
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Update and cancel functions removed - requests are now simplified and managed by admin only

/**
 * Delete a subscription request
 */
export async function deleteSubscriptionRequest(requestId: string): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Delete the request (only if it belongs to the user)
    const { data: deletedData, error: deleteError, count } = await supabase
      .from('subscription_requests')
      .delete()
      .eq('id', requestId)
      .eq('user_id', user.id)
      .select()

    if (deleteError) {
      console.error('Error deleting subscription request:', deleteError)
      return {
        success: false,
        error: 'Failed to delete subscription request'
      }
    }

    // Check if any rows were actually deleted
    if (!deletedData || deletedData.length === 0) {
      console.error('No subscription request was deleted - request may not exist or not belong to user')
      return {
        success: false,
        error: 'Subscription request not found or access denied'
      }
    }

    console.log('Successfully deleted subscription request:', deletedData)

    // Revalidate the subscriptions page
    revalidatePath('/espace/subscriptions')
    revalidatePath('/admin/subscription-requests')

    return {
      success: true,
      data: requestId,
    }
  } catch (error) {
    console.error('Error in deleteSubscriptionRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get available subscription plans for request creation
 */
export async function getAvailableSubscriptionPlans(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('type')
      .order('price_dhs')

    if (error) {
      console.error('Error fetching subscription plans:', error)
      return {
        success: false,
        error: 'Failed to fetch subscription plans'
      }
    }

    return {
      success: true,
      data: plans || [],
    }
  } catch (error) {
    console.error('Error in getAvailableSubscriptionPlans:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

