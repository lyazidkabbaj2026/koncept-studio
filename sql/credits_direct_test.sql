-- DIRECT TEST: Find out exactly why credits aren't updating
-- Run each section separately

-- 1. Check current subscription state
SELECT
  'current_subscription' as test_type,
  id,
  user_id,
  weekly_credits_used,
  status,
  plan_id,
  updated_at
FROM user_subscriptions
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5';

-- 2. Test the exact UPDATE that should work
-- UNCOMMENT AND RUN:
/*
UPDATE user_subscriptions
SET weekly_credits_used = weekly_credits_used + 1,
    updated_at = NOW()
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
  AND status = 'active';

SELECT ROW_COUNT() as rows_updated;
*/

-- 3. Check after manual update
SELECT
  'after_manual_update' as test_type,
  weekly_credits_used,
  updated_at
FROM user_subscriptions
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5';

-- 4. Test if user_subscriptions table has RLS (Row Level Security) enabled
SELECT
  'rls_check' as test_type,
  schemaname,
  tablename,
  rowsecurity,
  'RLS might be blocking updates' as note
FROM pg_tables
WHERE tablename = 'user_subscriptions';

-- 5. Check table permissions
SELECT
  'permissions_check' as test_type,
  has_table_privilege('public.user_subscriptions', 'UPDATE') as can_update,
  has_table_privilege('public.user_subscriptions', 'SELECT') as can_select;

-- 6. Try a simpler UPDATE with debugging
DO $$
DECLARE
  rows_affected INTEGER;
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT weekly_credits_used INTO current_credits
  FROM user_subscriptions
  WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';

  RAISE NOTICE 'Current weekly credits: %', current_credits;

  -- Try direct update
  UPDATE user_subscriptions
  SET weekly_credits_used = weekly_credits_used + 1
  WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RAISE NOTICE 'Rows affected: %', rows_affected;

  -- Check new value
  SELECT weekly_credits_used INTO current_credits
  FROM user_subscriptions
  WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';

  RAISE NOTICE 'New weekly credits: %', current_credits;
END $$;