-- Fix the promote_from_waitlist trigger to work without the problematic get_user_valid_subscription function

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
        -- Get their subscription info directly from tables (not function)
        SELECT us.*, sp.type as plan_type INTO subscription_record
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.id = waitlist_entry.subscription_id
          AND us.status = 'active'
          AND us.end_date > NOW()
        LIMIT 1;

        IF subscription_record IS NOT NULL THEN
          -- Create booking for waitlisted user
          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

          -- Credit is already deducted when joining waitlist, so no additional deduction needed
          -- This is the new behavior: credit was deducted on waitlist join

          -- Remove from waitlist
          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;

          -- Update positions for remaining waitlist entries
          UPDATE class_waitlist
          SET position = position - 1
          WHERE schedule_id = NEW.schedule_id
            AND position > waitlist_entry.position;

          -- Log successful promotion
          RAISE LOG 'User % promoted from waitlist for schedule %', waitlist_entry.user_id, NEW.schedule_id;
        ELSE
          -- Log failed promotion due to invalid subscription
          RAISE LOG 'Failed to promote user % from waitlist: invalid subscription %', waitlist_entry.user_id, waitlist_entry.subscription_id;
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
        -- Get their subscription info directly from tables (not function)
        SELECT us.*, sp.type as plan_type INTO subscription_record
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.id = waitlist_entry.subscription_id
          AND us.status = 'active'
          AND us.end_date > NOW()
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

          -- Log successful promotion
          RAISE LOG 'User % promoted from waitlist for schedule % (delete trigger)', waitlist_entry.user_id, OLD.schedule_id;
        ELSE
          -- Log failed promotion due to invalid subscription
          RAISE LOG 'Failed to promote user % from waitlist: invalid subscription % (delete trigger)', waitlist_entry.user_id, waitlist_entry.subscription_id;
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

-- Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS promote_from_waitlist_trigger ON class_bookings;
CREATE TRIGGER promote_from_waitlist_trigger
  AFTER UPDATE OR DELETE ON class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION promote_from_waitlist();