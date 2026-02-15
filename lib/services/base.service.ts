import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Result, safeExecute, type ErrorContext } from '@/lib/utils/error-handler'

/**
 * Base service class implementing common patterns
 * All services should extend this class for consistent behavior
 */
export abstract class BaseService {
  protected supabaseClient: ReturnType<typeof createClient> | null = null

  /**
   * Lazy-loaded Supabase client
   */
  protected get supabase(): SupabaseClient {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  /**
   * Safely execute a database operation with consistent error handling
   */
  protected async safeExecute<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<Result<T>> {
    return safeExecute(operation, {
      ...context,
      service: this.constructor.name
    })
  }

  /**
   * Helper method for Supabase queries with consistent error handling
   */
  protected async executeQuery<T>(
    queryBuilder: any,
    context?: ErrorContext
  ): Promise<Result<T[]>> {
    return this.safeExecute(async () => {
      const { data, error } = await queryBuilder

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    }, context)
  }

  /**
   * Helper method for single record queries
   */
  protected async executeSingleQuery<T>(
    queryBuilder: any,
    context?: ErrorContext
  ): Promise<Result<T | null>> {
    return this.safeExecute(async () => {
      const { data, error } = await queryBuilder

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    }, context)
  }
}