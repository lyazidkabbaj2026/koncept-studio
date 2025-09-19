-- CRITICAL DEBUG: Find out why subscription UPDATE is failing
-- Run each query separately to trace the issue

-- 1. Check what subscription ID the function is trying to use
SELECT
  'step1_subscription_lookup' as debug_step,
  us.id as subscription_id,
  sp.type as subscription_type,
  us.weekly_credits_used,
  sp.weekly_limit,
  us.status,
  us.end_date,
  (us.end_date > NOW()) as end_date_valid,
  (us.weekly_credits_used < sp.weekly_limit) as credits_available
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND us.status = 'active'
  AND us.end_date > NOW()
  AND sp.type IN ('abonnement', 'carnet')
  AND (
    (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
    OR (sp.type = 'carnet' AND us.credits_remaining > 0)
  )
ORDER BY CASE WHEN sp.type = 'abonnement' THEN 1 ELSE 2 END;

-- 2. Test the exact UPDATE statement that's failing
-- Get the subscription ID first
WITH target_subscription AS (
  SELECT us.id as sub_id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND sp.type = 'abonnement'
    AND us.weekly_credits_used < sp.weekly_limit
  LIMIT 1
)
SELECT
  'step2_update_test' as debug_step,
  sub_id,
  'This is the subscription ID that should be updated' as note
FROM target_subscription;

-- 3. Check if the subscription record exists and can be updated
SELECT
  'step3_direct_subscription_check' as debug_step,
  id,
  weekly_credits_used,
  updated_at,
  status,
  'Can this be updated? Check if ID exists' as note
FROM user_subscriptions
WHERE id = (
  SELECT us.id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND sp.type = 'abonnement'
  LIMIT 1
);

-- 4. Manual test of the UPDATE (UNCOMMENT TO RUN)
/*
DO $$
DECLARE
  target_sub_id UUID;
  rows_affected INTEGER;
BEGIN
  -- Get the subscription ID
  SELECT us.id INTO target_sub_id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND sp.type = 'abonnement'
  LIMIT 1;

  RAISE NOTICE 'Trying to update subscription ID: %', target_sub_id;

  -- Try the update
  UPDATE public.user_subscriptions
  SET weekly_credits_used = weekly_credits_used + 1,
      updated_at = NOW()
  WHERE id = target_sub_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RAISE NOTICE 'Rows affected by UPDATE: %', rows_affected;
END $$;
*/