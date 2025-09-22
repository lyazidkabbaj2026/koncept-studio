-- Enable RLS on subscription_requests table
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscription requests
CREATE POLICY "Users can view their own subscription requests"
ON subscription_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to create their own subscription requests
CREATE POLICY "Users can create their own subscription requests"
ON subscription_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own subscription requests
CREATE POLICY "Users can update their own subscription requests"
ON subscription_requests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own subscription requests
CREATE POLICY "Users can delete their own subscription requests"
ON subscription_requests FOR DELETE
USING (auth.uid() = user_id);

-- Policy for admins to manage all subscription requests
CREATE POLICY "Admins can manage all subscription requests"
ON subscription_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);