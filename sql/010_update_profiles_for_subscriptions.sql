-- Update profiles table to better handle subscription workflow
-- Add new status for tracking user states in subscription process
ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'contacted', 'active', 'inactive')),
ADD COLUMN contact_notes TEXT;

-- Update existing plan_review_status to subscription_status for clarity
UPDATE public.profiles 
SET subscription_status = plan_review_status;

-- Drop old column (optional - can be done later to avoid breaking changes)
-- ALTER TABLE public.profiles DROP COLUMN plan_review_status;