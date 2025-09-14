import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin operations that bypass RLS
export function createAdminClient() {
  // Note: In production, you would use the service role key here
  // For now, we'll use the regular client but with RLS bypass techniques
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Helper function to check if a user is admin using raw SQL
export async function isUserAdmin(userId: string) {
  const supabase = createAdminClient()
  
  // Use a direct query that should work even with RLS
  const { data, error } = await supabase
    .rpc('check_user_admin', { user_id: userId })
  
  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }
  
  return data === true
}