import type { Database } from '@/lib/database.types'

export type ClassBooking = Database['public']['Tables']['class_bookings']['Row']
export type ClassWaitlist = Database['public']['Tables']['class_waitlist']['Row']
export type BookingAudit = Database['public']['Tables']['booking_audit']['Row']

export interface BookingWithDetails extends ClassBooking {
  class_schedules: {
    id: string
    start_datetime: string
    end_datetime: string
    classes: {
      title: string
      coach: string
      location: string
      difficulty_level: string
    }
  }
  user_subscriptions?: {
    id: string
    subscription_plans: {
      name: string
      type: string
    }
  }
}

export interface WaitlistWithDetails extends ClassWaitlist {
  class_schedules: {
    id: string
    start_datetime: string
    end_datetime: string
    classes: {
      title: string
      coach: string
      location: string
    }
  }
}

export interface BookingFormData {
  schedule_id: string
  subscription_id: string
  user_id?: string
}

export interface BookingStats {
  total_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  waitlist_entries: number
  completion_rate: number
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  no_show: 'Absent',
}

export interface BookingAvailability {
  available_spots: number
  waitlist_count: number
  is_full: boolean
  can_book: boolean
  can_waitlist: boolean
}