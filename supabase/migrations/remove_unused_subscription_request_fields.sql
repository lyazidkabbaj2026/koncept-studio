-- Remove unused columns from subscription_requests table
-- These fields were simplified out of the subscription request system
-- to make the process as simple as the signup plan selection

ALTER TABLE subscription_requests
DROP COLUMN IF EXISTS user_notes,
DROP COLUMN IF EXISTS preferred_start_date,
DROP COLUMN IF EXISTS budget_max,
DROP COLUMN IF EXISTS priority,
DROP COLUMN IF EXISTS contact_method,
DROP COLUMN IF EXISTS contacted_at;

-- Note: The following essential columns are kept:
-- - id, user_id, plan_id (core relationships)
-- - status, request_type (workflow management)
-- - notes, assigned_to, fulfilled_at, fulfilled_by, resulting_subscription_id (admin management)
-- - expires_at, requested_at, resolved_at (timing)
-- - created_at, updated_at, is_active (system fields)