import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { APP_CONFIG } from '@/constants/config'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // During build time, return a dummy client that won't actually be used
    console.warn('Supabase environment variables not available during build')
    return createServerClient(
      APP_CONFIG.SUPABASE.PLACEHOLDER_URL,
      APP_CONFIG.SUPABASE.PLACEHOLDER_KEY,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll(cookiesToSet) {
            // No-op during build
          },
        },
      }
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}