-- Function to clean up expired waitlist entries and refund credits
CREATE OR REPLACE FUNCTION cleanup_expired_waitlists()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_entry RECORD;
  refund_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  -- Find all waitlist entries for classes that have already started
  FOR expired_entry IN
    SELECT
      cw.id as waitlist_id,
      cw.user_id,
      cw.schedule_id,
      cw.subscription_id,
      cw.position,
      cs.start_datetime,
      us.id as subscription_db_id,
      sp.type as plan_type
    FROM class_waitlist cw
    JOIN class_schedules cs ON cw.schedule_id = cs.id
    JOIN user_subscriptions us ON cw.subscription_id = us.id
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE cs.start_datetime <= NOW()
  LOOP
    BEGIN
      -- Refund credit based on subscription type
      IF expired_entry.plan_type = 'abonnement' THEN
        UPDATE user_subscriptions
        SET weekly_credits_used = GREATEST(0, weekly_credits_used - 1)
        WHERE id = expired_entry.subscription_id;
      ELSE
        UPDATE user_subscriptions
        SET credits_remaining = credits_remaining + 1,
            credits_used = GREATEST(0, credits_used - 1)
        WHERE id = expired_entry.subscription_id;
      END IF;

      -- Remove from waitlist
      DELETE FROM class_waitlist WHERE id = expired_entry.waitlist_id;

      refund_count := refund_count + 1;

      -- Log the refund
      RAISE LOG 'Refunded expired waitlist entry: user_id=%, schedule_id=%, subscription_type=%',
        expired_entry.user_id, expired_entry.schedule_id, expired_entry.plan_type;

    EXCEPTION
      WHEN others THEN
        error_count := error_count + 1;
        RAISE LOG 'Error refunding waitlist entry %: %', expired_entry.waitlist_id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'refunded_entries', refund_count,
    'errors', error_count,
    'message', format('Cleaned up %s expired waitlist entries with %s errors', refund_count, error_count)
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error during cleanup: ' || SQLERRM
    );
END;
$$;