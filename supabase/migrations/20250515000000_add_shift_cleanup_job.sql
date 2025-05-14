
-- Enable the pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add a scheduled job to run every day at 1:00 AM
SELECT cron.schedule(
  'clean-shift-history-daily',
  '0 1 * * *',  -- Run at 1:00 AM every day
  $$
  SELECT net.http_post(
    url:='https://fphmujxruswmvlwceodl.supabase.co/functions/v1/clean-shift-history',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || (SELECT value FROM secrets.secrets WHERE key = 'SUPABASE_ANON_KEY') || '"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Note: This job uses the ANON_KEY stored in secrets
-- To see job status, run: SELECT * FROM cron.job;
