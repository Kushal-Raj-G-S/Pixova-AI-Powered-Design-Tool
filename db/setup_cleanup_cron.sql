-- Setup automatic cleanup of expired designs
-- This uses Supabase Edge Functions or pg_cron extension

-- Option 1: Using Supabase Edge Functions (Recommended)
-- Create this as a Supabase Edge Function and schedule it via cron
-- Function: cleanup-expired-designs
-- Schedule: Daily at 2 AM UTC
-- Code: See frontend/lib/database.ts cleanupExpiredDesigns()

-- Option 2: Using pg_cron (if enabled in your Supabase project)
-- First, enable pg_cron extension:
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'cleanup-expired-designs',
  '0 2 * * *', -- Every day at 2 AM
  $$
  DELETE FROM designs
  WHERE (metadata->>'expiryDate')::TIMESTAMPTZ < NOW();
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove the job (if needed):
-- SELECT cron.unschedule('cleanup-expired-designs');

COMMENT ON EXTENSION pg_cron IS 'Runs cleanup job daily at 2 AM to delete expired designs based on user plan';
