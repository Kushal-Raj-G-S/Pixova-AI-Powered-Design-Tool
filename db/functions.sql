-- ===================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ===================================

-- ===================================
-- FUNCTION: Create profile on signup
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with free plan (100 credits)
  INSERT INTO public.profiles (id, email, first_name, last_name, plan_id, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'last_name',
    'free',
    100
  );
  
  -- Log signup activity
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_name)
  VALUES (NEW.id, 'created', 'account', 'Account Created');
  
  -- Add welcome achievement
  INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
  VALUES (
    NEW.id, 
    'welcome', 
    'Welcome to Pixova!', 
    'Started your AI design journey', 
    '🎉'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- TRIGGER: Auto-create profile on signup
-- ===================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ===================================
-- FUNCTION: Deduct credits on design creation
-- ===================================
CREATE OR REPLACE FUNCTION public.deduct_credits_on_design()
RETURNS TRIGGER AS $$
DECLARE
  v_current_credits INTEGER;
  v_credits_cost INTEGER := 1; -- Default cost per design
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Check if user has enough credits
  IF v_current_credits < v_credits_cost THEN
    RAISE EXCEPTION 'Insufficient credits. Please upgrade your plan.';
  END IF;
  
  -- Deduct credits
  UPDATE public.profiles
  SET 
    credits = credits - v_credits_cost,
    total_designs = total_designs + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Log credit transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, design_id, balance_after)
  VALUES (
    NEW.user_id,
    -v_credits_cost,
    'design_generation',
    NEW.id,
    v_current_credits - v_credits_cost
  );
  
  -- Log activity
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, entity_name)
  VALUES (NEW.user_id, 'created', 'design', NEW.id, NEW.name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- TRIGGER: Auto-deduct credits on design insert
-- ===================================
DROP TRIGGER IF EXISTS on_design_created ON public.designs;
CREATE TRIGGER on_design_created
  AFTER INSERT ON public.designs
  FOR EACH ROW EXECUTE PROCEDURE public.deduct_credits_on_design();

-- ===================================
-- FUNCTION: Update profile stats on export
-- ===================================
CREATE OR REPLACE FUNCTION public.increment_exports()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_exports = total_exports + 1,
    updated_at = NOW()
  WHERE id = auth.uid();
  
  -- Log activity
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_name)
  VALUES (auth.uid(), 'exported', 'design', 'Design Export');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Change user plan
-- ===================================
CREATE OR REPLACE FUNCTION public.change_user_plan(
  p_user_id UUID,
  p_new_plan_id TEXT
)
RETURNS void AS $$
DECLARE
  v_plan_credits INTEGER;
BEGIN
  -- Get credits for new plan
  SELECT credits INTO v_plan_credits
  FROM public.plans
  WHERE id = p_new_plan_id;
  
  IF v_plan_credits IS NULL THEN
    RAISE EXCEPTION 'Invalid plan ID';
  END IF;
  
  -- Update user plan and credits
  UPDATE public.profiles
  SET 
    plan_id = p_new_plan_id,
    credits = v_plan_credits,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after)
  VALUES (p_user_id, v_plan_credits, 'plan_change: ' || p_new_plan_id, v_plan_credits);
  
  -- Log activity
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_name)
  VALUES (p_user_id, 'upgraded', 'plan', p_new_plan_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Handle payment completion (Stripe, PayPal, etc.)
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_payment_success(
  p_user_id UUID,
  p_new_plan_id TEXT,
  p_payment_method TEXT DEFAULT 'stripe',
  p_transaction_id TEXT DEFAULT NULL,
  p_amount DECIMAL DEFAULT 0.00
)
RETURNS JSON AS $$
DECLARE
  v_plan_credits INTEGER;
  v_current_credits INTEGER;
  v_new_total_credits INTEGER;
  v_old_plan_id TEXT;
  v_result JSON;
BEGIN
  -- Get current user info
  SELECT plan_id, credits INTO v_old_plan_id, v_current_credits
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get new plan credits
  SELECT credits INTO v_plan_credits
  FROM public.plans
  WHERE id = p_new_plan_id AND is_active = true;
  
  IF v_plan_credits IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive plan ID: %', p_new_plan_id;
  END IF;
  
  -- Calculate new total (keep existing credits + add plan credits)
  v_new_total_credits := v_current_credits + v_plan_credits;
  
  -- Update user plan
  UPDATE public.profiles
  SET 
    plan_id = p_new_plan_id,
    credits = v_new_total_credits,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log credit transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after)
  VALUES (
    p_user_id, 
    v_plan_credits, 
    'payment_success: ' || p_new_plan_id || ' (via ' || p_payment_method || ')',
    v_new_total_credits
  );
  
  -- Log activity with payment details
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_name, metadata)
  VALUES (
    p_user_id, 
    'upgraded', 
    'plan', 
    p_new_plan_id,
    jsonb_build_object(
      'old_plan', v_old_plan_id,
      'new_plan', p_new_plan_id,
      'payment_method', p_payment_method,
      'transaction_id', p_transaction_id,
      'amount', p_amount,
      'credits_added', v_plan_credits
    )
  );
  
  -- Award achievement for first upgrade (if upgrading from free)
  IF v_old_plan_id = 'free' THEN
    INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'first_upgrade', 'Premium Member', 'Upgraded to a paid plan', '💎')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Return success with details
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'old_plan', v_old_plan_id,
    'new_plan', p_new_plan_id,
    'credits_added', v_plan_credits,
    'total_credits', v_new_total_credits,
    'transaction_id', p_transaction_id
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Add credits manually
-- ===================================
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'manual_adjustment'
)
RETURNS void AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update credits
  UPDATE public.profiles
  SET 
    credits = credits + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after)
  VALUES (p_user_id, p_amount, p_reason, v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Get user stats
-- ===================================
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_designs BIGINT,
  total_exports BIGINT,
  total_favorites BIGINT,
  credits_remaining INTEGER,
  plan_name TEXT,
  days_active INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.total_designs::BIGINT,
    p.total_exports::BIGINT,
    (SELECT COUNT(*) FROM public.designs WHERE user_id = p_user_id AND favorite = true)::BIGINT,
    p.credits,
    pl.name,
    EXTRACT(DAY FROM (NOW() - p.created_at))::INTEGER
  FROM public.profiles p
  JOIN public.plans pl ON p.plan_id = pl.id
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Check and award achievements
-- ===================================
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_design_count INTEGER;
  v_export_count INTEGER;
BEGIN
  -- Get user stats
  SELECT total_designs, total_exports INTO v_design_count, v_export_count
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- First design achievement
  IF v_design_count = 1 THEN
    INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'first_design', 'First Creation', 'Generated your first AI design', '🎨')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- 10 designs achievement
  IF v_design_count = 10 THEN
    INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'designs_10', 'Design Explorer', 'Created 10 AI designs', '🚀')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- 50 designs achievement
  IF v_design_count = 50 THEN
    INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'designs_50', 'Design Master', 'Created 50 AI designs', '👑')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- First export achievement
  IF v_export_count = 1 THEN
    INSERT INTO public.achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'first_export', 'First Export', 'Exported your first design', '📥')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- FUNCTION: Clean up old activity logs (maintenance)
-- ===================================
CREATE OR REPLACE FUNCTION public.cleanup_old_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM public.activity_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
