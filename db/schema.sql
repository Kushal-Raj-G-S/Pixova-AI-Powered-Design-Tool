-- ===================================
-- PIXOVA AI - DATABASE SCHEMA
-- ===================================
-- 
-- PLAN SYSTEM & CREDIT ALLOCATION:
--   - free: 100 credits (default for new users)
--   - pro: 2000 credits (paid plan)
--   - enterprise: 10000 credits (paid plan)
--   - admin: 999999 credits (unlimited)
--
-- HOW TO MANUALLY CHANGE USER PLAN:
--   1. Go to Supabase Dashboard → Table Editor → profiles
--   2. Find the user by email/id
--   3. Edit 'plan_id' column: free | pro | enterprise | admin
--   4. Edit 'credits' column to match the plan
--   5. Save - changes reflect immediately!
--
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- PLANS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 4 plans (this creates the dropdown options in profiles table)
INSERT INTO public.plans (id, name, credits, price, features) VALUES
('free', 'Free', 100, 0.00, '["100 AI Generations", "Basic Templates", "Standard Quality (1024px)", "PNG Export", "Text Overlay Tool"]'),
('pro', 'Pro', 2000, 29.99, '["2000 AI Generations", "All Templates", "High Quality (1536px)", "All Export Formats", "Batch Generation (5x)", "Priority Support", "Commercial License"]'),
('enterprise', 'Enterprise', 10000, 99.99, '["10000 AI Generations", "Unlimited Templates", "Ultra Quality (2048px)", "API Access", "White Label", "Dedicated Support", "Team Collaboration", "Custom Models"]'),
('admin', 'Admin', 999999, 0.00, '["Unlimited Everything", "Full Platform Access", "Admin Panel", "User Management", "Analytics Dashboard"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- ===================================
-- USER PROFILES TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free' NOT NULL REFERENCES public.plans(id) ON DELETE SET DEFAULT ON UPDATE CASCADE,
  credits INTEGER DEFAULT 100,
  total_designs INTEGER DEFAULT 0,
  total_exports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- DESIGNS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- logo, social, mobile, landing, business-card, flyer
  style TEXT, -- modern, corporate, creative, minimalist, vibrant, elegant
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  folder TEXT DEFAULT 'My Designs',
  favorite BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  format TEXT DEFAULT 'png', -- png, jpg, pdf, svg
  model_used TEXT, -- AI model that generated it
  generation_time_ms INTEGER,
  credits_used INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- PROJECTS TABLE (for organization)
-- ===================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, archived, completed
  color TEXT DEFAULT '#6366F1', -- For UI organization
  design_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- ACTIVITY LOG TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- created, edited, exported, deleted, upgraded
  entity_type TEXT NOT NULL, -- design, project, plan
  entity_id UUID,
  entity_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- CREDIT TRANSACTIONS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for additions, negative for usage
  reason TEXT NOT NULL, -- 'design_generation', 'plan_upgrade', 'manual_adjustment'
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- ACHIEVEMENTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL, -- first_design, streak_7, designs_10, exports_50
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- ===================================
-- PLANS POLICIES (public read)
-- ===================================
CREATE POLICY "Anyone can view plans"
  ON public.plans FOR SELECT
  TO authenticated
  USING (true);

-- ===================================
-- PROFILES POLICIES
-- ===================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===================================
-- DESIGNS POLICIES
-- ===================================
CREATE POLICY "Users can view own designs"
  ON public.designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs"
  ON public.designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON public.designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON public.designs FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================
-- PROJECTS POLICIES
-- ===================================
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================
-- ACTIVITY LOG POLICIES
-- ===================================
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================================
-- CREDIT TRANSACTIONS POLICIES
-- ===================================
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================================
-- ACHIEVEMENTS POLICIES
-- ===================================
CREATE POLICY "Users can view own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_favorite ON public.designs(user_id, favorite) WHERE favorite = true;
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
