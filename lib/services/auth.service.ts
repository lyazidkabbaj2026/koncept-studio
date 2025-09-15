import { createClient } from '@/lib/supabase/client'
import type { AuthError, User } from '@supabase/supabase-js'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  fullName: string
  phone?: string
  desiredPlan?: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

export class AuthService {
  private supabase = createClient()

  async signIn({ email, password }: LoginCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    return {
      user: data.user,
      error,
    }
  }

  async signUp({ email, password, fullName, phone, desiredPlan }: SignupData): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          desired_plan: desiredPlan || null,
        },
      },
    })

    return {
      user: data.user,
      error,
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  async updateProfile(updates: { full_name?: string }): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.updateUser({
      data: updates,
    })
    return { error }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return false
      }

      return data.role === 'admin'
    } catch (error) {
      return false
    }
  }
}