-- Create credit_change_logs table to track all credit adjustments made by admins
CREATE TABLE IF NOT EXISTS credit_change_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User whose credits were changed
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- The subscription that was modified
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,

  -- Admin who made the change
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  -- Credit change details
  previous_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  change_amount NUMERIC NOT NULL,

  -- Context information
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('abonnement', 'carnet', 'personal_training')),
  field_modified TEXT NOT NULL CHECK (field_modified IN ('credits_remaining', 'weekly_credits_used')),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_credit_change_logs_user_id ON credit_change_logs(user_id);
CREATE INDEX idx_credit_change_logs_admin_id ON credit_change_logs(admin_id);
CREATE INDEX idx_credit_change_logs_subscription_id ON credit_change_logs(subscription_id);
CREATE INDEX idx_credit_change_logs_created_at ON credit_change_logs(created_at DESC);

-- Enable RLS
ALTER TABLE credit_change_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view logs related to their own credits
CREATE POLICY "Users can view their own credit change logs"
ON credit_change_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all credit change logs
CREATE POLICY "Admins can view all credit change logs"
ON credit_change_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Only admins can insert credit change logs
CREATE POLICY "Admins can insert credit change logs"
ON credit_change_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
