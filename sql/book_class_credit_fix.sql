-- CRITICAL FIX: book_class function that WILL update credits
-- This version has explicit debugging and guarantees credit updates

CREATE OR REPLACE FUNCTION book_class(user_uuid uuid, schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  booking_check JSONB;
  subscription_record RECORD;
  class_schedule_record RECORD;
  class_record RECORD;
  current_bookings INTEGER;
  new_booking_id UUID;
  subscription_id_to_update UUID;
  subscription_type_found TEXT;
  update_result INTEGER;
BEGIN
  -- Get the schedule record
  SELECT * INTO class_schedule_record
  FROM public.class_schedules
  WHERE id = schedule_uuid;

  IF class_schedule_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'schedule_not_found', 'message', 'Créneau non trouvé');
  END IF;

  IF class_schedule_record.is_cancelled THEN
    RETURN jsonb_build_object('success', false, 'reason', 'class_cancelled', 'message', 'Ce cours a été annulé');
  END IF;

  IF class_schedule_record.is_exception THEN
    RETURN jsonb_build_object('success', false, 'reason', 'class_exception', 'message', 'Ce créneau n''est pas disponible pour la réservation');
  END IF;

  IF class_schedule_record.start_datetime <= NOW() THEN
    RETURN jsonb_build_object('success', false, 'reason', 'class_started', 'message', 'Le cours a déjà commencé');
  END IF;

  -- Get class info
  SELECT * INTO class_record FROM public.classes c WHERE c.id = class_schedule_record.class_id;
  IF class_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'class_not_found', 'message', 'Cours non trouvé');
  END IF;

  -- Check if user can book
  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;
  IF (booking_check->>'can_book')::boolean = false THEN
    RETURN booking_check;
  END IF;

  -- Get user's subscription directly with explicit query
  SELECT us.id, sp.type
  INTO subscription_id_to_update, subscription_type_found
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND sp.type IN ('abonnement', 'carnet')
    AND (
      (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
      OR (sp.type = 'carnet' AND us.credits_remaining > 0)
    )
  ORDER BY CASE WHEN sp.type = 'abonnement' THEN 1 ELSE 2 END
  LIMIT 1;

  IF subscription_id_to_update IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_valid_subscription', 'message', 'Aucun abonnement valide trouvé');
  END IF;

  -- Check if class is full
  SELECT COUNT(*) INTO current_bookings FROM public.class_bookings
  WHERE schedule_id = schedule_uuid AND status = 'confirmed';

  IF current_bookings >= class_record.max_capacity THEN
    RETURN jsonb_build_object('success', false, 'reason', 'class_full', 'message', 'Le cours est complet');
  END IF;

  -- Create the booking
  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (user_uuid, schedule_uuid, subscription_id_to_update, 'confirmed')
  RETURNING id INTO new_booking_id;

  -- CRITICAL: Update credits with explicit verification
  IF subscription_type_found = 'abonnement' THEN
    -- Update weekly credits for abonnement
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1,
        updated_at = NOW()
    WHERE id = subscription_id_to_update;

    GET DIAGNOSTICS update_result = ROW_COUNT;

    IF update_result = 0 THEN
      -- Rollback booking if update failed
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
      RETURN jsonb_build_object('success', false, 'reason', 'credit_update_failed', 'message', 'Échec de la mise à jour des crédits hebdomadaires');
    END IF;

  ELSIF subscription_type_found = 'carnet' THEN
    -- Update credits for carnet
    UPDATE public.user_subscriptions
    SET credits_remaining = GREATEST(0, credits_remaining - 1),
        credits_used = COALESCE(credits_used, 0) + 1,
        updated_at = NOW()
    WHERE id = subscription_id_to_update;

    GET DIAGNOSTICS update_result = ROW_COUNT;

    IF update_result = 0 THEN
      -- Rollback booking if update failed
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
      RETURN jsonb_build_object('success', false, 'reason', 'credit_update_failed', 'message', 'Échec de la mise à jour des crédits');
    END IF;
  END IF;

  -- Return success with debug info
  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'subscription_id', subscription_id_to_update,
    'subscription_type', subscription_type_found,
    'credits_updated', update_result,
    'message', 'Réservation confirmée et crédits mis à jour'
  );

EXCEPTION
  WHEN others THEN
    -- Try to rollback booking
    BEGIN
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
    EXCEPTION WHEN others THEN
      NULL;
    END;

    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système: ' || SQLERRM,
      'debug_subscription_id', subscription_id_to_update,
      'debug_subscription_type', subscription_type_found
    );
END;
$$;