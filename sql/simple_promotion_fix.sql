-- Simple fix: Replace the promote_from_waitlist function with a working version

-- First, let's create a simple function that works without the problematic get_user_valid_subscription
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  waitlist_entry RECORD;
  class_info RECORD;
  current_count INTEGER;
BEGIN
  -- Only handle cancellations (status changes from confirmed to cancelled)
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN

    -- Get class capacity info
    SELECT c.max_capacity INTO class_info
    FROM class_schedules cs
    JOIN classes c ON cs.class_id = c.id
    WHERE cs.id = NEW.schedule_id;

    -- Count current confirmed bookings
    SELECT COUNT(*) INTO current_count
    FROM class_bookings
    WHERE schedule_id = NEW.schedule_id AND status = 'confirmed';

    -- If there's now space and someone is waiting
    IF current_count < class_info.max_capacity THEN
      -- Get the first person in waitlist
      SELECT * INTO waitlist_entry
      FROM class_waitlist
      WHERE schedule_id = NEW.schedule_id
      ORDER BY position ASC
      LIMIT 1;

      IF waitlist_entry IS NOT NULL THEN
        -- Promote them: create booking
        INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
        VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');

        -- Remove from waitlist
        DELETE FROM class_waitlist WHERE id = waitlist_entry.id;

        -- Update remaining positions
        UPDATE class_waitlist
        SET position = position - 1
        WHERE schedule_id = NEW.schedule_id AND position > waitlist_entry.position;

        -- Log it
        RAISE LOG 'Promoted user % from waitlist to booking for schedule %', waitlist_entry.user_id, NEW.schedule_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in promotion: %', SQLERRM;
    RETURN NEW;
END;
$$;