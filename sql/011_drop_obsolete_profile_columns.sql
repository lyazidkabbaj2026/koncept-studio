-- Remove obsolete columns from profiles table
-- plan_review_status: replaced by subscription_status
-- contact_notes: no longer needed

-- Drop the obsolete columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS plan_review_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS contact_notes;