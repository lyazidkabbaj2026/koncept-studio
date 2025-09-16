import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // During build time, environment variables might not be available
    // Return a dummy client that will fail gracefully
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables not available during build')
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}