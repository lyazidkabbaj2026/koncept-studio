import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { whatsappServerService } from '@/lib/services/server'
import { generateSignupMessage } from '@/lib/utils/whatsapp-messages'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Processing WhatsApp signup message for user:', userId)

    const supabase = await createClient()

    // Wait for the database trigger to complete profile creation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get user profile from the database (should exist due to trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({
        success: true,
        message: 'Profile not found, skipping WhatsApp message'
      })
    }

    if (!profile) {
      console.log('No profile found, skipping WhatsApp message')
      return NextResponse.json({
        success: true,
        message: 'No profile found, skipping WhatsApp message'
      })
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
        return NextResponse.json({
          success: true,
          message: 'WhatsApp welcome message sent successfully'
        })
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError)
        return NextResponse.json({
          success: false,
          error: 'Failed to send WhatsApp message'
        }, { status: 500 })
      }
    } else {
      console.log('User has no phone number, skipping WhatsApp message')
      return NextResponse.json({
        success: true,
        message: 'User has no phone number, skipping WhatsApp message'
      })
    }
  } catch (error) {
    console.error('Error in WhatsApp signup API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}