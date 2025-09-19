-- Function to automatically expire subscriptions based on business rules
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
  expired_count INTEGER := 0;
  error_count INTEGER := 0;
  has_future_bookings BOOLEAN;
BEGIN
  -- Process all active subscriptions
  FOR subscription_record IN
    SELECT
      us.id,
      us.user_id,
      us.plan_id,
      us.status,
      us.end_date,
      us.credits_remaining,
      sp.type as plan_type,
      sp.name as plan_name
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status = 'active'
  LOOP
    BEGIN
      -- Check expiration criteria based on subscription type
      IF subscription_record.plan_type = 'abonnement' THEN
        -- For abonnement: only check end_date
        IF subscription_record.end_date <= NOW() THEN
          UPDATE user_subscriptions
          SET status = 'expired'
          WHERE id = subscription_record.id;

          expired_count := expired_count + 1;

          RAISE LOG 'Expired abonnement subscription: user_id=%, plan=%, end_date=%',
            subscription_record.user_id,
            subscription_record.plan_name,
            subscription_record.end_date;
        END IF;

      ELSE
        -- For carnet and personal_training: check end_date OR (no credits AND no future bookings)
        IF subscription_record.end_date <= NOW() THEN
          -- Date expired
          UPDATE user_subscriptions
          SET status = 'expired'
          WHERE id = subscription_record.id;

          expired_count := expired_count + 1;

          RAISE LOG 'Expired subscription by date: user_id=%, plan=%, end_date=%',
            subscription_record.user_id,
            subscription_record.plan_name,
            subscription_record.end_date;

        ELSIF subscription_record.plan_type = 'carnet' AND subscription_record.credits_remaining <= 0 THEN
          -- Check if user has future bookings with this subscription
          SELECT EXISTS(
            SELECT 1
            FROM class_bookings cb
            JOIN class_schedules cs ON cb.schedule_id = cs.id
            WHERE cb.subscription_id = subscription_record.id
              AND cb.status = 'confirmed'
              AND cs.start_datetime > NOW()
          ) INTO has_future_bookings;

          -- If no credits and no future bookings, expire it
          IF NOT has_future_bookings THEN
            UPDATE user_subscriptions
            SET status = 'expired'
            WHERE id = subscription_record.id;

            expired_count := expired_count + 1;

            RAISE LOG 'Expired carnet subscription (no credits, no future bookings): user_id=%, plan=%',
              subscription_record.user_id,
              subscription_record.plan_name;
          END IF;
        END IF;
      END IF;

    EXCEPTION
      WHEN others THEN
        error_count := error_count + 1;
        RAISE LOG 'Error expiring subscription %: %', subscription_record.id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expired_subscriptions', expired_count,
    'errors', error_count,
    'message', format('Expired %s subscriptions with %s errors', expired_count, error_count),
    'timestamp', NOW()
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error during subscription expiration: ' || SQLERRM,
      'timestamp', NOW()
    );
END;
$$;