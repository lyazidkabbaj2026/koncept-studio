import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Ensure 'next' is just the path, not a full URL
  const nextParam = requestUrl.searchParams.get('next') ?? '/reset-password'
  const nextPath = nextParam.startsWith('http') 
    ? new URL(nextParam).pathname 
    : nextParam

  const baseUrl = 'https://k-onceptstudio.com'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Always redirect to the absolute base + the specific path
      return NextResponse.redirect(`${baseUrl}${nextPath}`)
    }
    console.error('Auth Callback Error:', error.message)
  }

  return NextResponse.redirect(`${baseUrl}/forgot-password?error=invalid_link`)
}