-- 1. Tables - All table structures with columns, data types, constraints

| create_table_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TABLEpublic.booking_audit(iduuid NOT NULLDEFAULT gen_random_uuid(), booking_iduuid, user_iduuid, operationtext NOT NULL, schedule_iduuid, detailsjsonb, created_attimestamp with time zoneDEFAULT now());                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE TABLEpublic.class_bookings(iduuid NOT NULLDEFAULT gen_random_uuid(), user_iduuid NOT NULL, schedule_iduuid NOT NULL, subscription_iduuid NOT NULL, statustextDEFAULT 'confirmed'::text, booked_attimestamp with time zoneDEFAULT now(), cancelled_attimestamp with time zone, cancellation_reasontext, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                                                                                                                                               |
| CREATE TABLEpublic.class_schedules(iduuid NOT NULLDEFAULT gen_random_uuid(), class_iduuid NOT NULL, start_datetimetimestamp with time zone NOT NULL, end_datetimetimestamp with time zone NOT NULL, is_recurringbooleanDEFAULT false, recurrence_rulejsonb, recurrence_end_datetimestamp with time zone, parent_schedule_iduuid, is_exceptionbooleanDEFAULT false, exception_reasontext, current_bookingsinteger(32,0)DEFAULT 0, is_cancelledbooleanDEFAULT false, cancellation_reasontext, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now(), created_byuuid); |
| CREATE TABLEpublic.class_waitlist(iduuid NOT NULLDEFAULT gen_random_uuid(), user_iduuid NOT NULL, schedule_iduuid NOT NULL, subscription_iduuid NOT NULL, positioninteger(32,0) NOT NULL, joined_attimestamp with time zoneDEFAULT now(), notified_attimestamp with time zone, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                                                                                                                                                                              |
| CREATE TABLEpublic.classes(iduuid NOT NULLDEFAULT gen_random_uuid(), titlecharacter varying(255) NOT NULL, descriptiontext, durationinteger(32,0) NOT NULL, max_capacityinteger(32,0) NOT NULLDEFAULT 1, coachcharacter varying(255) NOT NULL, locationcharacter varying(255) NOT NULL, difficulty_levelcharacter varying(20) NOT NULL, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                                                                                                                     |
| CREATE TABLEpublic.profiles(iduuid NOT NULL, emailtext NOT NULL, full_nametext NOT NULL, phonetext, desired_plantext, roletextDEFAULT 'user'::text, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now(), subscription_statustextDEFAULT 'pending'::text);                                                                                                                                                                                                                                                                                                         |
| CREATE TABLEpublic.subscription_plans(iduuid NOT NULLDEFAULT gen_random_uuid(), nametext NOT NULL, typetext NOT NULL, creditsinteger(32,0) NOT NULL, price_dhsinteger(32,0) NOT NULL, validity_monthsinteger(32,0) NOT NULL, validity_daysinteger(32,0), weekly_limitinteger(32,0), created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                                                                                                                                                                         |
| CREATE TABLEpublic.subscription_requests(iduuid NOT NULLDEFAULT gen_random_uuid(), user_iduuid NOT NULL, plan_iduuid NOT NULL, statustextDEFAULT 'pending'::text, notestext, requested_attimestamp with time zoneDEFAULT now(), contacted_attimestamp with time zone, resolved_attimestamp with time zone, created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                                                                                                                                                  |
| CREATE TABLEpublic.user_subscriptions(iduuid NOT NULLDEFAULT gen_random_uuid(), user_iduuid NOT NULL, plan_iduuid NOT NULL, statustextDEFAULT 'active'::text, credits_remaininginteger(32,0) NOT NULL, credits_usedinteger(32,0)DEFAULT 0, weekly_credits_usedinteger(32,0)DEFAULT 0, start_datetimestamp with time zoneDEFAULT now(), end_datetimestamp with time zone NOT NULL, last_weekly_resettimestamp with time zoneDEFAULT now(), created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());                                                                   |


-- 2. Primary Keys - All PRIMARY KEY constraints


| primary_key_statement                                                                                |
| ---------------------------------------------------------------------------------------------------- |
| ALTER TABLE public.booking_audit ADD CONSTRAINT booking_audit_pkey PRIMARY KEY (id);                 |
| ALTER TABLE public.class_bookings ADD CONSTRAINT class_bookings_pkey PRIMARY KEY (id);               |
| ALTER TABLE public.class_schedules ADD CONSTRAINT class_schedules_pkey PRIMARY KEY (id);             |
| ALTER TABLE public.class_waitlist ADD CONSTRAINT class_waitlist_pkey PRIMARY KEY (id);               |
| ALTER TABLE public.classes ADD CONSTRAINT classes_pkey PRIMARY KEY (id);                             |
| ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);                           |
| ALTER TABLE public.subscription_plans ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);       |
| ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_pkey PRIMARY KEY (id); |
| ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);       |


-- 3. Foreign Keys - All FOREIGN KEY relationships with ON UPDATE/DELETE rules


| foreign_key_statement                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALTER TABLE public.booking_audit ADD CONSTRAINT booking_audit_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.class_schedules(id);                                     |
| ALTER TABLE public.class_bookings ADD CONSTRAINT class_bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.class_schedules(id) ON DELETE CASCADE;                 |
| ALTER TABLE public.class_bookings ADD CONSTRAINT class_bookings_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;      |
| ALTER TABLE public.class_bookings ADD CONSTRAINT class_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;                                |
| ALTER TABLE public.class_schedules ADD CONSTRAINT class_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;                             |
| ALTER TABLE public.class_schedules ADD CONSTRAINT class_schedules_parent_schedule_id_fkey FOREIGN KEY (parent_schedule_id) REFERENCES public.class_schedules(id) ON DELETE CASCADE; |
| ALTER TABLE public.class_waitlist ADD CONSTRAINT class_waitlist_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.class_schedules(id) ON DELETE CASCADE;                 |
| ALTER TABLE public.class_waitlist ADD CONSTRAINT class_waitlist_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;      |
| ALTER TABLE public.class_waitlist ADD CONSTRAINT class_waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;                                |
| ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;       |
| ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;                  |
| ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;             |
| ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;                        |


-- 4. Indexes - All custom indexes (excluding auto-generated ones)


| indexname                                | index_statement                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| idx_booking_audit_booking_operation      | CREATE INDEX idx_booking_audit_booking_operation ON public.booking_audit USING btree  (booking_id, operation);                                                           |
| idx_booking_audit_user_created           | CREATE INDEX idx_booking_audit_user_created ON public.booking_audit USING btree  (user_id, created_at);                                                                  |
| idx_class_bookings_booked_at             | CREATE INDEX idx_class_bookings_booked_at ON public.class_bookings USING btree  (booked_at);                                                                             |
| idx_class_bookings_schedule_id           | CREATE INDEX idx_class_bookings_schedule_id ON public.class_bookings USING btree  (schedule_id);                                                                         |
| idx_class_bookings_schedule_status       | CREATE INDEX idx_class_bookings_schedule_status ON public.class_bookings USING btree  (schedule_id, status);                                                             |
| idx_class_bookings_status                | CREATE INDEX idx_class_bookings_status ON public.class_bookings USING btree  (status);                                                                                   |
| idx_class_bookings_subscription_id       | CREATE INDEX idx_class_bookings_subscription_id ON public.class_bookings USING btree  (subscription_id);                                                                 |
| idx_class_bookings_user_id               | CREATE INDEX idx_class_bookings_user_id ON public.class_bookings USING btree  (user_id);                                                                                 |
| idx_class_bookings_user_status_active    | CREATE INDEX idx_class_bookings_user_status_active ON public.class_bookings USING btree  (user_id, status) WHERE (status = 'confirmed'::text);                           |
| idx_class_schedules_class_id             | CREATE INDEX idx_class_schedules_class_id ON public.class_schedules USING btree  (class_id);                                                                             |
| idx_class_schedules_created_by           | CREATE INDEX idx_class_schedules_created_by ON public.class_schedules USING btree  (created_by);                                                                         |
| idx_class_schedules_datetime_range       | CREATE INDEX idx_class_schedules_datetime_range ON public.class_schedules USING btree  (start_datetime, end_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception)); |
| idx_class_schedules_end_datetime         | CREATE INDEX idx_class_schedules_end_datetime ON public.class_schedules USING btree  (end_datetime);                                                                     |
| idx_class_schedules_exception            | CREATE INDEX idx_class_schedules_exception ON public.class_schedules USING btree  (is_exception);                                                                        |
| idx_class_schedules_parent_id            | CREATE INDEX idx_class_schedules_parent_id ON public.class_schedules USING btree  (parent_schedule_id);                                                                  |
| idx_class_schedules_recurring            | CREATE INDEX idx_class_schedules_recurring ON public.class_schedules USING btree  (is_recurring);                                                                        |
| idx_class_schedules_start_datetime       | CREATE INDEX idx_class_schedules_start_datetime ON public.class_schedules USING btree  (start_datetime);                                                                 |
| idx_class_schedules_start_future         | CREATE INDEX idx_class_schedules_start_future ON public.class_schedules USING btree  (start_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception));                 |
| idx_class_waitlist_joined_at             | CREATE INDEX idx_class_waitlist_joined_at ON public.class_waitlist USING btree  (joined_at);                                                                             |
| idx_class_waitlist_position              | CREATE INDEX idx_class_waitlist_position ON public.class_waitlist USING btree  ("position");                                                                             |
| idx_class_waitlist_schedule_id           | CREATE INDEX idx_class_waitlist_schedule_id ON public.class_waitlist USING btree  (schedule_id);                                                                         |
| idx_class_waitlist_schedule_position     | CREATE INDEX idx_class_waitlist_schedule_position ON public.class_waitlist USING btree  (schedule_id, "position");                                                       |
| idx_class_waitlist_subscription_id       | CREATE INDEX idx_class_waitlist_subscription_id ON public.class_waitlist USING btree  (subscription_id);                                                                 |
| idx_class_waitlist_user_id               | CREATE INDEX idx_class_waitlist_user_id ON public.class_waitlist USING btree  (user_id);                                                                                 |
| idx_classes_coach                        | CREATE INDEX idx_classes_coach ON public.classes USING btree  (coach);                                                                                                   |
| idx_classes_created_at                   | CREATE INDEX idx_classes_created_at ON public.classes USING btree  (created_at);                                                                                         |
| idx_classes_difficulty_level             | CREATE INDEX idx_classes_difficulty_level ON public.classes USING btree  (difficulty_level);                                                                             |
| idx_profiles_role_admin                  | CREATE INDEX idx_profiles_role_admin ON public.profiles USING btree  (role) WHERE (role = 'admin'::text);                                                                |
| idx_profiles_subscription_status_created | CREATE INDEX idx_profiles_subscription_status_created ON public.profiles USING btree  (subscription_status, created_at);                                                 |
| idx_subscription_plans_type              | CREATE INDEX idx_subscription_plans_type ON public.subscription_plans USING btree  (type);                                                                               |
| idx_subscription_requests_plan_id        | CREATE INDEX idx_subscription_requests_plan_id ON public.subscription_requests USING btree  (plan_id);                                                                   |
| idx_subscription_requests_user_id        | CREATE INDEX idx_subscription_requests_user_id ON public.subscription_requests USING btree  (user_id);                                                                   |
| idx_user_subscriptions_active_users      | CREATE INDEX idx_user_subscriptions_active_users ON public.user_subscriptions USING btree  (status, end_date) WHERE (status = 'active'::text);                           |
| idx_user_subscriptions_plan_id           | CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions USING btree  (plan_id);                                                                         |
| idx_user_subscriptions_status_end_date   | CREATE INDEX idx_user_subscriptions_status_end_date ON public.user_subscriptions USING btree  (user_id, status, end_date);                                               |
| idx_user_subscriptions_user_id           | CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree  (user_id);  

                                                                       |
