import { createClient as createClientSideClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type WhatsAppLogInsert = Database['public']['Tables']['whatsapp_logs']['Insert']
type WhatsAppLogRow = Database['public']['Tables']['whatsapp_logs']['Row']

interface TwilioWhatsAppMessage {
  To: string
  From: string
  Body: string
}

interface TwilioResponse {
  sid: string
  status: string
  error_code?: string
  error_message?: string
}

interface SendWhatsAppMessageParams {
  phoneNumber: string
  message: string
  eventType: 'signup' | 'activation' | 'waitlist_promotion' | 'class_cancellation'
  userId?: string | null
}

interface SendWhatsAppMessageResult {
  success: boolean
  messageSid?: string
  error?: string
}

export class WhatsAppService {
  private twilioAccountSid: string
  private twilioAuthToken: string
  private twilioWhatsAppNumber: string
  private useServerClient: boolean

  constructor(useServerClient: boolean = false) {
    // Ensure required environment variables are present
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || ''
    this.useServerClient = useServerClient

    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioWhatsAppNumber) {
      console.error('Missing required Twilio environment variables')
    }
  }

  private async getSupabase() {
    if (this.useServerClient) {
      const { createClient: createServerClient } = await import('@/lib/supabase/server')
      return await createServerClient()
    } else {
      return createClientSideClient()
    }
  }

  /**
   * Normalize phone number to international format
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '')

    console.log('Normalizing phone number:', { original: phoneNumber, cleaned })

    // If it starts with 0 and appears to be Moroccan (9-10 digits after removing 0)
    if (cleaned.startsWith('0') && (cleaned.length === 9 || cleaned.length === 10)) {
      cleaned = '212' + cleaned.substring(1)
    }
    // If it doesn't start with country code and is 8-9 digits, assume Moroccan
    else if ((cleaned.length === 8 || cleaned.length === 9) && !cleaned.startsWith('212')) {
      cleaned = '212' + cleaned
    }
    // If it already starts with 212, keep it
    else if (cleaned.startsWith('212') && cleaned.length >= 11) {
      // Already formatted correctly
    }
    // If it starts with other country codes, keep as is
    else if (cleaned.length >= 10 && (cleaned.startsWith('1') || cleaned.startsWith('33') || cleaned.startsWith('44'))) {
      // Keep international numbers as is
    }

    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }

    console.log('Normalized phone number:', cleaned)
    return cleaned
  }

  /**
   * Validate if the service is properly configured
   */
  private isConfigured(): boolean {
    return !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppNumber)
  }

  /**
   * Log WhatsApp message to database
   */
  private async logMessage(params: {
    userId?: string | null
    eventType: WhatsAppLogInsert['event_type']
    phoneNumber: string
    messageContent: string
    status: 'pending' | 'success' | 'failed'
    errorMessage?: string | null
    twilioMessageSid?: string | null
  }): Promise<WhatsAppLogRow | null> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .insert({
          user_id: params.userId,
          event_type: params.eventType,
          phone_number: params.phoneNumber,
          message_content: params.messageContent,
          status: params.status,
          error_message: params.errorMessage,
          twilio_message_sid: params.twilioMessageSid
        })
        .select()
        .single()

      if (error) {
        console.error('Error logging WhatsApp message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error logging WhatsApp message:', error)
      return null
    }
  }

  /**
   * Send WhatsApp message via Twilio API
   */
  private async sendTwilioMessage(to: string, message: string): Promise<TwilioResponse | null> {
    if (!this.isConfigured()) {
      throw new Error('Twilio WhatsApp service is not properly configured')
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`

      const formData = new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${this.twilioWhatsAppNumber}`,
        Body: message
      })

      console.log('Sending WhatsApp message:', {
        to: `whatsapp:${to}`,
        from: `whatsapp:${this.twilioWhatsAppNumber}`,
        messagePreview: message.substring(0, 100) + '...'
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Twilio API error response:', responseData)

        // Provide more helpful error messages for common issues
        if (responseData.code === 63007) {
          throw new Error('WhatsApp number not configured properly. For trial accounts, use the WhatsApp Sandbox number (+14155238886) and ensure the recipient has joined the sandbox.')
        } else if (responseData.code === 21211) {
          throw new Error('Invalid To phone number. Ensure the number is in international format.')
        } else if (responseData.message?.includes('Channel')) {
          throw new Error('WhatsApp channel not found. For trial accounts, use the Twilio WhatsApp Sandbox number: +14155238886')
        }

        throw new Error(responseData.message || `Twilio API error: ${response.status}`)
      }

      console.log('WhatsApp message sent successfully:', responseData.sid)
      return responseData
    } catch (error) {
      console.error('Error sending Twilio WhatsApp message:', error)
      throw error
    }
  }

  /**
   * Send WhatsApp message and log the result
   */
  async sendMessage({
    phoneNumber,
    message,
    eventType,
    userId
  }: SendWhatsAppMessageParams): Promise<SendWhatsAppMessageResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber)

    // Log the pending message first
    const logEntry = await this.logMessage({
      userId,
      eventType,
      phoneNumber: normalizedPhone,
      messageContent: message,
      status: 'pending'
    })

    if (!this.isConfigured()) {
      const error = 'Twilio WhatsApp service is not properly configured'

      // Update log with error
      if (logEntry) {
        const supabase = await this.getSupabase()
        await supabase
          .from('whatsapp_logs')
          .update({
            status: 'failed',
            error_message: error
          })
          .eq('id', logEntry.id)
      }

      return { success: false, error }
    }

    try {
      // Send the message
      const response = await this.sendTwilioMessage(normalizedPhone, message)

      if (response) {
        // Update log with success
        if (logEntry) {
          const supabase = await this.getSupabase()
        await supabase
            .from('whatsapp_logs')
            .update({
              status: 'success',
              twilio_message_sid: response.sid
            })
            .eq('id', logEntry.id)
        }

        return {
          success: true,
          messageSid: response.sid
        }
      } else {
        throw new Error('No response from Twilio')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Update log with error
      if (logEntry) {
        const supabase = await this.getSupabase()
        await supabase
          .from('whatsapp_logs')
          .update({
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', logEntry.id)
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Get WhatsApp logs with optional filters
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
      const supabase = await this.getSupabase()
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

// Export singleton instance
export const whatsappService = new WhatsAppService()