import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type ClassBooking = Database['public']['Tables']['class_bookings']['Row']
type ClassWaitlist = Database['public']['Tables']['class_waitlist']['Row']
type ClassSchedule = Database['public']['Tables']['class_schedules']['Row']

export interface BookingData {
  scheduleId: string
  subscriptionId: string
}

export interface BookingResult {
  success: boolean
  error?: string
  booking?: ClassBooking
}

export interface WaitlistResult {
  success: boolean
  error?: string
  waitlistEntry?: ClassWaitlist
}

export class BookingService {
  private supabaseClient: ReturnType<typeof createClient> | null = null

  private get supabase() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  async bookClass({ scheduleId, subscriptionId }: BookingData): Promise<BookingResult> {
    try {
      const { data, error } = await this.supabase.rpc('book_class', {
        schedule_id: scheduleId,
        subscription_id: subscriptionId,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        booking: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async cancelBooking(bookingId: string): Promise<BookingResult> {
    try {
      const { data, error } = await this.supabase.rpc('cancel_booking', {
        booking_id: bookingId,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        booking: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async joinWaitlist({ scheduleId, subscriptionId }: BookingData): Promise<WaitlistResult> {
    try {
      const { data, error } = await this.supabase.rpc('join_waitlist', {
        schedule_id: scheduleId,
        subscription_id: subscriptionId,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        waitlistEntry: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async leaveWaitlist(waitlistId: string): Promise<WaitlistResult> {
    try {
      const { data, error } = await this.supabase
        .from('class_waitlist')
        .delete()
        .eq('id', waitlistId)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        waitlistEntry: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async getUserBookings(userId: string) {
    const { data, error } = await this.supabase
      .from('class_bookings')
      .select(`
        *,
        class_schedules (
          *,
          classes (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getUserWaitlistEntries(userId: string) {
    const { data, error } = await this.supabase
      .from('class_waitlist')
      .select(`
        *,
        class_schedules (
          *,
          classes (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getClassAvailability(scheduleId: string) {
    const { data, error } = await this.supabase.rpc('get_class_availability', {
      schedule_id: scheduleId,
    })

    if (error) throw error
    return data
  }

  async canUserBook(scheduleId: string): Promise<{ canBook: boolean; reason?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('can_user_book_class', {
        schedule_id: scheduleId,
      })

      if (error) {
        return {
          canBook: false,
          reason: error.message,
        }
      }

      return {
        canBook: data.can_book,
        reason: data.reason,
      }
    } catch (error) {
      return {
        canBook: false,
        reason: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}