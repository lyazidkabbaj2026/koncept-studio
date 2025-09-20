'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateWaitlistPromotionMessage } from '@/lib/utils/whatsapp-messages'

export async function sendWaitlistPromotionNotification(promotedUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get the promoted user's profile information
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', promotedUserId)
      .single()

    if (userError || !user) {
      console.error('Error fetching promoted user profile:', userError)
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // Send WhatsApp notification if user has phone number
    if (user.phone) {
      try {
        const message = generateWaitlistPromotionMessage(user)
        await whatsappServerService.sendMessage({
          phoneNumber: user.phone,
          message,
          eventType: 'waitlist_promotion',
          userId: user.id
        })
        console.log('WhatsApp auto-promotion notification sent successfully for user:', user.id)
        return { success: true }
      } catch (error) {
        console.error('Error sending WhatsApp auto-promotion notification:', error)
        return { success: false, error: 'Erreur lors de l\'envoi de la notification' }
      }
    } else {
      console.log('User has no phone number, skipping WhatsApp notification for user:', user.id)
      return { success: true }
    }
  } catch (error) {
    console.error('Error in sendWaitlistPromotionNotification:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}