-- 5. Functions - All custom functions with SECURITY DEFINER flags


| function_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.adjust_waitlist_positions() RETURNS trigger AS $$

BEGIN
  -- Adjust positions of everyone behind the deleted entry
  UPDATE public.class_waitlist
  SET position = position - 1
  WHERE schedule_id = OLD.schedule_id
  AND position > OLD.position;
  RETURN OLD;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE OR REPLACE FUNCTION public.book_class(user_uuid uuid, schedule_uuid uuid) RETURNS jsonb AS $$

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

  -- Get class info for max_capacity
  SELECT * INTO class_record
  FROM public.classes c
  WHERE c.id = class_schedule_record.class_id;

  -- Check if schedule exists
  IF class_schedule_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'schedule_not_found',
      'message', 'Créneau non trouvé'
    );
  END IF;

  -- Get current confirmed booking count with lock
  SELECT COUNT(*) INTO current_bookings
  FROM public.class_bookings
  WHERE schedule_id = schedule_uuid
    AND status = 'confirmed'
  FOR UPDATE;

  -- Check if user can book the class
  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;

  IF (booking_check->>'can_book')::boolean = false THEN
    RETURN booking_check;
  END IF;

  -- Get subscription info
  SELECT * INTO subscription_record
  FROM get_user_valid_subscription(user_uuid)
  LIMIT 1;

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

  RETURN jsonb_build_object(
    'success', true,
    'status', 'confirmed',
    'booking_id', new_booking_id,
    'message', 'Réservation confirmée'
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

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE OR REPLACE FUNCTION public.can_user_book_class(user_uuid uuid, schedule_uuid uuid) RETURNS jsonb AS $$

DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_booking_count INTEGER;
BEGIN
  -- Check if user has valid subscription
  SELECT * INTO subscription_record
  FROM get_user_valid_subscription(user_uuid)
  LIMIT 1;

  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé'
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

  -- Check subscription-specific limits
  IF subscription_record.plan_type = 'abonnement' THEN
    IF subscription_record.weekly_credits_used >= subscription_record.weekly_limit THEN
      RETURN jsonb_build_object(
        'can_book', false,
        'reason', 'weekly_limit_reached',
        'message', 'Limite hebdomadaire de séances atteinte'
      );
    END IF;
  ELSIF subscription_record.credits_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'no_credits',
      'message', 'Plus de crédits disponibles'
    );
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'can_book', true,
    'subscription_id', subscription_record.id,
    'message', 'Réservation possible'
  );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE OR REPLACE FUNCTION public.cancel_booking(booking_uuid uuid, user_uuid uuid) RETURNS jsonb AS $$

