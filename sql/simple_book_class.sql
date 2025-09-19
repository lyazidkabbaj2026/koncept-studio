-- ULTRA SIMPLE book_class function - minimal complexity
-- This should work without any issues

CREATE OR REPLACE FUNCTION book_class(user_uuid uuid, schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  new_booking_id UUID;
  user_subscription_id UUID;
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

  -- Check if user already booked this class
  IF EXISTS (
    SELECT 1 FROM class_bookings
    WHERE user_id = user_uuid
      AND schedule_id = schedule_uuid
      AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vous avez déjà réservé ce cours');
  END IF;

  -- Create booking
  INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (user_uuid, schedule_uuid, user_subscription_id, 'confirmed')
  RETURNING id INTO new_booking_id;

  -- Update weekly credits - DIRECT UPDATE
  UPDATE user_subscriptions
  SET weekly_credits_used = weekly_credits_used + 1,
      updated_at = NOW()
  WHERE id = user_subscription_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', new_booking_id,
    'subscription_id', user_subscription_id,
    'credits_updated', rows_affected,
    'message', 'Réservation confirmée'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erreur: ' || SQLERRM,
      'subscription_id', user_subscription_id
    );
END;
$$;