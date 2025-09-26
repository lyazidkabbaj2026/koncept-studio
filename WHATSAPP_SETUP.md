# WhatsApp Setup Guide for Wasender API

## Overview
This application uses Wasender API for WhatsApp messaging instead of Twilio. Wasender provides a simpler, more reliable WhatsApp API integration.

## Setup Requirements

### Step 1: Get Wasender Account
1. Go to [Wasender API](https://wasenderapi.com/)
2. Create an account and purchase a subscription
3. Connect your WhatsApp number to create a session

### Step 2: Get API Credentials
1. In your Wasender dashboard, get your **API Key** (Personal Access Token)
2. Note your **Base URL**: `https://wasenderapi.com/api`

### Step 3: Update Environment Variables
Add to your `.env.local`:

```env
# Wasender API Configuration for WhatsApp notifications
WASENDER_API_KEY=your_wasender_api_key_here
WASENDER_BASE_URL=https://wasenderapi.com/api
```

### Step 4: Test the Integration
1. Make sure your environment variables are configured
2. Restart your development server (`npm run dev`)
3. Test by creating a new user account and completing signup
4. Check `/admin/whatsapp-logs` for message delivery status

## Production Setup
For production deployment:
1. Ensure your Wasender subscription supports production volume
2. Update `.env.production` with your production API key
3. Monitor the `/admin/whatsapp-logs` page for delivery status

## Troubleshooting

### Database Permission Error
If you see "new row violates row-level security policy", run this SQL:

```sql
-- Fix RLS policies for whatsapp_logs table
DROP POLICY IF EXISTS "Admins can view all WhatsApp logs" ON whatsapp_logs;

CREATE POLICY "System can insert WhatsApp logs" ON whatsapp_logs
    FOR INSERT USING (true);

CREATE POLICY "Users can view own logs, admins view all" ON whatsapp_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can modify WhatsApp logs" ON whatsapp_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

### Database Schema Update
If you're migrating from Twilio, update your `whatsapp_logs` table:

```sql
-- Add new Wasender columns
ALTER TABLE whatsapp_logs
ADD COLUMN IF NOT EXISTS wasender_message_id TEXT,
ADD COLUMN IF NOT EXISTS api_response TEXT;

-- Optional: Remove old Twilio column
-- ALTER TABLE whatsapp_logs DROP COLUMN IF EXISTS twilio_message_sid;
```

### Common Issues

#### API Key Invalid
- Verify your `WASENDER_API_KEY` is correct
- Check that your Wasender subscription is active
- Ensure the API key has proper permissions

#### Phone Number Formatting
- Moroccan numbers like `070604217` are automatically formatted to `+21270604217`
- International format is required for WhatsApp delivery

#### Network Issues
- Verify the base URL: `https://wasenderapi.com/api`
- Check that your server can reach external APIs
- Monitor network connectivity

### Verification Steps
1. Check Wasender dashboard for active sessions
2. Verify API key is working with a test call
3. Check `/admin/whatsapp-logs` for message delivery status
4. Monitor console logs for debugging information
5. Use the "Renvoyer" button to retry failed messages

### Resend Failed Messages
The admin panel now includes a resend feature:
1. Go to `/admin/whatsapp-logs`
2. Find failed messages (marked with red status)
3. Click "Renvoyer" to retry sending
4. Monitor the updated status