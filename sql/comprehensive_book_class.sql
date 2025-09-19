-- COMPREHENSIVE book_class function that handles ALL subscription types
-- Implements proper business logic with priority: abonnement > carnet > no personal_training

CREATE OR REPLACE FUNCTION book_class(user_uuid uuid, schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  new_booking_id UUID;
  selected_subscription RECORD;
  existing_booking_id UUID;
  rows_affected INTEGER;
BEGIN
  -- Validate schedule exists
  IF NOT EXISTS (SELECT 1 FROM class_schedules WHERE id = schedule_uuid) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Créneau non trouvé');
  END IF;

  -- Get best available subscription with priority logic
  -- Priority: abonnement > carnet (personal_training cannot book online classes)
  SELECT us.*, sp.type as plan_type, sp.weekly_limit, sp.credits as plan_credits
  INTO selected_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND us.end_date >= NOW()
    AND sp.type IN ('abonnement', 'carnet')  -- Exclude personal_training
  ORDER BY
    CASE sp.type
      WHEN 'abonnement' THEN 1
      WHEN 'carnet' THEN 2
      ELSE 3
    END,
    us.end_date DESC
  LIMIT 1;

  -- Check if user has any valid subscription
  IF selected_subscription IS NULL THEN
    -- Check if user has only personal_training
    IF EXISTS (
      SELECT 1 FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid
        AND us.status = 'active'
        AND sp.type = 'personal_training'
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d''ajouter un abonnement ou un carnet pour effectuer une réservation.'
      );
    ELSE
      RETURN jsonb_build_object('success', false, 'message', 'Aucun abonnement actif trouvé');
    END IF;
  END IF;

  -- Validate subscription based on type
  IF selected_subscription.plan_type = 'abonnement' THEN
    -- Check weekly limit for abonnement
    IF selected_subscription.weekly_limit IS NOT NULL
       AND selected_subscription.weekly_credits_used >= selected_subscription.weekly_limit THEN
      RETURN jsonb_build_object('success', false, 'message', 'Limite hebdomadaire de séances atteinte');
    END IF;
  ELSIF selected_subscription.plan_type = 'carnet' THEN
    -- Check remaining credits for carnet
    IF selected_subscription.credits_remaining <= 0 THEN
      RETURN jsonb_build_object('success', false, 'message', 'Plus de crédits disponibles');
    END IF;
  END IF;

  -- Check for existing booking (any status) to prevent duplicates
  SELECT id INTO existing_booking_id
  FROM class_bookings
  WHERE user_id = user_uuid
    AND schedule_id = schedule_uuid
  ORDER BY created_at DESC
  LIMIT 1;

  -- If booking exists, update it to confirmed instead of creating new
  IF existing_booking_id IS NOT NULL THEN
    UPDATE class_bookings
    SET status = 'confirmed',
        subscription_id = selected_subscription.id,
        cancelled_at = NULL,
        updated_at = NOW()
    WHERE id = existing_booking_id
    RETURNING id INTO new_booking_id;
  ELSE
    -- Create new booking
    INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
    VALUES (user_uuid, schedule_uuid, selected_subscription.id, 'confirmed')
    RETURNING id INTO new_booking_id;
  END IF;

  -- Update credits based on subscription type
  IF selected_subscription.plan_type = 'abonnement' THEN
    -- For abonnement: increment weekly usage
    UPDATE user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1,
        updated_at = NOW()
    WHERE id = selected_subscription.id;
  ELSIF selected_subscription.plan_type = 'carnet' THEN
    -- For carnet: decrement credits_remaining, increment credits_used
    UPDATE user_subscriptions
    SET credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1,
        updated_at = NOW()
    WHERE id = selected_subscription.id;
  END IF;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', new_booking_id,
    'subscription_id', selected_subscription.id,
    'subscription_type', selected_subscription.plan_type,
    'credits_updated', rows_affected,
    'existing_booking_updated', (existing_booking_id IS NOT NULL),
    'message', 'Réservation confirmée'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erreur: ' || SQLERRM,
      'subscription_id', selected_subscription.id
    );
END;
$$;