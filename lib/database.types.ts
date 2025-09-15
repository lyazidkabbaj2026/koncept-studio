export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      booking_audit: {
        Row: {
          action: string
          admin_id: string | null
          booking_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_audit_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_audit_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "class_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_bookings: {
        Row: {
          created_at: string
          id: string
          schedule_id: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          schedule_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          schedule_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          cancellation_reason: string | null
          class_id: string
          created_at: string
          current_bookings: number
          end_datetime: string
          exception_reason: string | null
          id: string
          is_cancelled: boolean
          is_exception: boolean
          is_recurring: boolean
          parent_schedule_id: string | null
          recurrence_rule: string | null
          start_datetime: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          class_id: string
          created_at?: string
          current_bookings?: number
          end_datetime: string
          exception_reason?: string | null
          id?: string
          is_cancelled?: boolean
          is_exception?: boolean
          is_recurring?: boolean
          parent_schedule_id?: string | null
          recurrence_rule?: string | null
          start_datetime: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          class_id?: string
          created_at?: string
          current_bookings?: number
          end_datetime?: string
          exception_reason?: string | null
          id?: string
          is_cancelled?: boolean
          is_exception?: boolean
          is_recurring?: boolean
          parent_schedule_id?: string | null
          recurrence_rule?: string | null
          start_datetime?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_parent_schedule_id_fkey"
            columns: ["parent_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      class_waitlist: {
        Row: {
          created_at: string
          id: string
          position: number
          schedule_id: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          schedule_id: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          schedule_id?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_waitlist_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_waitlist_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          coach: string
          created_at: string
          description: string | null
          difficulty_level: string
          id: string
          location: string
          max_capacity: number
          title: string
          updated_at: string
        }
        Insert: {
          coach: string
          created_at?: string
          description?: string | null
          difficulty_level: string
          id?: string
          location: string
          max_capacity: number
          title: string
          updated_at?: string
        }
        Update: {
          coach?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          id?: string
          location?: string
          max_capacity?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          credits: number | null
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          name: string
          plan_type: string
          price: number
          updated_at: string
          weekly_credits: number | null
        }
        Insert: {
          created_at?: string
          credits?: number | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          plan_type: string
          price: number
          updated_at?: string
          weekly_credits?: number | null
        }
        Update: {
          credits?: number | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          price?: number
          updated_at?: string
          weekly_credits?: number | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          plan_id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          plan_id: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          credits_remaining: number
          credits_used: number
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
          weekly_credits_used: number
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
          weekly_credits_used?: number
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          weekly_credits_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      calendar_events_optimized: {
        Row: {
          class_id: string | null
          coach: string | null
          current_bookings: number | null
          description: string | null
          difficulty_level: string | null
          end_datetime: string | null
          id: string | null
          is_cancelled: boolean | null
          is_exception: boolean | null
          location: string | null
          max_capacity: number | null
          start_datetime: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      book_class: {
        Args: {
          schedule_id: string
          subscription_id: string
        }
        Returns: Json
      }
      cancel_booking: {
        Args: {
          booking_id: string
        }
        Returns: Json
      }
      can_user_book_class: {
        Args: {
          schedule_id: string
        }
        Returns: {
          can_book: boolean
          reason: string
        }
      }
      create_user_subscription: {
        Args: {
          plan_id: string
        }
        Returns: Json
      }
      get_admin_users_data: {
        Args: {
          page_offset?: number
          page_limit?: number
        }
        Returns: {
          id: string
          full_name: string
          email: string
          role: string
          created_at: string
          active_subscription: Json
          booking_stats: Json
        }[]
      }
      get_class_availability: {
        Args: {
          schedule_id: string
        }
        Returns: {
          available_spots: number
          waitlist_count: number
          is_full: boolean
        }
      }
      get_class_statistics: {
        Args: {
          class_id: string
        }
        Returns: Json
      }
      get_popular_classes: {
        Args: {
          limit_count: number
        }
        Returns: Json[]
      }
      get_subscription_usage: {
        Args: {
          subscription_id: string
        }
        Returns: Json
      }
      get_user_dashboard_data: {
        Args: {
          user_uuid: string
        }
        Returns: {
          user_bookings: Json
          user_subscriptions: Json
          upcoming_classes: Json
          user_progress: Json
        }[]
      }
      get_user_valid_subscription: {
        Args: {
          user_uuid: string
        }
        Returns: Json[]
      }
      is_admin: {
        Args: {
          user_uuid?: string
        }
        Returns: boolean
      }
      join_waitlist: {
        Args: {
          schedule_id: string
          subscription_id: string
        }
        Returns: Json
      }
      renew_subscription: {
        Args: {
          subscription_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}