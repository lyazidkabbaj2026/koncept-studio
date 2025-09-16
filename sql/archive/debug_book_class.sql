-- DIAGNOSTIC VERSION: This will help us see exactly what's failing
-- Apply this in Supabase Dashboard SQL Editor to get better error details

CREATE OR REPLACE FUNCTION public.book_class(user_uuid uuid, schedule_uuid uuid) RETURNS jsonb AS $$

DECLARE
  booking_check JSONB;
  subscription_record RECORD;
  class_schedule_record RECORD;
  class_record RECORD;
  current_bookings INTEGER;
  new_booking_id UUID;
  waitlist_position INTEGER;
  error_details TEXT;
BEGIN
  -- Step 1: Check schedule exists
  BEGIN
    SELECT * INTO class_schedule_record
    FROM public.class_schedules
    WHERE id = schedule_uuid
    FOR UPDATE;

    IF class_schedule_record IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'schedule_not_found',
        'message', 'Créneau non trouvé - ID: ' || schedule_uuid::text
      );
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'schedule_lookup_error',
        'message', 'Erreur lors de la recherche du créneau: ' || SQLERRM
      );
  END;

  -- Step 2: Check class exists
  BEGIN
    SELECT * INTO class_record
    FROM public.classes c
    WHERE c.id = class_schedule_record.class_id;

    IF class_record IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'class_not_found',
        'message', 'Cours non trouvé - Class ID: ' || class_schedule_record.class_id::text
      );
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'class_lookup_error',
        'message', 'Erreur lors de la recherche du cours: ' || SQLERRM
      );
  END;

  -- Step 3: Get booking count
  BEGIN
    SELECT COUNT(*) INTO current_bookings
    FROM public.class_bookings
    WHERE schedule_id = schedule_uuid
      AND status = 'confirmed'
    FOR UPDATE;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'booking_count_error',
        'message', 'Erreur lors du comptage des réservations: ' || SQLERRM
      );
  END;

  -- Step 4: Check if user can book
  BEGIN
    SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;

    IF (booking_check->>'can_book')::boolean = false THEN
      RETURN booking_check;
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'can_book_check_error',
        'message', 'Erreur lors de la vérification des droits de réservation: ' || SQLERRM
      );
  END;

  -- Step 5: Get subscription
  BEGIN
    SELECT * INTO subscription_record
    FROM get_user_valid_subscription(user_uuid)
    LIMIT 1;

    IF subscription_record IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'no_valid_subscription',
        'message', 'Aucun abonnement valide trouvé pour l''utilisateur: ' || user_uuid::text
      );
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'subscription_lookup_error',
        'message', 'Erreur lors de la recherche de l''abonnement: ' || SQLERRM
      );
  END;

  -- Step 6: Handle booking or waitlist
  BEGIN
    IF current_bookings >= class_record.max_capacity THEN
      -- Add to waitlist
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
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'waitlist_error',
        'message', 'Erreur lors de la gestion de la liste d''attente: ' || SQLERRM
      );
  END;

  -- Step 7: Create booking
  BEGIN
    INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
    VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')
    RETURNING id INTO new_booking_id;
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'booking_creation_error',
        'message', 'Erreur lors de la création de la réservation: ' || SQLERRM
      );
  END;

  -- Step 8: Update subscription credits
  BEGIN
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
  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'credit_update_error',
        'message', 'Erreur lors de la mise à jour des crédits: ' || SQLERRM
      );
  END;

  -- Success
  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'message', 'Réservation confirmée'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'unexpected_error',
      'message', 'Erreur inattendue: ' || SQLERRM
    );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;