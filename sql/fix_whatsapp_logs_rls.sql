-- Fix RLS policies for whatsapp_logs table
-- The system needs to insert logs for all authenticated users, not just admins

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can view all WhatsApp logs" ON whatsapp_logs;

-- Create new policies
-- Allow service role and authenticated users to insert logs
-- For INSERT, we need WITH CHECK instead of USING
CREATE POLICY "System can insert WhatsApp logs" ON whatsapp_logs
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own logs, and admins to view all logs
CREATE POLICY "Users can view own logs, admins view all" ON whatsapp_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update logs
CREATE POLICY "Admins can update WhatsApp logs" ON whatsapp_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete logs
CREATE POLICY "Admins can delete WhatsApp logs" ON whatsapp_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );