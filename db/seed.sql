-- ===================================
-- SEED DATA (For Testing)
-- ===================================
-- Run this AFTER schema.sql and functions.sql
-- This creates sample data for development/testing

-- Note: Replace 'YOUR_USER_ID' with actual user ID after signup
-- You can get your user ID from Supabase Dashboard → Authentication → Users

-- ===================================
-- Sample Designs
-- ===================================
-- Uncomment and update user_id after creating your account
/*
INSERT INTO public.designs (user_id, name, type, style, prompt, image_url, favorite, width, height, model_used, created_at)
VALUES 
  (
    'YOUR_USER_ID', 
    'Modern Tech Startup Logo', 
    'logo', 
    'modern', 
    'Modern tech startup logo with blue and purple gradient',
    'https://via.placeholder.com/1024x1024/6366F1/FFFFFF?text=Tech+Logo',
    true,
    1024,
    1024,
    'flux-schnell',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'YOUR_USER_ID',
    'Creative Agency Branding',
    'logo',
    'creative',
    'Creative agency logo with abstract colorful shapes',
    'https://via.placeholder.com/1024x1024/EC4899/FFFFFF?text=Creative',
    true,
    1024,
    1024,
    'imagen-4',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'YOUR_USER_ID',
    'Minimalist Coffee Shop',
    'logo',
    'minimalist',
    'Minimalist coffee shop logo with simple cup icon',
    'https://via.placeholder.com/1024x1024/000000/FFFFFF?text=Coffee',
    false,
    1024,
    1024,
    'dall-e-2',
    NOW() - INTERVAL '1 day'
  );

-- ===================================
-- Sample Projects
-- ===================================
INSERT INTO public.projects (user_id, name, description, status, color, design_count, created_at)
VALUES
  ('YOUR_USER_ID', 'Brand Identity', 'Complete brand identity system', 'active', '#6366F1', 3, NOW() - INTERVAL '3 days'),
  ('YOUR_USER_ID', 'Social Media Pack', 'Instagram and Facebook posts', 'active', '#EC4899', 0, NOW() - INTERVAL '1 day');

-- ===================================
-- Sample Activity
-- ===================================
INSERT INTO public.activity_log (user_id, action, entity_type, entity_name, created_at)
VALUES
  ('YOUR_USER_ID', 'created', 'design', 'Modern Tech Startup Logo', NOW() - INTERVAL '2 hours'),
  ('YOUR_USER_ID', 'created', 'design', 'Creative Agency Branding', NOW() - INTERVAL '5 hours'),
  ('YOUR_USER_ID', 'exported', 'design', 'Modern Tech Startup Logo', NOW() - INTERVAL '1 hour');
*/

-- ===================================
-- Quick Test Queries
-- ===================================
-- After running seed data, test these queries:

-- 1. Check your profile
-- SELECT * FROM public.profiles WHERE id = auth.uid();

-- 2. Check available plans
-- SELECT * FROM public.plans ORDER BY credits;

-- 3. Check your designs
-- SELECT id, name, type, style, created_at FROM public.designs WHERE user_id = auth.uid();

-- 4. Check credit balance
-- SELECT credits, plan_id FROM public.profiles WHERE id = auth.uid();

-- 5. Check recent activity
-- SELECT action, entity_type, entity_name, created_at 
-- FROM public.activity_log 
-- WHERE user_id = auth.uid() 
-- ORDER BY created_at DESC 
-- LIMIT 10;
