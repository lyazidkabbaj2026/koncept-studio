-- Supabase Cron Job to reset weekly credits for abonnement users
-- This will run every Sunday at 23:59 to reset weekly_credits_used to 0

-- First, create the function that will reset weekly credits
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

-- Grant execute permission to the service role (for cron jobs)
GRANT EXECUTE ON FUNCTION public.reset_weekly_credits() TO service_role;

-- Create the cron job
-- TEMPORARY: Run in 30 minutes for testing (replace with actual time)
-- Calculate 30 minutes from now
SELECT cron.schedule(
    'weekly-credits-reset-test',
    -- This will run once in 30 minutes for testing
    format('%s %s * * *',
           EXTRACT(MINUTE FROM NOW() + INTERVAL '30 minutes')::text,
           EXTRACT(HOUR FROM NOW() + INTERVAL '30 minutes')::text
    ),
    'SELECT public.reset_weekly_credits();'
);

-- PRODUCTION SCHEDULE (uncomment this and remove the test schedule above after testing):
-- SELECT cron.schedule(
--     'weekly-credits-reset',
--     '59 23 * * 0',  -- Every Sunday at 23:59
--     'SELECT public.reset_weekly_credits();'
-- );

-- To view scheduled cron jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job (for testing):
-- SELECT cron.unschedule('weekly-credits-reset-test');

-- To check cron job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;