DECLARE
  booking_record RECORD;
  subscription_record RECORD;
BEGIN
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

  -- Get subscription info
  SELECT * INTO subscription_record
  FROM public.user_subscriptions
  WHERE id = booking_record.subscription_id;

  -- Cancel the booking
  UPDATE public.class_bookings
  SET status = 'cancelled',
      cancelled_at = NOW()
  WHERE id = booking_uuid;

  -- Refund credit
  IF subscription_record.plan_type = 'abonnement' THEN
    UPDATE public.user_subscriptions
    SET weekly_credits_used = weekly_credits_used - 1
    WHERE id = subscription_record.id;
  ELSE
    UPDATE public.user_subscriptions
    SET credits_remaining = credits_remaining + 1,
        credits_used = credits_used - 1
    WHERE id = subscription_record.id;
  END IF;

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

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE OR REPLACE FUNCTION public.check_expired_subscriptions() RETURNS void AS $$

BEGIN
  UPDATE public.user_subscriptions
  SET status = 'expired'
  WHERE status = 'active' AND end_date < NOW();
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CREATE OR REPLACE FUNCTION public.check_user_admin(user_id uuid) RETURNS boolean AS $$

DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;

  RETURN COALESCE(user_role = 'admin', false);
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CREATE OR REPLACE FUNCTION public.get_admin_users_data(page_offset integer DEFAULT 0, page_limit integer DEFAULT 25) RETURNS jsonb AS $$

DECLARE
  result JSONB;
  total_count INTEGER;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM public.profiles
  WHERE role != 'admin' OR role IS NULL;

  SELECT jsonb_build_object(
    'users', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'email', p.email,
          'full_name', p.full_name,
          'phone', p.phone,
          'desired_plan', p.desired_plan,
          'subscription_status', p.subscription_status,
          'role', p.role,
          'created_at', p.created_at,
          'active_subscription', us_data.subscription_data
        ) ORDER BY p.created_at DESC  -- Fixed: ORDER BY moved inside jsonb_agg()
      )
      FROM public.profiles p
      LEFT JOIN LATERAL (
        SELECT jsonb_build_object(
          'id', us.id,
          'status', us.status,
          'credits_remaining', us.credits_remaining,
          'end_date', us.end_date,
          'plan_name', sp.name
        ) as subscription_data
        FROM public.user_subscriptions us
        JOIN public.subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = p.id AND us.status = 'active'
        ORDER BY us.end_date DESC
        LIMIT 1
      ) us_data ON true
      WHERE (p.role != 'admin' OR p.role IS NULL)
      -- Removed the problematic ORDER BY here since it's now inside jsonb_agg()
      LIMIT page_limit OFFSET page_offset
    ),
    'total_count', total_count,
    'page_offset', page_offset,
    'page_limit', page_limit
  ) INTO result;

  RETURN result;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE OR REPLACE FUNCTION public.get_database_performance_stats() RETURNS jsonb AS $$

DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'table_sizes', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'table_name', tablename,
          'size', pg_size_pretty(pg_total_relation_size('public.' || tablename)),
          'size_bytes', pg_total_relation_size('public.' || tablename),
          'rows_read', pg_stat_get_tuples_returned(c.oid),
          'rows_fetched', pg_stat_get_tuples_fetched(c.oid),
          'efficiency_ratio',
            CASE
              WHEN pg_stat_get_tuples_returned(c.oid) = 0 THEN 0
              ELSE round((pg_stat_get_tuples_fetched(c.oid) * 100.0) / pg_stat_get_tuples_returned(c.oid), 2)
            END
        ) ORDER BY pg_total_relation_size('public.' || tablename) DESC
      )
      FROM pg_tables pt
      JOIN pg_class c ON c.relname = pt.tablename
      WHERE pt.schemaname = 'public'
    ),
    'index_usage', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'table_name', schemaname || '.' || tablename,
          'index_name', indexname,
          'definition', indexdef
        )
      )
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    )
  ) INTO result;

  RETURN result;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(user_uuid uuid) RETURNS jsonb AS $$

DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name,
        'phone', phone,
        'subscription_status', subscription_status,
        'role', role
      )
      FROM public.profiles WHERE id = user_uuid
    ),
    'active_subscription', (
      SELECT jsonb_build_object(
        'id', us.id,
        'status', us.status,
        'credits_remaining', us.credits_remaining,
        'weekly_credits_used', us.weekly_credits_used,
        'end_date', us.end_date,
        'start_date', us.start_date,
        'plan', jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'type', sp.type,
          'weekly_limit', sp.weekly_limit,
          'credits', sp.credits,
          'price_dhs', sp.price_dhs
        )
      )
      FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid
        AND us.status = 'active'
        AND us.end_date > NOW()
      ORDER BY us.end_date DESC
      LIMIT 1
    ),
    'recent_bookings', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cb.id,
          'status', cb.status,
          'booked_at', cb.booked_at,
          'cancelled_at', cb.cancelled_at,
          'class_title', c.title,
          'start_datetime', cs.start_datetime,
          'end_datetime', cs.end_datetime,
          'coach', c.coach,
          'location', c.location
        )
      )
      FROM public.class_bookings cb
      JOIN public.class_schedules cs ON cb.schedule_id = cs.id
      JOIN public.classes c ON cs.class_id = c.id
      WHERE cb.user_id = user_uuid
      ORDER BY cb.booked_at DESC
      LIMIT 10
    ),
    'upcoming_classes', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cs.id,
          'title', c.title,
          'description', c.description,
          'start_datetime', cs.start_datetime,
          'end_datetime', cs.end_datetime,
          'coach', c.coach,
          'location', c.location,
          'difficulty_level', c.difficulty_level,
          'current_bookings', cs.current_bookings,
          'max_capacity', c.max_capacity,
          'user_booked', (cb.id IS NOT NULL),
          'user_booking_id', cb.id,
          'user_waitlist_position', cw.position
        ) ORDER BY cs.start_datetime
      )
      FROM public.class_schedules cs
      JOIN public.classes c ON cs.class_id = c.id
      LEFT JOIN public.class_bookings cb ON cs.id = cb.schedule_id AND cb.user_id = user_uuid AND cb.status = 'confirmed'
      LEFT JOIN public.class_waitlist cw ON cs.id = cw.schedule_id AND cw.user_id = user_uuid
      WHERE cs.start_datetime >= NOW()
        AND NOT cs.is_cancelled
        AND NOT cs.is_exception
      ORDER BY cs.start_datetime
      LIMIT 20
    )
  ) INTO result;

  RETURN result;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE OR REPLACE FUNCTION public.get_user_valid_subscription(user_uuid uuid) RETURNS TABLE(id uuid, plan_id uuid, plan_type text, credits_remaining integer, weekly_credits_used integer, weekly_limit integer, status text, end_date timestamp with time zone) AS $$

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
    us.end_date
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
      us.credits_remaining > 0
      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
    )
  ORDER BY us.end_date DESC
  LIMIT 1;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$

BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, desired_plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'desired_plan', '')
  );
  RETURN NEW;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$

DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'admin', false);
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid()) RETURNS boolean AS $$

DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_uuid
  LIMIT 1;

  RETURN COALESCE(user_role = 'admin', false);
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE OR REPLACE FUNCTION public.join_waitlist(user_uuid uuid, schedule_uuid uuid) RETURNS jsonb AS $$

DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_waitlist_count INTEGER;
  new_waitlist_id UUID;
BEGIN
  -- Check if user has valid subscription
  SELECT * INTO subscription_record
  FROM get_user_valid_subscription(user_uuid)
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

  -- Verify class is actually full
  IF class_info.current_bookings < class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_not_full',
      'message', 'Le cours n''est pas complet, vous pouvez le réserver directement'
    );
  END IF;

  -- Add to waitlist
  INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id)
  VALUES (user_uuid, schedule_uuid, subscription_record.id)
  RETURNING id INTO new_waitlist_id;

  RETURN jsonb_build_object(
    'success', true,
    'waitlist_id', new_waitlist_id,
    'message', 'Ajouté à la liste d''attente'
  );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE OR REPLACE FUNCTION public.promote_from_waitlist() RETURNS trigger AS $$

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
        -- Get their subscription info
        SELECT * INTO subscription_record
        FROM get_user_valid_subscription(waitlist_entry.user_id)
        WHERE id = waitlist_entry.subscription_id
        LIMIT 1;

        IF subscription_record IS NOT NULL THEN
          -- Create booking for waitlisted user
          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

          -- Deduct credit
          IF subscription_record.plan_type = 'abonnement' THEN
            UPDATE user_subscriptions
            SET weekly_credits_used = weekly_credits_used + 1
            WHERE id = subscription_record.id;
          ELSE
            UPDATE user_subscriptions
            SET credits_remaining = credits_remaining - 1,
                credits_used = credits_used + 1
            WHERE id = subscription_record.id;
          END IF;

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
        SELECT * INTO subscription_record
        FROM get_user_valid_subscription(waitlist_entry.user_id)
        WHERE id = waitlist_entry.subscription_id
        LIMIT 1;

        IF subscription_record IS NOT NULL THEN
          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

          IF subscription_record.plan_type = 'abonnement' THEN
            UPDATE user_subscriptions
            SET weekly_credits_used = weekly_credits_used + 1
            WHERE id = subscription_record.id;
          ELSE
            UPDATE user_subscriptions
            SET credits_remaining = credits_remaining - 1,
                credits_used = credits_used + 1
            WHERE id = subscription_record.id;
          END IF;

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

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER; |
| CREATE OR REPLACE FUNCTION public.reset_weekly_credits() RETURNS void AS $$

BEGIN
  UPDATE public.user_subscriptions
  SET
    weekly_credits_used = 0,
    last_weekly_reset = NOW()
  WHERE
    status = 'active'
    AND last_weekly_reset < (NOW() - INTERVAL '7 days')
    AND plan_id IN (
      SELECT id FROM public.subscription_plans
      WHERE type = 'abonnement'
    );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE OR REPLACE FUNCTION public.set_waitlist_position() RETURNS trigger AS $$

BEGIN
  -- Set position as the last in line
  NEW.position = COALESCE(
    (SELECT MAX(position) FROM public.class_waitlist
     WHERE schedule_id = NEW.schedule_id) + 1,
    1
  );
  RETURN NEW;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE OR REPLACE FUNCTION public.update_booking_count() RETURNS trigger AS $$

BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase booking count
    UPDATE public.class_schedules
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.schedule_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      -- Booking was cancelled/no-show, decrease count
      UPDATE public.class_schedules
      SET current_bookings = current_bookings - 1
      WHERE id = NEW.schedule_id;
    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      -- Booking was restored, increase count
      UPDATE public.class_schedules
      SET current_bookings = current_bookings + 1
      WHERE id = NEW.schedule_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease booking count only if booking was confirmed
    IF OLD.status = 'confirmed' THEN
      UPDATE public.class_schedules
      SET current_bookings = current_bookings - 1
      WHERE id = OLD.schedule_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger AS $$

BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;

$$ LANGUAGE plpgsql VOLATILE;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |


-- 6. Triggers - All triggers and their associated functions


