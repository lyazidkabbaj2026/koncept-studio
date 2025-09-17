# WhatsApp Setup Guide for Twilio Trial Account

## Current Issue
The error "Twilio could not find a Channel with the specified From address" occurs because the WhatsApp number `+16365567005` is not properly configured for WhatsApp messaging.

## Solution: Use Twilio WhatsApp Sandbox

For trial accounts, you must use the **Twilio WhatsApp Sandbox**.

### Step 1: Get Sandbox Number
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** > **Try it out** > **Send a WhatsApp message**
3. You'll see a sandbox number (usually `+14155238886`)

### Step 2: Update Environment Variables
Replace your current `.env.local` with:

```env
TWILIO_ACCOUNT_SID=AC18a7609f08d723ad8dff5b0c48b004fe
TWILIO_AUTH_TOKEN=707cbe71e0edc82df3251bf7500a8497
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Step 3: Join WhatsApp Sandbox (IMPORTANT)
**Before any WhatsApp messages can be sent to a number, that number must join the sandbox:**

1. From your WhatsApp (the number `+21270604217`), send a message to `+14155238886`
2. The message should be: `join <your-sandbox-keyword>`
   - Your sandbox keyword is shown in the Twilio Console
   - Example: `join daughter-harbor` (replace with your actual keyword)

### Step 4: Test the Flow
1. Make sure the sandbox number is configured in `.env.local`
2. Ensure `+21270604217` has joined the sandbox by sending the join message
3. Create a new user account with phone number `070604217`
4. Complete the signup flow with plan selection

## Alternative: Production WhatsApp API
For production use (not trial), you need:
1. WhatsApp Business API approval from Meta
2. A verified WhatsApp Business phone number
3. Additional Twilio configuration

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

### Phone Number Formatting
- Moroccan numbers like `070604217` are automatically formatted to `+21270604217`
- Ensure the number is in the database exactly as entered by the user

### Verification Steps
1. Check Twilio Console for sandbox configuration
2. Verify the phone number has joined the sandbox
3. Check `/admin/whatsapp-logs` for message attempts
4. Look for console logs with debugging information