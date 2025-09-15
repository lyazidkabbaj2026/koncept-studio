-- Create RPC function to handle credit updates securely
-- This function bypasses RLS policies and ensures atomic credit updates

CREATE OR REPLACE FUNCTION public.update_subscription_credits(
  subscription_uuid uuid,
  credits_change integer,
  weekly_credits_change integer DEFAULT 0,
  credits_used_change integer DEFAULT 0
) RETURNS jsonb AS $$

DECLARE
  result_data jsonb;
BEGIN
  -- Update the subscription credits atomically
  UPDATE public.user_subscriptions
  SET
    credits_remaining = GREATEST(0, credits_remaining + credits_change),
    weekly_credits_used = GREATEST(0, weekly_credits_used + weekly_credits_change),
    credits_used = GREATEST(0, COALESCE(credits_used, 0) + credits_used_change),
    updated_at = NOW()
  WHERE id = subscription_uuid
  RETURNING jsonb_build_object(
    'id', id,
    'credits_remaining', credits_remaining,
    'weekly_credits_used', weekly_credits_used,
    'credits_used', credits_used,
    'updated_at', updated_at
  ) INTO result_data;

  -- Check if any row was updated
  IF result_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Abonnement introuvable'
    );
  END IF;

  -- Return success with updated data
  RETURN jsonb_build_object(
    'success', true,
    'subscription', result_data,
    'message', 'Crédits mis à jour avec succès'
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erreur lors de la mise à jour des crédits: ' || SQLERRM
    );
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_subscription_credits(uuid, integer, integer, integer) TO authenticated;