| trigger_statement                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TRIGGER promote_from_waitlist_trigger INSTEAD OF DELETE ON public.class_bookings FOR EACH ROW EXECUTE FUNCTION public.promote_from_waitlist();                 |
| CREATE TRIGGER update_booking_count_trigger AFTER INSERT ON public.class_bookings FOR EACH ROW EXECUTE FUNCTION public.update_booking_count();                        |
| CREATE TRIGGER update_class_bookings_updated_at BEFORE UPDATE ON public.class_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();               |
| CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON public.class_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();             |
| CREATE TRIGGER adjust_waitlist_positions_trigger INSTEAD OF DELETE ON public.class_waitlist FOR EACH ROW EXECUTE FUNCTION public.adjust_waitlist_positions();         |
| CREATE TRIGGER set_waitlist_position_trigger BEFORE INSERT ON public.class_waitlist FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_position();                     |
| CREATE TRIGGER update_class_waitlist_updated_at BEFORE UPDATE ON public.class_waitlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();               |
| CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();                             |
| CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();                           |
| CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();       |
| CREATE TRIGGER update_subscription_requests_updated_at BEFORE UPDATE ON public.subscription_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); |
| CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();       |


-- 7. RLS Policies - All Row Level Security policies with conditions


| policy_statement                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE POLICY Admins can manage audit entries ON public.booking_audit FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));                                 |
| CREATE POLICY System can insert audit entries ON public.booking_audit FOR INSERT WITH CHECK (true);                                                                                                                                   |
| CREATE POLICY Users can view own audit entries ON public.booking_audit FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))); |
| CREATE POLICY Admins can manage all bookings ON public.class_bookings FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));                                 |
| CREATE POLICY Users can create own bookings ON public.class_bookings FOR INSERT WITH CHECK ((auth.uid() = user_id));                                                                                                                  |
| CREATE POLICY Users can update own bookings ON public.class_bookings FOR UPDATE USING ((auth.uid() = user_id));                                                                                                                       |
| CREATE POLICY Users can view own bookings ON public.class_bookings FOR SELECT USING ((auth.uid() = user_id));                                                                                                                         |
| CREATE POLICY Admins can manage class schedules ON public.class_schedules FOR ALL USING (check_user_admin(auth.uid()));                                                                                                               |
| CREATE POLICY Users can view class schedules ON public.class_schedules FOR SELECT USING (((NOT is_cancelled) AND (NOT is_exception)));                                                                                                |
| CREATE POLICY Admins can manage all waitlist entries ON public.class_waitlist FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));                         |
| CREATE POLICY Users can create own waitlist entries ON public.class_waitlist FOR INSERT WITH CHECK ((auth.uid() = user_id));                                                                                                          |
| CREATE POLICY Users can delete own waitlist entries ON public.class_waitlist FOR DELETE USING ((auth.uid() = user_id));                                                                                                               |
| CREATE POLICY Users can view own waitlist entries ON public.class_waitlist FOR SELECT USING ((auth.uid() = user_id));                                                                                                                 |
| CREATE POLICY Admins can manage classes ON public.classes FOR ALL USING (check_user_admin(auth.uid()));                                                                                                                               |
| CREATE POLICY Users can view classes ON public.classes FOR SELECT USING (true);                                                                                                                                                       |
| CREATE POLICY Admins can update all profiles ON public.profiles FOR UPDATE USING (is_admin(auth.uid()));                                                                                                                              |
| CREATE POLICY Admins can view all profiles ON public.profiles FOR SELECT USING (is_admin(auth.uid()));                                                                                                                                |
| CREATE POLICY Enable insert for authenticated users ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));                                                                                                                     |
| CREATE POLICY Users can update own profile ON public.profiles FOR UPDATE USING ((auth.uid() = id));                                                                                                                                   |
| CREATE POLICY Users can view own profile ON public.profiles FOR SELECT USING ((auth.uid() = id));                                                                                                                                     |
| CREATE POLICY Admins can manage subscription plans ON public.subscription_plans FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));                       |
| CREATE POLICY Anyone can view subscription plans ON public.subscription_plans FOR SELECT USING (true);                                                                                                                                |
| CREATE POLICY Admins can manage subscription requests ON public.subscription_requests FOR ALL USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())
 LIMIT 1) = 'admin'::text));                         |
| CREATE POLICY Users can create subscription requests ON public.subscription_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));                                                                                                  |
| CREATE POLICY Users can view own subscription requests ON public.subscription_requests FOR SELECT USING ((auth.uid() = user_id));                                                                                                     |
| CREATE POLICY Admins can manage subscriptions ON public.user_subscriptions FOR ALL USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())
 LIMIT 1) = 'admin'::text));                                    |
| CREATE POLICY Admins can view all subscriptions ON public.user_subscriptions FOR SELECT USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())
 LIMIT 1) = 'admin'::text));                               |
| CREATE POLICY Users can view own subscriptions ON public.user_subscriptions FOR SELECT USING ((auth.uid() = user_id));                                                                                                                |


-- 8. RLS Status - Whether RLS is enabled/disabled per table


| rls_statement                                                       |
| ------------------------------------------------------------------- |
| ALTER TABLE public.booking_audit ENABLE ROW LEVEL SECURITY;         |
| ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;        |
| ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;       |
| ALTER TABLE public.class_waitlist ENABLE ROW LEVEL SECURITY;        |
| ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;               |
| ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;              |
| ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;    |
| ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY; |
| ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;    |


-- 9. Views - All custom views and their definitions  


| view_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CREATE VIEW public.calendar_events AS 
 SELECT cs.id,
    cs.class_id,
    c.title,
    c.description,
    c.coach,
    c.location,
    c.difficulty_level,
    c.max_capacity,
    cs.start_datetime,
    cs.end_datetime,
    cs.is_recurring,
    cs.recurrence_rule,
    cs.parent_schedule_id,
    cs.is_exception,
    cs.exception_reason,
    cs.current_bookings,
    cs.is_cancelled,
    cs.cancellation_reason,
    cs.created_at,
    cs.updated_at
   FROM (class_schedules cs
     JOIN classes c ON ((cs.class_id = c.id)))
  WHERE ((NOT cs.is_exception) AND (NOT cs.is_cancelled)); |
