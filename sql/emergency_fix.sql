-- EMERGENCY FIX: Address both critical issues immediately
-- Run each section separately

-- 1. FIRST - Check what's happening with credits update
SELECT
  'credits_debug' as debug_type,
  id as subscription_id,
  weekly_credits_used,
  updated_at,
  status
FROM user_subscriptions
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active';

-- 2. Check current bookings (to see the duplicate issue)
SELECT
  'current_bookings' as debug_type,
  id as booking_id,
  status,
  cancelled_at,
  created_at
FROM class_bookings
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
ORDER BY created_at DESC;

-- 3. MANUAL CREDIT UPDATE (if credits are still 0)
-- UNCOMMENT AND RUN THIS:
/*
UPDATE user_subscriptions
SET weekly_credits_used = weekly_credits_used + 1,
    updated_at = NOW()
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active';

SELECT 'after_manual_update' as result, weekly_credits_used
FROM user_subscriptions
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';
*/

-- 4. CLEAN UP DUPLICATE BOOKINGS (keep only the latest confirmed)
-- UNCOMMENT AND RUN THIS:
/*
DELETE FROM class_bookings
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
  AND id NOT IN (
    SELECT id FROM class_bookings
    WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
      AND schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
    ORDER BY created_at DESC
    LIMIT 1
  );
*/