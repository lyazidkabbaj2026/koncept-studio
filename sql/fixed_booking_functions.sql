-- Fixed booking functions based on actual database structure
-- Run this in Supabase SQL Editor

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_valid_subscriptions(uuid);
DROP FUNCTION IF EXISTS get_user_booking_subscription(uuid);
DROP FUNCTION IF EXISTS can_user_book_class(uuid, uuid);
DROP FUNCTION IF EXISTS book_class(uuid, uuid);

-- 1. Simple function to get user's valid subscriptions
CREATE OR REPLACE FUNCTION get_user_valid_subscriptions(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  plan_id uuid,
  plan_type text,
  credits_remaining integer,
  weekly_credits_used integer,
  weekly_limit integer,
  status text,
  end_date timestamp with time zone,
  priority integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.plan_id,
    sp.type as plan_type,
    us.credits_remaining,
    us.weekly_credits_used,
    sp.weekly_limit,
    us.status,
    us.end_date,
    CASE
      WHEN sp.type = 'abonnement' THEN 1
      WHEN sp.type = 'carnet' THEN 2
      WHEN sp.type = 'personal_training' THEN 3
      ELSE 4
    END as priority
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
      (sp.type = 'carnet' AND us.credits_remaining > 0)
      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
      OR sp.type = 'personal_training'
    )
  ORDER BY priority ASC, us.end_date DESC;
END;
$$;

-- 2. Function to get best subscription for booking
CREATE OR REPLACE FUNCTION get_user_booking_subscription(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  plan_id uuid,
  plan_type text,
  credits_remaining integer,
  weekly_credits_used integer,
  weekly_limit integer,
  status text,
  end_date timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try abonnement first
  RETURN QUERY
  SELECT
    sub.id,
    sub.plan_id,
    sub.plan_type,
    sub.credits_remaining,
    sub.weekly_credits_used,
    sub.weekly_limit,
    sub.status,
    sub.end_date
  FROM get_user_valid_subscriptions(user_uuid) sub
  WHERE sub.plan_type = 'abonnement'
    AND sub.weekly_credits_used < sub.weekly_limit
  LIMIT 1;

  -- If abonnement not found or at limit, try carnet
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      sub.id,
      sub.plan_id,
      sub.plan_type,
      sub.credits_remaining,
      sub.weekly_credits_used,
      sub.weekly_limit,
      sub.status,
      sub.end_date
    FROM get_user_valid_subscriptions(user_uuid) sub
    WHERE sub.plan_type = 'carnet'
      AND sub.credits_remaining > 0
    LIMIT 1;
  END IF;
END;
$$;

-- 3. Simplified can_user_book_class function
CREATE OR REPLACE FUNCTION can_user_book_class(user_uuid uuid, schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_booking_count INTEGER;
  subscription_count INTEGER := 0;
  personal_training_count INTEGER := 0;
BEGIN
  -- Check if user has only personal_training subscription
  SELECT COUNT(*), COUNT(*) FILTER (WHERE plan_type = 'personal_training')
  INTO subscription_count, personal_training_count
  FROM get_user_valid_subscriptions(user_uuid);

  IF subscription_count = 1 AND personal_training_count = 1 THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'personal_training_only',
      'message', 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d''ajouter un abonnement ou un carnet pour effectuer une réservation.'
    );
  END IF;

  -- Get best subscription for booking
  SELECT * INTO subscription_record
  FROM get_user_booking_subscription(user_uuid)
  LIMIT 1;

  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé pour effectuer une réservation'
    );
  END IF;

  -- Get class information
  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime
  INTO class_info
  FROM public.class_schedules cs
  JOIN public.classes c ON cs.class_id = c.id
  WHERE cs.id = schedule_uuid;

  IF class_info IS NULL THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_not_found',
      'message', 'Cours introuvable'
    );
  END IF;

  -- Check if class has already started
  IF class_info.start_datetime <= NOW() THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_started',
      'message', 'Le cours a déjà commencé'
    );
  END IF;

  -- Check if user already booked this class
  SELECT COUNT(*) INTO existing_booking_count
  FROM public.class_bookings
  WHERE user_id = user_uuid
    AND schedule_id = schedule_uuid
    AND status = 'confirmed';

  IF existing_booking_count > 0 THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'already_booked',
      'message', 'Vous avez déjà réservé ce cours'
    );
  END IF;

  -- Check if class is full
  IF class_info.current_bookings >= class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_full',
      'message', 'Le cours est complet',
      'can_waitlist', true
    );
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'can_book', true,
    'subscription_id', subscription_record.id,
    'subscription_type', subscription_record.plan_type,
    'message', 'Réservation possible'
  );
END;
$$;

-- 4. Simplified book_class function
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

  -- Update subscription credits based on type
  IF subscription_record.plan_type = 'abonnement' THEN
    -- For abonnement: increment weekly usage
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1
    WHERE id = subscription_record.id;
  ELSIF subscription_record.plan_type = 'carnet' THEN
    -- For carnet: deduct credit
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1
    WHERE id = subscription_record.id;
  END IF;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'subscription_type', subscription_record.plan_type,
    'message', 'Réservation confirmée'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système: ' || SQLERRM
    );
END;
$$;