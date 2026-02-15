import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Class = Database['public']['Tables']['classes']['Row']
type ClassSchedule = Database['public']['Tables']['class_schedules']['Row']

export interface ClassWithSchedule extends Class {
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

export class ClassService {
  private supabaseClient: ReturnType<typeof createClient> | null = null

  private get supabase() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient()
    }
    return this.supabaseClient
  }

  async getAllClasses(): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .order('title', { ascending: true })

    if (error) throw error
    return data
  }

  async getClassById(id: string): Promise<Class | null> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getClassSchedules(classId?: string): Promise<ScheduleWithClass[]> {
    let query = this.supabase
      .from('class_schedules')
      .select(`
        *,
        classes (*)
      `)
      .gte('start_datetime', new Date().toISOString())
      .eq('is_cancelled', false)
      .eq('is_exception', false)
      .order('start_datetime', { ascending: true })

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ScheduleWithClass[]
  }

  async getUpcomingClasses(limit = 10): Promise<CalendarEvent[]> {
    const { data, error } = await this.supabase
      .from('calendar_events_optimized')
      .select('*')
      .limit(limit)

    if (error) throw error
    return data
  }

  async getClassesInDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const { data, error } = await this.supabase
      .from('calendar_events_optimized')
      .select('*')
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)

    if (error) throw error
    return data
  }

  async searchClasses(query: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,coach.ilike.%${query}%`)
      .order('title', { ascending: true })

    if (error) throw error
    return data
  }

  async getClassesByDifficulty(difficulty: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('difficulty_level', difficulty)
      .order('title', { ascending: true })

    if (error) throw error
    return data
  }

  async getClassesByCoach(coach: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('coach', coach)
      .order('title', { ascending: true })

    if (error) throw error
    return data
  }

  // Admin methods
  async createClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>): Promise<Class> {
    const { data, error } = await this.supabase
      .from('classes')
      .insert(classData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateClass(id: string, updates: Partial<Class>): Promise<Class> {
    const { data, error } = await this.supabase
      .from('classes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteClass(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async createSchedule(scheduleData: Omit<ClassSchedule, 'id' | 'created_at' | 'updated_at' | 'current_bookings'>): Promise<ClassSchedule> {
    const { data, error } = await this.supabase
      .from('class_schedules')
      .insert({
        ...scheduleData,
        current_bookings: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateSchedule(id: string, updates: Partial<ClassSchedule>): Promise<ClassSchedule> {
    const { data, error } = await this.supabase
      .from('class_schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async cancelSchedule(id: string, reason?: string): Promise<ClassSchedule> {
    const { data, error } = await this.supabase
      .from('class_schedules')
      .update({
        is_cancelled: true,
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPopularClasses(limit = 10): Promise<Array<Class & { booking_count: number }>> {
    const { data, error } = await this.supabase.rpc('get_popular_classes', {
      limit_count: limit,
    })

    if (error) throw error
    return data
  }

  async getClassStats(classId: string) {
    const { data, error } = await this.supabase.rpc('get_class_statistics', {
      class_id: classId,
    })

    if (error) throw error
    return data
  }
}