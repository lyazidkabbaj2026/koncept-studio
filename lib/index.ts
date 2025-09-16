/**
 * Main library exports
 * Centralizes all library functionality for easy importing
 */

// Services
export * from './services'

// Utilities
export * from './utils'

// Validation
export * from './validation'

// Repositories
export * from './repositories'

// Supabase clients
export { createClient as createBrowserClient } from './supabase/client'
export { createClient as createServerClient } from './supabase/server'
export { createAdminClient, isUserAdmin, withAdminAuth } from './supabase/admin'