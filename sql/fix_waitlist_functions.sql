-- Fix database functions that reference the wrong function name
-- The issue is that join_waitlist and promote_from_waitlist functions call
-- get_user_valid_subscription (singular) but the function is get_user_valid_subscriptions (plural)

-- First, let's create the corrected join_waitlist function
CREATE OR REPLACE FUNCTION join_waitlist(
  user_uuid uuid,
  schedule_uuid uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_waitlist_count INTEGER;
  new_waitlist_id UUID;
  new_position INTEGER;
BEGIN
  -- Check if user has valid subscription (use the correct function name - plural)
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

  -- Check if user is already on waitlist
  SELECT COUNT(*) INTO existing_waitlist_count
  FROM public.class_waitlist
  WHERE user_id = user_uuid AND schedule_id = schedule_uuid;

  IF existing_waitlist_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_on_waitlist',
      'message', 'Vous êtes déjà sur la liste d''attente'
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
      'success', false,
      'reason', 'class_not_found',
      'message', 'Cours non trouvé'
    );
  END IF;

  -- Verify class is actually full
  IF class_info.current_bookings < class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_not_full',
      'message', 'Le cours n''est pas complet, vous pouvez le réserver directement'
    );
  END IF;

  -- Get next position in waitlist
  SELECT COALESCE(MAX(position), 0) + 1 INTO new_position
  FROM public.class_waitlist
  WHERE schedule_id = schedule_uuid;

  -- Add to waitlist
  INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id, position)
  VALUES (user_uuid, schedule_uuid, subscription_record.id, new_position)
  RETURNING id INTO new_waitlist_id;

  -- Deduct credit when joining waitlist
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

  RETURN jsonb_build_object(
    'success', true,
    'waitlist_id', new_waitlist_id,
    'position', new_position,
    'message', format('Ajouté à la liste d''attente en position %s', new_position)
  );

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in join_waitlist: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système. Veuillez réessayer.'
    );
END;
$$;

-- Create a leave_waitlist function for refunding credits
CREATE OR REPLACE FUNCTION leave_waitlist(
  user_uuid uuid,
  waitlist_entry_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  waitlist_entry RECORD;
  subscription_record RECORD;
BEGIN
  -- Get waitlist entry with subscription info
  SELECT w.*, us.* INTO waitlist_entry
  FROM public.class_waitlist w
  JOIN public.user_subscriptions us ON w.subscription_id = us.id
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE w.id = waitlist_entry_id
    AND w.user_id = user_uuid;

  IF waitlist_entry IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'waitlist_entry_not_found',
      'message', 'Entrée de liste d''attente non trouvée'
    );
  END IF;

  -- Refund credit
  IF waitlist_entry.plan_type = 'abonnement' THEN
    UPDATE public.user_subscriptions
    SET weekly_credits_used = GREATEST(0, weekly_credits_used - 1)
    WHERE id = waitlist_entry.subscription_id;
  ELSE
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining + 1,
        credits_used = GREATEST(0, credits_used - 1)
    WHERE id = waitlist_entry.subscription_id;
  END IF;

  -- Remove from waitlist
  DELETE FROM public.class_waitlist WHERE id = waitlist_entry_id;

  -- Update positions for remaining entries
  UPDATE public.class_waitlist
  SET position = position - 1
  WHERE schedule_id = waitlist_entry.schedule_id
    AND position > waitlist_entry.position;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Retiré de la liste d''attente et crédits remboursés'
  );

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in leave_waitlist: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'system_error',
      'message', 'Erreur système. Veuillez réessayer.'
    );
END;
$$;

-- Update the promote_from_waitlist trigger function to use correct function names
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  waitlist_entry RECORD;
  subscription_record RECORD;
  class_schedule_record RECORD;
  class_record RECORD;
  current_bookings INTEGER;
BEGIN
  -- Only process when a booking is cancelled/removed
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    -- Lock the schedule to prevent race conditions
    SELECT * INTO class_schedule_record
    FROM class_schedules
    WHERE id = NEW.schedule_id
    FOR UPDATE;

    -- Get class info for max_capacity
    SELECT * INTO class_record
    FROM classes
    WHERE id = class_schedule_record.class_id;

    -- Get current booking count
    SELECT COUNT(*) INTO current_bookings
    FROM class_bookings
    WHERE schedule_id = NEW.schedule_id
      AND status = 'confirmed'
    FOR UPDATE;

    -- Only promote if there's space
    IF current_bookings < class_record.max_capacity THEN
      -- Find the first person on the waitlist with locking
      SELECT * INTO waitlist_entry
      FROM class_waitlist
      WHERE schedule_id = NEW.schedule_id
      ORDER BY position ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;

      IF waitlist_entry IS NOT NULL THEN
        -- Get their subscription info using the correct table join
        SELECT us.*, sp.type as plan_type INTO subscription_record
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.id = waitlist_entry.subscription_id
        LIMIT 1;

        IF subscription_record IS NOT NULL THEN
          -- Create booking for waitlisted user
          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

          -- Credit is already deducted when joining waitlist, so no additional deduction needed

          -- Remove from waitlist
          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;

          -- Update positions for remaining waitlist entries
          UPDATE class_waitlist
          SET position = position - 1
          WHERE schedule_id = NEW.schedule_id
            AND position > waitlist_entry.position;
        END IF;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    -- Similar logic for deleted bookings
    SELECT * INTO class_schedule_record
    FROM class_schedules
    WHERE id = OLD.schedule_id
    FOR UPDATE;

    -- Get class info for max_capacity
    SELECT * INTO class_record
    FROM classes
    WHERE id = class_schedule_record.class_id;

    SELECT COUNT(*) INTO current_bookings
    FROM class_bookings
    WHERE schedule_id = OLD.schedule_id
      AND status = 'confirmed'
    FOR UPDATE;

    IF current_bookings < class_record.max_capacity THEN
      SELECT * INTO waitlist_entry
      FROM class_waitlist
      WHERE schedule_id = OLD.schedule_id
      ORDER BY position ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;

      IF waitlist_entry IS NOT NULL THEN
        -- Get their subscription info using the correct table join
        SELECT us.*, sp.type as plan_type INTO subscription_record
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.id = waitlist_entry.subscription_id
        LIMIT 1;

        IF subscription_record IS NOT NULL THEN
          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

          -- Credit is already deducted when joining waitlist, so no additional deduction needed

          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;

          -- Update positions
          UPDATE class_waitlist
          SET position = position - 1
          WHERE schedule_id = OLD.schedule_id
            AND position > waitlist_entry.position;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN others THEN
    -- Log errors but don't fail the transaction
    RAISE LOG 'Error in promote_from_waitlist trigger: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;