'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type ActionResult } from '@/lib/types/subscription-requests'

// Admin subscription request interface (simplified)
export interface AdminSubscriptionRequest {
  id: string
  userName: string
  userEmail: string
  userPhone?: string
  planName: string
  planType: string
  planPrice: number
  status: 'pending' | 'contacted' | 'approved' | 'fulfilled' | 'cancelled' | 'expired'
  requestType: 'new' | 'renewal' | 'upgrade' | 'additional'
  adminNotes?: string
  expiresAt: string
  createdAt: string
  fulfilledAt?: string
  assignedToName?: string
}

export interface RequestStats {
  total: number
  pending: number
  contacted: number
  approved: number
  fulfilled: number
  cancelled: number
  expired: number
  averageProcessingTime: number
  conversionRate: number
}

/**
 * Get all subscription requests for admin dashboard
 */
export async function getAdminSubscriptionRequests(): Promise<ActionResult<{
  requests: AdminSubscriptionRequest[]
  stats: RequestStats
}>> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }

    // Get subscription requests with user and plan details
    const { data: requests, error: requestsError } = await supabase
      .from('subscription_requests')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        request_type,
        notes,
        expires_at,
        created_at,
        fulfilled_at,
        is_active
      `)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching admin subscription requests:', requestsError)
      return { success: false, error: 'Failed to fetch subscription requests' }
    }

    // Get user details for each request
    const userIds = [...new Set(requests?.map(req => req.user_id) || [])]
    const planIds = [...new Set(requests?.map(req => req.plan_id) || [])]

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds)

    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name, type, price_dhs')
      .in('id', planIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return { success: false, error: 'Failed to fetch user details' }
    }

    if (plansError) {
      console.error('Error fetching plans:', plansError)
      return { success: false, error: 'Failed to fetch plan details' }
    }

    // Create lookup maps
    const userMap = new Map(users?.map(user => [user.id, user]) || [])
    const planMap = new Map(plans?.map(plan => [plan.id, plan]) || [])

    // Transform the data
    const transformedRequests: AdminSubscriptionRequest[] = requests?.map(req => {
      const user = userMap.get(req.user_id)
      const plan = planMap.get(req.plan_id)

      return {
        id: req.id,
        userName: user?.full_name || 'N/A',
        userEmail: user?.email || 'N/A',
        userPhone: user?.phone || undefined,
        planName: plan?.name || 'N/A',
        planType: plan?.type || 'N/A',
        planPrice: plan?.price_dhs || 0,
        status: req.status,
        requestType: req.request_type,
        adminNotes: req.notes || undefined,
        expiresAt: req.expires_at,
        createdAt: req.created_at,
        fulfilledAt: req.fulfilled_at || undefined,
        assignedToName: undefined // We don't have assigned_to in the current schema
      }
    }) || []

    // Calculate statistics
    const totalRequests = transformedRequests.length
    const pending = transformedRequests.filter(r => r.status === 'pending').length
    const contacted = transformedRequests.filter(r => r.status === 'contacted').length
    const approved = transformedRequests.filter(r => r.status === 'approved').length
    const fulfilled = transformedRequests.filter(r => r.status === 'fulfilled').length
    const cancelled = transformedRequests.filter(r => r.status === 'cancelled').length
    const expired = transformedRequests.filter(r => r.status === 'expired').length

    // Calculate average processing time (for fulfilled requests)
    const fulfilledRequests = transformedRequests.filter(r => r.status === 'fulfilled' && r.fulfilledAt)
    let averageProcessingTime = 0

    if (fulfilledRequests.length > 0) {
      const totalProcessingTime = fulfilledRequests.reduce((sum, req) => {
        if (req.fulfilledAt) {
          const created = new Date(req.createdAt).getTime()
          const fulfilled = new Date(req.fulfilledAt).getTime()
          const diffDays = (fulfilled - created) / (1000 * 60 * 60 * 24)
          return sum + diffDays
        }
        return sum
      }, 0)
      averageProcessingTime = Math.round((totalProcessingTime / fulfilledRequests.length) * 10) / 10
    }

    // Calculate conversion rate (fulfilled / total non-expired requests)
    const nonExpiredRequests = transformedRequests.filter(r => r.status !== 'expired').length
    const conversionRate = nonExpiredRequests > 0
      ? Math.round((fulfilled / nonExpiredRequests) * 100)
      : 0

    const stats: RequestStats = {
      total: totalRequests,
      pending,
      contacted,
      approved,
      fulfilled,
      cancelled,
      expired,
      averageProcessingTime,
      conversionRate
    }

    return {
      success: true,
      data: {
        requests: transformedRequests,
        stats
      }
    }
  } catch (error) {
    console.error('Error in getAdminSubscriptionRequests:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update subscription request status and admin notes
 */
export async function updateSubscriptionRequest(
  requestId: string,
  data: {
    status?: string
    adminNotes?: string
  }
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }

    // Prepare update data
    const updateData: any = {}

    if (data.status) {
      updateData.status = data.status

      // Set fulfilled_at if status is fulfilled
      if (data.status === 'fulfilled') {
        updateData.fulfilled_at = new Date().toISOString()
        updateData.resolved_at = new Date().toISOString()
      }
    }

    if (data.adminNotes !== undefined) {
      updateData.notes = data.adminNotes
    }

    updateData.updated_at = new Date().toISOString()

    // Update the request
    const { error: updateError } = await supabase
      .from('subscription_requests')
      .update(updateData)
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating subscription request:', updateError)
      return {
        success: false,
        error: 'Failed to update subscription request'
      }
    }

    // Revalidate admin page
    revalidatePath('/admin/subscription-requests')

    return {
      success: true,
      data: requestId,
    }
  } catch (error) {
    console.error('Error in updateSubscriptionRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Assign subscription to user and fulfill the request
 */
export async function assignSubscriptionToUser(
  requestId: string,
  data: {
    startDate: string
    customPrice?: number
    notes?: string
  }
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }

    // Get the subscription request details
    const { data: request, error: requestError } = await supabase
      .from('subscription_requests')
      .select(`
        id,
        user_id,
        plan_id,
        status,
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
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Subscription request not found' }
    }

    // Check if request is already fulfilled
    if (request.status === 'fulfilled') {
      return { success: false, error: 'This request has already been fulfilled' }
    }

    const plan = request.subscription_plans as any
    const startDate = new Date(data.startDate)
    const endDate = new Date(startDate)

    // Calculate end date based on plan validity
    if (plan?.validity_months) {
      endDate.setMonth(endDate.getMonth() + plan.validity_months)
    } else {
      // Default to 1 month if no validity specified
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create the subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: request.user_id,
        plan_id: request.plan_id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        credits_remaining: plan?.credits || 0
      })
      .select('id')
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return {
        success: false,
        error: 'Failed to create subscription'
      }
    }

    // Update the request status to fulfilled
    const { error: updateError } = await supabase
      .from('subscription_requests')
      .update({
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: user.id,
        resulting_subscription_id: subscription.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating subscription request:', updateError)
      // Try to rollback the subscription creation
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subscription.id)

      return {
        success: false,
        error: 'Failed to update subscription request'
      }
    }

    // Update user's subscription status to active
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id)

    // Revalidate pages
    revalidatePath('/admin/subscription-requests')
    revalidatePath('/admin/users')
    revalidatePath('/espace/subscriptions')

    return {
      success: true,
      data: subscription.id,
    }
  } catch (error) {
    console.error('Error in assignSubscriptionToUser:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

