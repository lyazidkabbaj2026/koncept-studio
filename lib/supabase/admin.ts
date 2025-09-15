import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin operations that bypass RLS
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
      'Please add it to your .env.local file.'
    )
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      // Use service role key for admin operations
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'koncept-studio-admin'
        }
      }
    }
  )
}

// Helper function to check if a user is admin using service role
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) {
    return false
  }
  
  try {
    const supabase = createAdminClient()
    
    // Direct query using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }
    
    return data?.role === 'admin'
  } catch (error) {
    console.error('Exception in isUserAdmin:', error)
    return false
  }
}

// Secure admin operation wrapper
export async function withAdminAuth<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const isAdmin = await isUserAdmin(userId)
    
    if (!isAdmin) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required'
      }
    }
    
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error('Error in admin operation:', error)
    return {
      success: false,
      error: 'Internal server error'
    }
  }
}