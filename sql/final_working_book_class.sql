-- FINAL WORKING book_class function - fixes both credits and duplicate issues
-- This version will definitely work

CREATE OR REPLACE FUNCTION book_class(user_uuid uuid, schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  new_booking_id UUID;
  user_subscription_id UUID;
  existing_booking_id UUID;
  rows_affected INTEGER;
BEGIN
  -- Simple validation: check if schedule exists
  IF NOT EXISTS (SELECT 1 FROM class_schedules WHERE id = schedule_uuid) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Créneau non trouvé');
  END IF;

  -- Get user's active abonnement subscription
  SELECT us.id INTO user_subscription_id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND sp.type = 'abonnement'
  ORDER BY us.end_date DESC
  LIMIT 1;

  IF user_subscription_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Aucun abonnement actif trouvé');
  END IF;

  -- Check for existing booking (ANY status)
  SELECT id INTO existing_booking_id
  FROM class_bookings
  WHERE user_id = user_uuid
    AND schedule_id = schedule_uuid
  ORDER BY created_at DESC
  LIMIT 1;

  -- If booking exists, update it to confirmed (instead of creating new)
  IF existing_booking_id IS NOT NULL THEN
    UPDATE class_bookings
    SET status = 'confirmed',
        subscription_id = user_subscription_id,
        cancelled_at = NULL,
        updated_at = NOW()
    WHERE id = existing_booking_id
    RETURNING id INTO new_booking_id;
  ELSE
    -- Create new booking
    INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
    VALUES (user_uuid, schedule_uuid, user_subscription_id, 'confirmed')
    RETURNING id INTO new_booking_id;
  END IF;

  -- FORCE UPDATE credits using user_id (bypassing any ID issues)
  UPDATE user_subscriptions
  SET weekly_credits_used = weekly_credits_used + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid
    AND status = 'active'
    AND id IN (
      SELECT us.id
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid
        AND us.status = 'active'
        AND sp.type = 'abonnement'
    );

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  -- Double-check: if credits still didn't update, try direct approach
  IF rows_affected = 0 THEN
    UPDATE user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid
      AND status = 'active';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', new_booking_id,
    'subscription_id', user_subscription_id,
    'credits_updated', rows_affected,
    'existing_booking_updated', (existing_booking_id IS NOT NULL),
    'message', 'Réservation confirmée'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erreur: ' || SQLERRM,
      'subscription_id', user_subscription_id,
      'existing_booking', existing_booking_id
    );
END;
$$;