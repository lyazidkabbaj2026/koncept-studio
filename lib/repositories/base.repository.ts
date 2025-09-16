import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Result, safeExecute, type ErrorContext } from '@/lib/utils/error-handler'

/**
 * Base repository class implementing common data access patterns
 * Provides CRUD operations and consistent error handling
 */
export abstract class BaseRepository<T = any> {
  protected supabaseClient: ReturnType<typeof createClient> | null = null
  protected abstract tableName: string

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
   * Get table reference
   */
  protected get table() {
    return this.supabase.from(this.tableName)
  }

  /**
   * Safely execute a database operation
   */
  protected async safeExecute<TResult>(
    operation: () => Promise<TResult>,
    context?: ErrorContext
  ): Promise<Result<TResult>> {
    return safeExecute(operation, {
      ...context,
      repository: this.constructor.name,
      table: this.tableName
    })
  }

  /**
   * Find all records with optional filtering
   */
  async findAll(filters?: Partial<T>): Promise<Result<T[]>> {
    return this.safeExecute(async () => {
      let query = this.table.select('*')

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`)
      }

      return data || []
    })
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<Result<T | null>> {
    return this.safeExecute(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch ${this.tableName} by ID: ${error.message}`)
      }

      return data || null
    })
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<Result<T>> {
    return this.safeExecute(async () => {
      const { data: result, error } = await this.table
        .insert(data)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create ${this.tableName}: ${error.message}`)
      }

      return result
    })
  }

  /**
   * Update a record by ID
   */
  async updateById(id: string, data: Partial<T>): Promise<Result<T>> {
    return this.safeExecute(async () => {
      const { data: result, error } = await this.table
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update ${this.tableName}: ${error.message}`)
      }

      return result
    })
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: string): Promise<Result<boolean>> {
    return this.safeExecute(async () => {
      const { error } = await this.table
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete ${this.tableName}: ${error.message}`)
      }

      return true
    })
  }

  /**
   * Count records with optional filtering
   */
  async count(filters?: Partial<T>): Promise<Result<number>> {
    return this.safeExecute(async () => {
      let query = this.table.select('*', { count: 'exact', head: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value)
          }
        })
      }

      const { count, error } = await query

      if (error) {
        throw new Error(`Failed to count ${this.tableName}: ${error.message}`)
      }

      return count || 0
    })
  }
}