| CREATE VIEW public.calendar_events_optimized AS 
 SELECT cs.id,
    cs.class_id,
    c.title,
    c.description,
    c.coach,
    c.location,
    c.difficulty_level,
    c.max_capacity,
    cs.start_datetime,
    cs.end_datetime,
    cs.current_bookings,
    cs.is_cancelled,
    cs.is_exception
   FROM (class_schedules cs
     JOIN classes c ON ((cs.class_id = c.id)))
  WHERE ((NOT cs.is_exception) AND (NOT cs.is_cancelled) AND (cs.start_datetime >= now()))
  ORDER BY cs.start_datetime;                                                                                            |


-- 10. Sequences - All sequences with their settings   


Success. No rows returned


-- 11. Table Grants - Permission grants on tables


| grant_statement                                                        |
| ---------------------------------------------------------------------- |
| GRANT DELETE ON public.booking_audit TO anon;                          |
| GRANT INSERT ON public.booking_audit TO anon;                          |
| GRANT REFERENCES ON public.booking_audit TO anon;                      |
| GRANT SELECT ON public.booking_audit TO anon;                          |
| GRANT TRIGGER ON public.booking_audit TO anon;                         |
| GRANT TRUNCATE ON public.booking_audit TO anon;                        |
| GRANT UPDATE ON public.booking_audit TO anon;                          |
| GRANT DELETE ON public.booking_audit TO authenticated;                 |
| GRANT INSERT ON public.booking_audit TO authenticated;                 |
| GRANT REFERENCES ON public.booking_audit TO authenticated;             |
| GRANT SELECT ON public.booking_audit TO authenticated;                 |
| GRANT TRIGGER ON public.booking_audit TO authenticated;                |
| GRANT TRUNCATE ON public.booking_audit TO authenticated;               |
| GRANT UPDATE ON public.booking_audit TO authenticated;                 |
| GRANT DELETE ON public.booking_audit TO service_role;                  |
| GRANT INSERT ON public.booking_audit TO service_role;                  |
| GRANT REFERENCES ON public.booking_audit TO service_role;              |
| GRANT SELECT ON public.booking_audit TO service_role;                  |
| GRANT TRIGGER ON public.booking_audit TO service_role;                 |
| GRANT TRUNCATE ON public.booking_audit TO service_role;                |
| GRANT UPDATE ON public.booking_audit TO service_role;                  |
| GRANT DELETE ON public.calendar_events TO anon;                        |
| GRANT INSERT ON public.calendar_events TO anon;                        |
| GRANT REFERENCES ON public.calendar_events TO anon;                    |
| GRANT SELECT ON public.calendar_events TO anon;                        |
| GRANT TRIGGER ON public.calendar_events TO anon;                       |
| GRANT TRUNCATE ON public.calendar_events TO anon;                      |
| GRANT UPDATE ON public.calendar_events TO anon;                        |
| GRANT DELETE ON public.calendar_events TO authenticated;               |
| GRANT INSERT ON public.calendar_events TO authenticated;               |
| GRANT REFERENCES ON public.calendar_events TO authenticated;           |
| GRANT SELECT ON public.calendar_events TO authenticated;               |
| GRANT TRIGGER ON public.calendar_events TO authenticated;              |
| GRANT TRUNCATE ON public.calendar_events TO authenticated;             |
| GRANT UPDATE ON public.calendar_events TO authenticated;               |
| GRANT DELETE ON public.calendar_events TO service_role;                |
| GRANT INSERT ON public.calendar_events TO service_role;                |
| GRANT REFERENCES ON public.calendar_events TO service_role;            |
| GRANT SELECT ON public.calendar_events TO service_role;                |
| GRANT TRIGGER ON public.calendar_events TO service_role;               |
| GRANT TRUNCATE ON public.calendar_events TO service_role;              |
| GRANT UPDATE ON public.calendar_events TO service_role;                |
| GRANT DELETE ON public.calendar_events_optimized TO anon;              |
| GRANT INSERT ON public.calendar_events_optimized TO anon;              |
| GRANT REFERENCES ON public.calendar_events_optimized TO anon;          |
| GRANT SELECT ON public.calendar_events_optimized TO anon;              |
| GRANT TRIGGER ON public.calendar_events_optimized TO anon;             |
| GRANT TRUNCATE ON public.calendar_events_optimized TO anon;            |
| GRANT UPDATE ON public.calendar_events_optimized TO anon;              |
| GRANT DELETE ON public.calendar_events_optimized TO authenticated;     |
| GRANT INSERT ON public.calendar_events_optimized TO authenticated;     |
| GRANT REFERENCES ON public.calendar_events_optimized TO authenticated; |
| GRANT SELECT ON public.calendar_events_optimized TO authenticated;     |
| GRANT TRIGGER ON public.calendar_events_optimized TO authenticated;    |
| GRANT TRUNCATE ON public.calendar_events_optimized TO authenticated;   |
| GRANT UPDATE ON public.calendar_events_optimized TO authenticated;     |
| GRANT DELETE ON public.calendar_events_optimized TO service_role;      |
| GRANT INSERT ON public.calendar_events_optimized TO service_role;      |
| GRANT REFERENCES ON public.calendar_events_optimized TO service_role;  |
| GRANT SELECT ON public.calendar_events_optimized TO service_role;      |
| GRANT TRIGGER ON public.calendar_events_optimized TO service_role;     |
| GRANT TRUNCATE ON public.calendar_events_optimized TO service_role;    |
| GRANT UPDATE ON public.calendar_events_optimized TO service_role;      |
| GRANT DELETE ON public.class_bookings TO anon;                         |
| GRANT INSERT ON public.class_bookings TO anon;                         |
| GRANT REFERENCES ON public.class_bookings TO anon;                     |
| GRANT SELECT ON public.class_bookings TO anon;                         |
| GRANT TRIGGER ON public.class_bookings TO anon;                        |
| GRANT TRUNCATE ON public.class_bookings TO anon;                       |
| GRANT UPDATE ON public.class_bookings TO anon;                         |
| GRANT DELETE ON public.class_bookings TO authenticated;                |
| GRANT INSERT ON public.class_bookings TO authenticated;                |
| GRANT REFERENCES ON public.class_bookings TO authenticated;            |
| GRANT SELECT ON public.class_bookings TO authenticated;                |
| GRANT TRIGGER ON public.class_bookings TO authenticated;               |
| GRANT TRUNCATE ON public.class_bookings TO authenticated;              |
| GRANT UPDATE ON public.class_bookings TO authenticated;                |
| GRANT DELETE ON public.class_bookings TO service_role;                 |
| GRANT INSERT ON public.class_bookings TO service_role;                 |
| GRANT REFERENCES ON public.class_bookings TO service_role;             |
| GRANT SELECT ON public.class_bookings TO service_role;                 |
| GRANT TRIGGER ON public.class_bookings TO service_role;                |
| GRANT TRUNCATE ON public.class_bookings TO service_role;               |
| GRANT UPDATE ON public.class_bookings TO service_role;                 |
| GRANT DELETE ON public.class_schedules TO anon;                        |
| GRANT INSERT ON public.class_schedules TO anon;                        |
| GRANT REFERENCES ON public.class_schedules TO anon;                    |
| GRANT SELECT ON public.class_schedules TO anon;                        |
| GRANT TRIGGER ON public.class_schedules TO anon;                       |
| GRANT TRUNCATE ON public.class_schedules TO anon;                      |
| GRANT UPDATE ON public.class_schedules TO anon;                        |
| GRANT DELETE ON public.class_schedules TO authenticated;               |
| GRANT INSERT ON public.class_schedules TO authenticated;               |
| GRANT REFERENCES ON public.class_schedules TO authenticated;           |
| GRANT SELECT ON public.class_schedules TO authenticated;               |
| GRANT TRIGGER ON public.class_schedules TO authenticated;              |
| GRANT TRUNCATE ON public.class_schedules TO authenticated;             |
| GRANT UPDATE ON public.class_schedules TO authenticated;               |
| GRANT DELETE ON public.class_schedules TO service_role;                |
| GRANT INSERT ON public.class_schedules TO service_role;                |
| GRANT REFERENCES ON public.class_schedules TO service_role;            |
| GRANT SELECT ON public.class_schedules TO service_role;                |
| GRANT TRIGGER ON public.class_schedules TO service_role;               |
| GRANT TRUNCATE ON public.class_schedules TO service_role;              |
| GRANT UPDATE ON public.class_schedules TO service_role;                |
| GRANT DELETE ON public.class_waitlist TO anon;                         |
| GRANT INSERT ON public.class_waitlist TO anon;                         |
| GRANT REFERENCES ON public.class_waitlist TO anon;                     |
| GRANT SELECT ON public.class_waitlist TO anon;                         |
| GRANT TRIGGER ON public.class_waitlist TO anon;                        |
| GRANT TRUNCATE ON public.class_waitlist TO anon;                       |
| GRANT UPDATE ON public.class_waitlist TO anon;                         |
| GRANT DELETE ON public.class_waitlist TO authenticated;                |
| GRANT INSERT ON public.class_waitlist TO authenticated;                |
| GRANT REFERENCES ON public.class_waitlist TO authenticated;            |
| GRANT SELECT ON public.class_waitlist TO authenticated;                |
| GRANT TRIGGER ON public.class_waitlist TO authenticated;               |
| GRANT TRUNCATE ON public.class_waitlist TO authenticated;              |
| GRANT UPDATE ON public.class_waitlist TO authenticated;                |
| GRANT DELETE ON public.class_waitlist TO service_role;                 |
| GRANT INSERT ON public.class_waitlist TO service_role;                 |
| GRANT REFERENCES ON public.class_waitlist TO service_role;             |
| GRANT SELECT ON public.class_waitlist TO service_role;                 |
| GRANT TRIGGER ON public.class_waitlist TO service_role;                |
| GRANT TRUNCATE ON public.class_waitlist TO service_role;               |
| GRANT UPDATE ON public.class_waitlist TO service_role;                 |
| GRANT DELETE ON public.classes TO anon;                                |
| GRANT INSERT ON public.classes TO anon;                                |
| GRANT REFERENCES ON public.classes TO anon;                            |
| GRANT SELECT ON public.classes TO anon;                                |
| GRANT TRIGGER ON public.classes TO anon;                               |
| GRANT TRUNCATE ON public.classes TO anon;                              |
| GRANT UPDATE ON public.classes TO anon;                                |
| GRANT DELETE ON public.classes TO authenticated;                       |
| GRANT INSERT ON public.classes TO authenticated;                       |
| GRANT REFERENCES ON public.classes TO authenticated;                   |
| GRANT SELECT ON public.classes TO authenticated;                       |
| GRANT TRIGGER ON public.classes TO authenticated;                      |
| GRANT TRUNCATE ON public.classes TO authenticated;                     |
| GRANT UPDATE ON public.classes TO authenticated;                       |
| GRANT DELETE ON public.classes TO service_role;                        |
| GRANT INSERT ON public.classes TO service_role;                        |
| GRANT REFERENCES ON public.classes TO service_role;                    |
| GRANT SELECT ON public.classes TO service_role;                        |
| GRANT TRIGGER ON public.classes TO service_role;                       |
| GRANT TRUNCATE ON public.classes TO service_role;                      |
| GRANT UPDATE ON public.classes TO service_role;                        |
| GRANT DELETE ON public.profiles TO anon;                               |
| GRANT INSERT ON public.profiles TO anon;                               |
| GRANT REFERENCES ON public.profiles TO anon;                           |
| GRANT SELECT ON public.profiles TO anon;                               |
| GRANT TRIGGER ON public.profiles TO anon;                              |
| GRANT TRUNCATE ON public.profiles TO anon;                             |
| GRANT UPDATE ON public.profiles TO anon;                               |
| GRANT DELETE ON public.profiles TO authenticated;                      |
| GRANT INSERT ON public.profiles TO authenticated;                      |
| GRANT REFERENCES ON public.profiles TO authenticated;                  |
| GRANT SELECT ON public.profiles TO authenticated;                      |
| GRANT TRIGGER ON public.profiles TO authenticated;                     |
| GRANT TRUNCATE ON public.profiles TO authenticated;                    |
| GRANT UPDATE ON public.profiles TO authenticated;                      |
| GRANT DELETE ON public.profiles TO service_role;                       |
| GRANT INSERT ON public.profiles TO service_role;                       |
| GRANT REFERENCES ON public.profiles TO service_role;                   |
| GRANT SELECT ON public.profiles TO service_role;                       |
| GRANT TRIGGER ON public.profiles TO service_role;                      |
| GRANT TRUNCATE ON public.profiles TO service_role;                     |
| GRANT UPDATE ON public.profiles TO service_role;                       |
| GRANT DELETE ON public.subscription_plans TO anon;                     |
| GRANT INSERT ON public.subscription_plans TO anon;                     |
| GRANT REFERENCES ON public.subscription_plans TO anon;                 |
| GRANT SELECT ON public.subscription_plans TO anon;                     |
| GRANT TRIGGER ON public.subscription_plans TO anon;                    |
| GRANT TRUNCATE ON public.subscription_plans TO anon;                   |
| GRANT UPDATE ON public.subscription_plans TO anon;                     |
| GRANT DELETE ON public.subscription_plans TO authenticated;            |
| GRANT INSERT ON public.subscription_plans TO authenticated;            |
| GRANT REFERENCES ON public.subscription_plans TO authenticated;        |
| GRANT SELECT ON public.subscription_plans TO authenticated;            |
| GRANT TRIGGER ON public.subscription_plans TO authenticated;           |
| GRANT TRUNCATE ON public.subscription_plans TO authenticated;          |
| GRANT UPDATE ON public.subscription_plans TO authenticated;            |
| GRANT DELETE ON public.subscription_plans TO service_role;             |
| GRANT INSERT ON public.subscription_plans TO service_role;             |
| GRANT REFERENCES ON public.subscription_plans TO service_role;         |
| GRANT SELECT ON public.subscription_plans TO service_role;             |
| GRANT TRIGGER ON public.subscription_plans TO service_role;            |
| GRANT TRUNCATE ON public.subscription_plans TO service_role;           |
| GRANT UPDATE ON public.subscription_plans TO service_role;             |
| GRANT DELETE ON public.subscription_requests TO anon;                  |
| GRANT INSERT ON public.subscription_requests TO anon;                  |
| GRANT REFERENCES ON public.subscription_requests TO anon;              |
| GRANT SELECT ON public.subscription_requests TO anon;                  |
| GRANT TRIGGER ON public.subscription_requests TO anon;                 |
| GRANT TRUNCATE ON public.subscription_requests TO anon;                |
| GRANT UPDATE ON public.subscription_requests TO anon;                  |
| GRANT DELETE ON public.subscription_requests TO authenticated;         |
| GRANT INSERT ON public.subscription_requests TO authenticated;         |
| GRANT REFERENCES ON public.subscription_requests TO authenticated;     |
| GRANT SELECT ON public.subscription_requests TO authenticated;         |
| GRANT TRIGGER ON public.subscription_requests TO authenticated;        |
| GRANT TRUNCATE ON public.subscription_requests TO authenticated;       |
| GRANT UPDATE ON public.subscription_requests TO authenticated;         |
| GRANT DELETE ON public.subscription_requests TO service_role;          |
| GRANT INSERT ON public.subscription_requests TO service_role;          |
| GRANT REFERENCES ON public.subscription_requests TO service_role;      |
| GRANT SELECT ON public.subscription_requests TO service_role;          |
| GRANT TRIGGER ON public.subscription_requests TO service_role;         |
| GRANT TRUNCATE ON public.subscription_requests TO service_role;        |
| GRANT UPDATE ON public.subscription_requests TO service_role;          |
| GRANT DELETE ON public.user_subscriptions TO anon;                     |
| GRANT INSERT ON public.user_subscriptions TO anon;                     |
| GRANT REFERENCES ON public.user_subscriptions TO anon;                 |
| GRANT SELECT ON public.user_subscriptions TO anon;                     |
| GRANT TRIGGER ON public.user_subscriptions TO anon;                    |
| GRANT TRUNCATE ON public.user_subscriptions TO anon;                   |
| GRANT UPDATE ON public.user_subscriptions TO anon;                     |
| GRANT DELETE ON public.user_subscriptions TO authenticated;            |
| GRANT INSERT ON public.user_subscriptions TO authenticated;            |
| GRANT REFERENCES ON public.user_subscriptions TO authenticated;        |
| GRANT SELECT ON public.user_subscriptions TO authenticated;            |
| GRANT TRIGGER ON public.user_subscriptions TO authenticated;           |
| GRANT TRUNCATE ON public.user_subscriptions TO authenticated;          |
| GRANT UPDATE ON public.user_subscriptions TO authenticated;            |
| GRANT DELETE ON public.user_subscriptions TO service_role;             |
| GRANT INSERT ON public.user_subscriptions TO service_role;             |
| GRANT REFERENCES ON public.user_subscriptions TO service_role;         |
| GRANT SELECT ON public.user_subscriptions TO service_role;             |
| GRANT TRIGGER ON public.user_subscriptions TO service_role;            |
| GRANT TRUNCATE ON public.user_subscriptions TO service_role;           |
| GRANT UPDATE ON public.user_subscriptions TO service_role;             |


