-- Enable the pg_cron extension if not already enabled
-- Note: This needs to be run by a superuser in Supabase dashboard
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs every 12 hours to clean up expired waitlist entries
-- This needs to be run in the Supabase SQL editor as it requires special permissions

-- First, create a wrapper function that can be called by cron
CREATE OR REPLACE FUNCTION scheduled_waitlist_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleanup_result jsonb;
BEGIN
  -- Call our existing cleanup function
  SELECT cleanup_expired_waitlists() INTO cleanup_result;

  -- Log the result
  RAISE LOG 'Scheduled waitlist cleanup completed: %', cleanup_result;

EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in scheduled waitlist cleanup: %', SQLERRM;
END;
$$;

-- Schedule the cron job to run every 12 hours
-- Note: This command needs to be run in Supabase dashboard with proper permissions
/*
SELECT cron.schedule(
  'cleanup-expired-waitlists',           -- job name
  '0 */12 * * *',                       -- every 12 hours (at 00:00 and 12:00)
  'SELECT scheduled_waitlist_cleanup();' -- SQL command to run
);
*/

-- Alternative: If pg_cron is not available, create a simpler approach
-- You can manually call this function or set up an external cron job to call it via API

-- To check if cron job is scheduled (run this after setting up the cron):
-- SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-waitlists';