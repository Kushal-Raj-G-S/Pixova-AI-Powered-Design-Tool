-- Add expiry date tracking to designs table
-- Run this migration after creating the initial schema

-- Add function to automatically set expiry date based on user's plan
CREATE OR REPLACE FUNCTION set_design_expiry()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  expiry_days INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan_id INTO user_plan
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Set expiry days based on plan
  expiry_days := CASE user_plan
    WHEN 'free' THEN 5
    WHEN 'pro' THEN 10
    WHEN 'enterprise' THEN 15
    WHEN 'admin' THEN 20
    ELSE 5
  END;
  
  -- Add expiry date to metadata
  NEW.metadata := jsonb_set(
    COALESCE(NEW.metadata, '{}'::jsonb),
    '{expiryDate}',
    to_jsonb((NOW() + (expiry_days || ' days')::INTERVAL)::TEXT)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set expiry on insert
DROP TRIGGER IF EXISTS trigger_set_design_expiry ON designs;
CREATE TRIGGER trigger_set_design_expiry
  BEFORE INSERT ON designs
  FOR EACH ROW
  EXECUTE FUNCTION set_design_expiry();

-- Add index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_designs_expiry ON designs 
  USING gin ((metadata->'expiryDate'));

COMMENT ON FUNCTION set_design_expiry() IS 'Automatically sets expiry date for designs based on user plan: free=5d, pro=10d, enterprise=15d, admin=20d';
