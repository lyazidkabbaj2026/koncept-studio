import type { Database } from '@/lib/database.types'

export type Class = Database['public']['Tables']['classes']['Row']
export type ClassSchedule = Database['public']['Tables']['class_schedules']['Row']

export interface ClassWithSchedules extends Class {
  class_schedules: ClassSchedule[]
}

export interface ScheduleWithClass extends ClassSchedule {
  classes: Class
}

export interface CalendarEvent {
  id: string
  class_id: string
  title: string
  description: string | null
  coach: string
  location: string
  difficulty_level: string
  max_capacity: number
  start_datetime: string
  end_datetime: string
  current_bookings: number
  is_cancelled: boolean
  is_exception: boolean
}

export interface ClassFormData {
  title: string
  description?: string
  coach: string
  location: string
  difficulty_level: DifficultyLevel
  max_capacity: number
}

export interface ScheduleFormData {
  class_id: string
  start_datetime: string
  end_datetime: string
  is_recurring?: boolean
  recurrence_rule?: string
}

export interface ClassStats {
  total_classes: number
  active_schedules: number
  total_bookings: number
  average_attendance: number
  most_popular_class: string
}

export type DifficultyLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Tous niveaux'

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'Débutant',
  'Intermédiaire',
  'Avancé',
  'Tous niveaux',
]

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  'Débutant': 'bg-green-100 text-green-800',
  'Intermédiaire': 'bg-yellow-100 text-yellow-800',
  'Avancé': 'bg-red-100 text-red-800',
  'Tous niveaux': 'bg-blue-100 text-blue-800',
}