-- Fix weekly credits for the existing booking
-- Run this in Supabase SQL Editor

-- 1. First, let's see the current state
SELECT
  'before_fix' as status,
  us.weekly_credits_used,
  us.credits_remaining,
  us.updated_at,
  sp.type as plan_type,
  sp.weekly_limit
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';

-- 2. Check if the booking exists and get subscription_id
SELECT
  'booking_verification' as status,
  cb.id as booking_id,
  cb.subscription_id,
  cb.created_at as booking_time,
  cs.start_datetime as class_time,
  c.title as class_title
FROM class_bookings cb
JOIN class_schedules cs ON cb.schedule_id = cs.id
JOIN classes c ON cs.class_id = c.id
WHERE cb.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND cb.schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
  AND cb.status = 'confirmed';

-- 3. Fix the weekly credits for abonnement subscription
UPDATE user_subscriptions
SET weekly_credits_used = weekly_credits_used + 1,
    updated_at = NOW()
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active'
  AND id IN (
    SELECT DISTINCT cb.subscription_id
    FROM class_bookings cb
    WHERE cb.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
      AND cb.schedule_id = '36409943-0519-4fda-935c-b65a1aa5f1c5'
      AND cb.status = 'confirmed'
  )
  AND weekly_credits_used = 0; -- Only update if it's still 0

-- 4. Verify the fix
SELECT
  'after_fix' as status,
  us.weekly_credits_used,
  us.credits_remaining,
  us.updated_at,
  sp.type as plan_type,
  sp.weekly_limit,
  CASE
    WHEN us.weekly_credits_used > 0 THEN 'SUCCESS: Weekly credits updated!'
    ELSE 'ISSUE: Weekly credits still 0'
  END as fix_result
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';

-- 5. Show remaining weekly credits available
SELECT
  'credits_summary' as status,
  sp.weekly_limit - us.weekly_credits_used as remaining_weekly_credits,
  sp.weekly_limit as total_weekly_limit,
  us.weekly_credits_used as used_this_week,
  sp.type as subscription_type
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';