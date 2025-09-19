-- URGENT: Diagnose why credits aren't being updated
-- Run each section separately to identify the issue

-- 1. Check current subscription state
SELECT
  'current_state' as check_type,
  us.id as subscription_id,
  us.weekly_credits_used,
  us.credits_remaining,
  us.credits_used,
  sp.type as plan_type,
  sp.weekly_limit,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';

-- 2. Check recent bookings with subscription IDs
SELECT
  'recent_bookings' as check_type,
  cb.id as booking_id,
  cb.subscription_id,
  cb.created_at,
  cb.status,
  cs.start_datetime
FROM class_bookings cb
JOIN class_schedules cs ON cb.schedule_id = cs.id
WHERE cb.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
ORDER BY cb.created_at DESC
LIMIT 3;

-- 3. Test the get_user_booking_subscription function
SELECT
  'booking_subscription_test' as check_type,
  *
FROM get_user_booking_subscription('9c37f3a1-7bec-41af-8d48-64a27679fbd5');

-- 4. Manual test of the UPDATE statement
-- First, let's see what subscription ID should be updated
SELECT
  'subscription_to_update' as check_type,
  us.id as subscription_id,
  us.weekly_credits_used as current_weekly,
  sp.type as plan_type
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active'
  AND sp.type = 'abonnement';

-- 5. Test manual UPDATE (UNCOMMENT TO RUN)
/*
UPDATE public.user_subscriptions
SET weekly_credits_used = weekly_credits_used + 1,
    updated_at = NOW()
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active'
  AND id IN (
    SELECT us.id
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
      AND us.status = 'active'
      AND sp.type = 'abonnement'
  );
*/

-- 6. Check after manual update
SELECT
  'after_manual_update' as check_type,
  us.weekly_credits_used,
  us.updated_at,
  sp.type as plan_type
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active';