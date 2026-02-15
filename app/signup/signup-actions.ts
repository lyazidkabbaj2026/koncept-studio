'use server'

import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateSignupMessage } from '@/lib/utils/whatsapp-messages'

/**
 * Send welcome WhatsApp message after successful signup
 * This should be called after user email confirmation or login
 */
export async function sendSignupWelcomeMessage(userId: string): Promise<{ success: boolean; error?: string }> {
  console.log('Starting sendSignupWelcomeMessage for user:', userId)

  try {
    const supabase = await createClient()

    // Since there's a DB trigger that creates the profile, let's wait for it to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get user profile from the database (should exist due to trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return { success: true } // Don't fail signup process
    }

    if (!profile) {
      console.log('No profile found, skipping WhatsApp message')
      return { success: true }
    }

    // Send WhatsApp welcome message if user has phone number
    if (profile.phone) {
      try {
        const message = generateSignupMessage(profile)
        await whatsappServerService.sendMessage({
          phoneNumber: profile.phone,
          message,
          eventType: 'signup',
          userId: userId
        })
        console.log('WhatsApp signup welcome message sent successfully')
        return { success: true }
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError)
        return { success: true } // Don't fail signup process
      }
    } else {
      console.log('User has no phone number, skipping WhatsApp message')
      return { success: true }
    }
  } catch (error) {
    console.error('Error in sendSignupWelcomeMessage:', error)
    return { success: true } // Always return success to not block signup
  }
}