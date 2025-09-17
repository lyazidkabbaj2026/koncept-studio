import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type WhatsAppLogRow = Database['public']['Tables']['whatsapp_logs']['Row']

export class WhatsAppClientService {
  /**
   * Get WhatsApp logs with optional filters (client-side only)
   */
  async getLogs({
    eventType,
    status,
    limit = 50,
    offset = 0
  }: {
    eventType?: WhatsAppLogRow['event_type']
    status?: WhatsAppLogRow['status']
    limit?: number
    offset?: number
  } = {}): Promise<{
    logs: (WhatsAppLogRow & { profiles: { full_name: string | null; email: string } | null })[]
    count: number
  }> {
    try {
      const supabase = createClient()
      let query = supabase
        .from('whatsapp_logs')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (eventType) {
        query = query.eq('event_type', eventType)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching WhatsApp logs:', error)
        return { logs: [], count: 0 }
      }

      return {
        logs: data || [],
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching WhatsApp logs:', error)
      return { logs: [], count: 0 }
    }
  }
}

// Export singleton instance for client-side use
export const whatsappClientService = new WhatsAppClientService()