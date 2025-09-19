-- Updated booking functions for new subscription type logic
-- Drop existing functions first to recreate them
DROP FUNCTION IF EXISTS get_user_valid_subscription(uuid);
DROP FUNCTION IF EXISTS can_user_book_class(uuid, uuid);
DROP FUNCTION IF EXISTS book_class(uuid, uuid);

-- Create new function to get all user's valid subscriptions with priority order
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
    -- Priority: abonnement first, then carnet, personal_training last (not bookable)
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
    -- Check subscription-specific validity
    AND (
      -- For carnet: must have credits or not expired by validity
      (sp.type = 'carnet' AND us.credits_remaining > 0)
      -- For abonnement: check weekly limit
      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
      -- For personal_training: always include (but can't book online)
      OR sp.type = 'personal_training'
    )
  ORDER BY priority ASC, us.end_date DESC;
END;
$$;

-- Create function to get best subscription for booking
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
DECLARE
  abonnement_sub RECORD;
  carnet_sub RECORD;
BEGIN
  -- First, try to get valid abonnement subscription
  SELECT * INTO abonnement_sub
  FROM get_user_valid_subscriptions(user_uuid)
  WHERE plan_type = 'abonnement'
  LIMIT 1;

  -- If abonnement exists and has weekly credits available, use it
  IF abonnement_sub IS NOT NULL AND abonnement_sub.weekly_credits_used < abonnement_sub.weekly_limit THEN
    RETURN QUERY
    SELECT
      abonnement_sub.id,
      abonnement_sub.plan_id,
      abonnement_sub.plan_type,
      abonnement_sub.credits_remaining,
      abonnement_sub.weekly_credits_used,
      abonnement_sub.weekly_limit,
      abonnement_sub.status,
      abonnement_sub.end_date;
    RETURN;
  END IF;

  -- If abonnement is at weekly limit or doesn't exist, try carnet
  SELECT * INTO carnet_sub
  FROM get_user_valid_subscriptions(user_uuid)
  WHERE plan_type = 'carnet'
  LIMIT 1;

  IF carnet_sub IS NOT NULL AND carnet_sub.credits_remaining > 0 THEN
    RETURN QUERY
    SELECT
      carnet_sub.id,
      carnet_sub.plan_id,
      carnet_sub.plan_type,
      carnet_sub.credits_remaining,
      carnet_sub.weekly_credits_used,
      carnet_sub.weekly_limit,
      carnet_sub.status,
      carnet_sub.end_date;
    RETURN;
  END IF;

  -- No valid subscription for booking
  RETURN;
END;
$$;

-- Updated can_user_book_class function
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
  has_personal_training_only BOOLEAN := false;
BEGIN
  -- Check if user has only personal_training subscription
  SELECT COUNT(*), COUNT(*) FILTER (WHERE plan_type = 'personal_training')
  INTO subscription_count, personal_training_count
  FROM get_user_valid_subscriptions(user_uuid);

  -- If user has only personal_training, they cannot book online
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
  -- Note: Removed filters since calendar_events_optimized already pre-filters these
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

  -- Note: Schedule validation will be handled in the book_class function

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

  -- Check subscription-specific limits
  IF subscription_record.plan_type = 'abonnement' THEN
    IF subscription_record.weekly_credits_used >= subscription_record.weekly_limit THEN
      RETURN jsonb_build_object(
        'can_book', false,
        'reason', 'weekly_limit_reached',
        'message', 'Limite hebdomadaire de séances atteinte'
      );
    END IF;
  ELSIF subscription_record.plan_type = 'carnet' THEN
    IF subscription_record.credits_remaining <= 0 THEN
      RETURN jsonb_build_object(
        'can_book', false,
        'reason', 'no_credits',
        'message', 'Plus de crédits disponibles'
      );
    END IF;
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

-- Updated book_class function
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
  waitlist_position INTEGER;
BEGIN
  -- First check if schedule exists without FOR UPDATE (for debugging)
  SELECT COUNT(*) INTO current_bookings
  FROM public.class_schedules
  WHERE id = schedule_uuid;

  -- Get the schedule record (removed FOR UPDATE for debugging)
  SELECT * INTO class_schedule_record
  FROM public.class_schedules
  WHERE id = schedule_uuid;

  -- Check if schedule exists
  IF class_schedule_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'schedule_not_found',
      'message', format('Schedule %s not found in class_schedules table', schedule_uuid),
      'debug_schedule_id', schedule_uuid
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

  -- Check if class is an exception (shouldn't be bookable)
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

  -- Get current confirmed booking count
  SELECT COUNT(*) INTO current_bookings
  FROM public.class_bookings
  WHERE schedule_id = schedule_uuid
    AND status = 'confirmed';

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

  -- Check if class is full
  IF current_bookings >= class_record.max_capacity THEN
    -- Class is full, add to waitlist if user has valid subscription
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

  -- Deduct credit/usage atomically based on subscription type
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
  -- Note: personal_training should never reach here due to can_user_book_class check

  -- Return success with updated subscription data
  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'subscription_type', subscription_record.plan_type,
    'message', 'Réservation confirmée',
    'updated_subscription', jsonb_build_object(
      'id', subscription_record.id,
      'credits_remaining',
        CASE
          WHEN subscription_record.plan_type = 'carnet' THEN subscription_record.credits_remaining - 1
          ELSE subscription_record.credits_remaining
        END,
      'weekly_credits_used',
        CASE
          WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.weekly_credits_used + 1
          ELSE subscription_record.weekly_credits_used
        END,
      'credits_used',
        CASE
          WHEN subscription_record.plan_type = 'carnet' THEN subscription_record.credits_remaining - 1
          ELSE subscription_record.credits_remaining
        END
    )
  );

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in book_class function: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système. Veuillez réessayer.'
    );
