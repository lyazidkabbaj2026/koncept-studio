-- FINAL FIX: Removes FOR UPDATE from COUNT query
-- Apply this in Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION public.book_class(user_uuid uuid, schedule_uuid uuid) RETURNS jsonb AS $$

DECLARE
  booking_check JSONB;
  subscription_record RECORD;
  class_schedule_record RECORD;
  class_record RECORD;
  current_bookings INTEGER;
  new_booking_id UUID;
  waitlist_position INTEGER;
BEGIN
  -- Start a transaction and lock the schedule row
  SELECT * INTO class_schedule_record
  FROM public.class_schedules
  WHERE id = schedule_uuid
  FOR UPDATE;

  -- Check if schedule exists FIRST (before accessing fields)
  IF class_schedule_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'schedule_not_found',
      'message', 'Créneau non trouvé'
    );
  END IF;

  -- Now safely get class info for max_capacity
  SELECT * INTO class_record
  FROM public.classes c
  WHERE c.id = class_schedule_record.class_id;

  -- Check if class exists
  IF class_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_not_found',
      'message', 'Cours non trouvé'
    );
  END IF;

  -- Get current confirmed booking count (REMOVED FOR UPDATE - this was causing the error)
  SELECT COUNT(*) INTO current_bookings
  FROM public.class_bookings
  WHERE schedule_id = schedule_uuid
    AND status = 'confirmed';

  -- Check if user can book the class
  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;

  IF (booking_check->>'can_book')::boolean = false THEN
    RETURN booking_check;
  END IF;

  -- Get subscription info
  SELECT * INTO subscription_record
  FROM get_user_valid_subscription(user_uuid)
  LIMIT 1;

  -- Additional safety check for subscription
  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé'
    );
  END IF;

  -- Check if class is full
  IF current_bookings >= class_record.max_capacity THEN
    -- Class is full, add to waitlist
    SELECT COALESCE(MAX(position), 0) + 1 INTO waitlist_position
    FROM public.class_waitlist
    WHERE schedule_id = schedule_uuid;

    INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id, position)
    VALUES (user_uuid, schedule_uuid, subscription_record.id, waitlist_position);

    RETURN jsonb_build_object(
      'success', true,
      'status', 'waitlisted',
      'position', waitlist_position,
      'message', format('Classe complète. Vous êtes en position %s sur la liste d''attente.', waitlist_position)
    );
  END IF;

  -- Create the booking (class has space)
  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')
  RETURNING id INTO new_booking_id;

  -- Deduct credit atomically
  IF subscription_record.plan_type = 'abonnement' THEN
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1
    WHERE id = subscription_record.id;
  ELSE
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1
    WHERE id = subscription_record.id;
  END IF;

  -- Return success with updated subscription data
  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'message', 'Réservation confirmée',
    'updated_subscription', jsonb_build_object(
      'credits_remaining', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.credits_remaining ELSE subscription_record.credits_remaining - 1 END,
      'weekly_credits_used', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.weekly_credits_used + 1 ELSE subscription_record.weekly_credits_used END,
      'credits_used', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.credits_used ELSE subscription_record.credits_used + 1 END
    )
  );

EXCEPTION
  WHEN others THEN
    -- Log the error and return failure
    RAISE LOG 'Error in book_class function: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système. Veuillez réessayer.'
    );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;