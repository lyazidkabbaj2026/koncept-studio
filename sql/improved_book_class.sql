-- Improved book_class function with better subscription credit handling
-- Run this in Supabase SQL Editor

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
  rows_updated INTEGER;
BEGIN
  -- Get the schedule record
  SELECT * INTO class_schedule_record
  FROM public.class_schedules
  WHERE id = schedule_uuid;

  -- Check if schedule exists
  IF class_schedule_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'schedule_not_found',
      'message', 'Créneau non trouvé'
    );
  END IF;

  -- Check if class is cancelled
  IF class_schedule_record.is_cancelled THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_cancelled',
      'message', 'Ce cours a été annulé'
    );
  END IF;

  -- Check if class is an exception
  IF class_schedule_record.is_exception THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_exception',
      'message', 'Ce créneau n''est pas disponible pour la réservation'
    );
  END IF;

  -- Check if class has started
  IF class_schedule_record.start_datetime <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_started',
      'message', 'Le cours a déjà commencé'
    );
  END IF;

  -- Get class info for max_capacity
  SELECT * INTO class_record
  FROM public.classes c
  WHERE c.id = class_schedule_record.class_id;

  IF class_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_not_found',
      'message', 'Cours non trouvé'
    );
  END IF;

  -- Check if user can book the class
  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;

  IF (booking_check->>'can_book')::boolean = false THEN
    RETURN booking_check;
  END IF;

  -- Get best subscription for booking
  SELECT * INTO subscription_record
  FROM get_user_booking_subscription(user_uuid)
  LIMIT 1;

  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé'
    );
  END IF;

  -- Get current confirmed booking count
  SELECT COUNT(*) INTO current_bookings
  FROM public.class_bookings
  WHERE schedule_id = schedule_uuid
    AND status = 'confirmed';

  -- Check if class is full
  IF current_bookings >= class_record.max_capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_full',
      'message', 'Le cours est complet'
    );
  END IF;

  -- Create the booking
  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')
  RETURNING id INTO new_booking_id;

  -- Update subscription credits based on type with explicit verification
  IF subscription_record.plan_type = 'abonnement' THEN
    -- For abonnement: increment weekly usage
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1,
        updated_at = NOW()
    WHERE id = subscription_record.id;

    -- Verify the update happened
    GET DIAGNOSTICS rows_updated = ROW_COUNT;

    IF rows_updated = 0 THEN
      -- Rollback the booking if subscription update failed
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'subscription_update_failed',
        'message', 'Erreur lors de la mise à jour de l''abonnement'
      );
    END IF;

  ELSIF subscription_record.plan_type = 'carnet' THEN
    -- For carnet: deduct credit
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining - 1,
        credits_used = COALESCE(credits_used, 0) + 1,
        updated_at = NOW()
    WHERE id = subscription_record.id;

    -- Verify the update happened
    GET DIAGNOSTICS rows_updated = ROW_COUNT;

    IF rows_updated = 0 THEN
      -- Rollback the booking if subscription update failed
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'subscription_update_failed',
        'message', 'Erreur lors de la mise à jour de l''abonnement'
      );
    END IF;
  END IF;

  -- Return success with updated subscription info
  DECLARE
    updated_subscription RECORD;
  BEGIN
    SELECT us.*, sp.type as plan_type INTO updated_subscription
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.id = subscription_record.id;

    RETURN jsonb_build_object(
      'success', true,
      'status', 'confirmed',
      'booking_id', new_booking_id,
      'subscription_type', subscription_record.plan_type,
      'message', 'Réservation confirmée',
      'updated_subscription', jsonb_build_object(
        'id', updated_subscription.id,
        'credits_remaining', updated_subscription.credits_remaining,
        'weekly_credits_used', updated_subscription.weekly_credits_used,
        'credits_used', updated_subscription.credits_used,
        'weekly_limit', subscription_record.weekly_limit
      )
    );
  END;

EXCEPTION
  WHEN others THEN
    -- If anything goes wrong, try to rollback the booking
    BEGIN
      DELETE FROM public.class_bookings WHERE id = new_booking_id;
    EXCEPTION
      WHEN others THEN
        NULL; -- Ignore cleanup errors
    END;

    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système: ' || SQLERRM
    );
END;
$$;