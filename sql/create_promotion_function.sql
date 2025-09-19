-- Create a simple promotion function similar to update_booking_credits
CREATE OR REPLACE FUNCTION handle_waitlist_promotion(schedule_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  waitlist_entry RECORD;
  class_info RECORD;
  current_count INTEGER;
  new_booking_id UUID;
BEGIN
  -- Get class capacity info
  SELECT c.max_capacity INTO class_info
  FROM class_schedules cs
  JOIN classes c ON cs.class_id = c.id
  WHERE cs.id = schedule_uuid;

  IF class_info IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Class not found',
      'schedule_id', schedule_uuid
    );
  END IF;

  -- Count current confirmed bookings
  SELECT COUNT(*) INTO current_count
  FROM class_bookings
  WHERE schedule_id = schedule_uuid AND status = 'confirmed';

  -- Check if there's space
  IF current_count >= class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Class is still full',
      'current_bookings', current_count,
      'max_capacity', class_info.max_capacity
    );
  END IF;

  -- Get the first person in waitlist
  SELECT * INTO waitlist_entry
  FROM class_waitlist
  WHERE schedule_id = schedule_uuid
  ORDER BY position ASC
  LIMIT 1;

  IF waitlist_entry IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No one in waitlist to promote',
      'current_bookings', current_count,
      'max_capacity', class_info.max_capacity
    );
  END IF;

  -- Promote them: create booking
  INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed')
  RETURNING id INTO new_booking_id;

  -- Remove from waitlist
  DELETE FROM class_waitlist WHERE id = waitlist_entry.id;

  -- Update remaining positions
  UPDATE class_waitlist
  SET position = position - 1
  WHERE schedule_id = schedule_uuid AND position > waitlist_entry.position;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted from waitlist',
    'promoted_user_id', waitlist_entry.user_id,
    'new_booking_id', new_booking_id,
    'waitlist_position', waitlist_entry.position
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error during promotion: ' || SQLERRM
    );
END;
$$;