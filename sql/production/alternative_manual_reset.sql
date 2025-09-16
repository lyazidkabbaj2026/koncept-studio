-- Alternative: Manual weekly credits reset function
-- Since pg_cron might not be available, you can run this manually or via Edge Function

-- Create the function that will reset weekly credits
CREATE OR REPLACE FUNCTION public.reset_weekly_credits()
RETURNS jsonb AS $$
DECLARE
    affected_rows INTEGER := 0;
    log_message TEXT;
BEGIN
    -- Update all active abonnement subscriptions to reset weekly credits
    UPDATE public.user_subscriptions
    SET
        weekly_credits_used = 0,
        last_weekly_reset = NOW(),
        updated_at = NOW()
    FROM public.subscription_plans sp
    WHERE user_subscriptions.plan_id = sp.id
        AND user_subscriptions.status = 'active'
        AND sp.type = 'abonnement'
        AND user_subscriptions.end_date > NOW();

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    log_message := format('Weekly credits reset completed. %s abonnement subscriptions updated at %s',
                         affected_rows, NOW());

    -- Log the operation
    RAISE LOG '%', log_message;

    -- Return success with details
    RETURN jsonb_build_object(
        'success', true,
        'affected_rows', affected_rows,
        'reset_time', NOW(),
        'message', log_message
    );

EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in reset_weekly_credits: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'reset_time', NOW()
        );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.reset_weekly_credits() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_weekly_credits() TO service_role;

-- Test the function manually:
-- SELECT public.reset_weekly_credits();

-- To see which users would be affected:
SELECT
    us.id,
    p.full_name,
    sp.name as plan_name,
    us.weekly_credits_used,
    us.last_weekly_reset
FROM public.user_subscriptions us
JOIN public.subscription_plans sp ON us.plan_id = sp.id
JOIN public.profiles p ON us.user_id = p.id
WHERE us.status = 'active'
    AND sp.type = 'abonnement'
    AND us.end_date > NOW();