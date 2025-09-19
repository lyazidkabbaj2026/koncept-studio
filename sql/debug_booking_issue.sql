-- Diagnostic queries to check booking and subscription state
-- Run these in Supabase SQL Editor to debug the weekly credits issue

-- 1. Check current user subscription state
SELECT
  'current_subscription_state' as query_type,
  us.*,
  sp.type as plan_type,
  sp.weekly_limit
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';

-- 2. Check recent bookings for this user
SELECT
  'recent_bookings' as query_type,
  cb.*,
  cs.start_datetime,
  c.title as class_title
FROM class_bookings cb
JOIN class_schedules cs ON cb.schedule_id = cs.id
JOIN classes c ON cs.class_id = c.id
WHERE cb.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
ORDER BY cb.created_at DESC
LIMIT 5;

-- 3. Check if the specific booking exists
SELECT
  'specific_booking_check' as query_type,
  cb.*
FROM class_bookings cb
WHERE cb.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND cb.schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
  AND cb.status = 'confirmed';

-- 4. Manual fix: Update weekly credits if needed
-- Uncomment and run this if weekly_credits_used is still 0 after confirming booking exists

/*
UPDATE user_subscriptions
SET weekly_credits_used = weekly_credits_used + 1,
    updated_at = NOW()
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active'
  AND id IN (
    SELECT DISTINCT subscription_id
    FROM class_bookings
    WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
      AND schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
      AND status = 'confirmed'
  );
*/

-- 5. Test the function directly to see what it returns
SELECT 'test_booking_function' as query_type,
  book_class('9c37f3a1-7bec-41af-8d48-64a27679fbd5', '36409943-0519-4fda-935c-b65a1aa5f1c5') as result;