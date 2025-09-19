-- BYPASS FUNCTION TEST: Update credits directly in database
-- This will tell us if the issue is with the function or the table

-- 1. Manual booking + credit update (all in one transaction)
DO $$
DECLARE
  new_booking_id UUID;
  user_subscription_id UUID;
  rows_affected INTEGER;
  schedule_to_test UUID := 'b994c0a8-8f51-4c2b-b5ae-ac106dda5f64'; -- Different schedule for testing
BEGIN
  -- Get subscription ID
  SELECT us.id INTO user_subscription_id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
    AND us.status = 'active'
    AND sp.type = 'abonnement';

  RAISE NOTICE 'Using subscription ID: %', user_subscription_id;

  -- Create booking
  INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES ('9c37f3a1-7bec-41af-8d48-64a27679fbd5', schedule_to_test, user_subscription_id, 'confirmed')
  RETURNING id INTO new_booking_id;

  RAISE NOTICE 'Created booking ID: %', new_booking_id;

  -- Update credits
  UPDATE user_subscriptions
  SET weekly_credits_used = weekly_credits_used + 1,
      updated_at = NOW()
  WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5'
    AND status = 'active';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RAISE NOTICE 'Credits update - rows affected: %', rows_affected;

  -- Check final state
  DECLARE
    final_credits INTEGER;
  BEGIN
    SELECT weekly_credits_used INTO final_credits
    FROM user_subscriptions
    WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';

    RAISE NOTICE 'Final weekly credits: %', final_credits;
  END;

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- 2. Check result
SELECT
  'final_check' as test_type,
  weekly_credits_used,
  updated_at,
  'Did the manual transaction work?' as question
FROM user_subscriptions
WHERE user_id = '9c37f3a1-7bec-41af-8d48-64a27679fbd5' AND status = 'active';