-- 12. Function Grants - Permission grants on functions


| function_grant_statement                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------- |
| GRANT EXECUTE ON FUNCTION public.adjust_waitlist_positions() TO authenticated;                                                        |
| GRANT EXECUTE ON FUNCTION public.book_class(user_uuid uuid, schedule_uuid uuid) TO authenticated;                                     |
| GRANT EXECUTE ON FUNCTION public.can_user_book_class(user_uuid uuid, schedule_uuid uuid) TO authenticated;                            |
| GRANT EXECUTE ON FUNCTION public.cancel_booking(booking_uuid uuid, user_uuid uuid) TO authenticated;                                  |
| GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO authenticated;                                                      |
| GRANT EXECUTE ON FUNCTION public.check_user_admin(user_id uuid) TO authenticated;                                                     |
| GRANT EXECUTE ON FUNCTION public.get_admin_users_data(page_offset integer DEFAULT 0, page_limit integer DEFAULT 25) TO authenticated; |
| GRANT EXECUTE ON FUNCTION public.get_database_performance_stats() TO authenticated;                                                   |
| GRANT EXECUTE ON FUNCTION public.get_user_dashboard_data(user_uuid uuid) TO authenticated;                                            |
| GRANT EXECUTE ON FUNCTION public.get_user_valid_subscription(user_uuid uuid) TO authenticated;                                        |
| GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;                                                                  |
| GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;                                                                         |
| GRANT EXECUTE ON FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid()) TO authenticated;                                        |
| GRANT EXECUTE ON FUNCTION public.join_waitlist(user_uuid uuid, schedule_uuid uuid) TO authenticated;                                  |
| GRANT EXECUTE ON FUNCTION public.promote_from_waitlist() TO authenticated;                                                            |
| GRANT EXECUTE ON FUNCTION public.reset_weekly_credits() TO authenticated;                                                             |
| GRANT EXECUTE ON FUNCTION public.set_waitlist_position() TO authenticated;                                                            |
| GRANT EXECUTE ON FUNCTION public.update_booking_count() TO authenticated;                                                             |
| GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;                                                         |