END;
$$;

-- Updated cancel_booking function to handle different subscription types
CREATE OR REPLACE FUNCTION cancel_booking(booking_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  booking_record RECORD;
  subscription_record RECORD;
  user_uuid uuid;
BEGIN
  -- Get current user
  SELECT auth.uid() INTO user_uuid;

  -- Get and lock the booking with schedule info
  SELECT cb.*, cs.start_datetime INTO booking_record
  FROM public.class_bookings cb
  JOIN public.class_schedules cs ON cb.schedule_id = cs.id
  WHERE cb.id = booking_uuid
    AND cb.user_id = user_uuid
    AND cb.status = 'confirmed'
  FOR UPDATE;

  IF booking_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'booking_not_found',
      'message', 'Réservation non trouvée ou déjà annulée'
    );
  END IF;

  -- Check cancellation policy (24h before class)
  IF booking_record.start_datetime <= NOW() + INTERVAL '24 hours' THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'too_late_to_cancel',
      'message', 'Impossible d''annuler moins de 24h avant le cours'
    );
  END IF;

  -- Get subscription info with plan type
  SELECT us.*, sp.type as plan_type INTO subscription_record
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.id = booking_record.subscription_id;

  -- Cancel the booking
  UPDATE public.class_bookings
  SET status = 'cancelled',
      cancelled_at = NOW()
  WHERE id = booking_uuid;

  -- Refund credit based on subscription type
  IF subscription_record.plan_type = 'abonnement' THEN
    -- For abonnement: decrement weekly usage
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used - 1
    WHERE id = subscription_record.id;
  ELSIF subscription_record.plan_type = 'carnet' THEN
    -- For carnet: refund credit
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining + 1,
        credits_used = credits_used - 1
    WHERE id = subscription_record.id;
  END IF;
  -- Note: personal_training bookings should not exist, but if they do, no credit handling needed

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Réservation annulée avec succès'
  );

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in cancel_booking function: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système. Veuillez réessayer.'
    );
END;
$$;

-- Updated subscription expiration logic
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark subscriptions as expired based on end_date
  UPDATE public.user_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < NOW();

  -- Mark carnet subscriptions as expired if they have no credits remaining
  UPDATE public.user_subscriptions us
  SET status = 'expired'
  FROM public.subscription_plans sp
  WHERE us.plan_id = sp.id
    AND us.status = 'active'
    AND sp.type = 'carnet'
    AND us.credits_remaining <= 0;
END;
$$;