-- Simple credit update functions that bypass RLS issues

-- Function to update credits after booking
CREATE OR REPLACE FUNCTION update_booking_credits(
  user_uuid uuid,
  subscription_uuid uuid,
  subscription_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF subscription_type = 'abonnement' THEN
    UPDATE user_subscriptions
    SET weekly_credits_used = weekly_credits_used + 1,
        updated_at = NOW()
    WHERE id = subscription_uuid
      AND user_id = user_uuid;
  ELSIF subscription_type = 'carnet' THEN
    UPDATE user_subscriptions
    SET credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1,
        updated_at = NOW()
    WHERE id = subscription_uuid
      AND user_id = user_uuid;
  END IF;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'rows_affected', rows_affected,
    'subscription_type', subscription_type
  );
END;
$$;

-- Function to refund credits after cancellation
CREATE OR REPLACE FUNCTION refund_booking_credits(
  user_uuid uuid,
  subscription_uuid uuid,
  subscription_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF subscription_type = 'abonnement' THEN
    UPDATE user_subscriptions
    SET weekly_credits_used = GREATEST(0, weekly_credits_used - 1),
        updated_at = NOW()
    WHERE id = subscription_uuid
      AND user_id = user_uuid;
  ELSIF subscription_type = 'carnet' THEN
    UPDATE user_subscriptions
    SET credits_remaining = credits_remaining + 1,
        credits_used = GREATEST(0, credits_used - 1),
        updated_at = NOW()
    WHERE id = subscription_uuid
      AND user_id = user_uuid;
  END IF;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'rows_affected', rows_affected,
    'subscription_type', subscription_type
  );
END;
$$;