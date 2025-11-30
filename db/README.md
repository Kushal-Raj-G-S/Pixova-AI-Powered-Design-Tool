# Pixova Database Setup Guide

## 📋 Quick Start

### Step 1: Run SQL Files in Order
Go to your **Supabase Dashboard → SQL Editor** and run these files in order:

1. **`schema.sql`** - Creates all tables, indexes, and policies
2. **`functions.sql`** - Creates database functions and triggers
3. **`add_expiry.sql`** - Adds auto-expiry for designs based on plan
4. **`seed.sql`** (optional) - Adds sample data for testing

### Step 2: Setup Storage Bucket
**Via Supabase Dashboard → Storage:**
- Create bucket: `designs`
- Make it **public**
- File size limit: **10 MB**
- Allowed types: `image/png`, `image/jpeg`, `image/webp`

**Then run these policies in SQL Editor:**
```sql
-- See create_storage_bucket.sql for full policy setup
```

### Step 3: Setup Auto-Cleanup (Optional)
Run **`setup_cleanup_cron.sql`** to enable daily cleanup of expired designs at 2 AM UTC.

### Step 4: Enable Authentication
1. Go to **Supabase Dashboard → Authentication → Providers**
2. Enable **Email** provider
3. Enable **Google OAuth** (optional but recommended)

### Step 5: Test Everything
1. Sign up for a new account in your app
2. Check **Table Editor → profiles** - you should see your profile
3. Generate a design - it should save to storage bucket
4. Verify in **Storage → designs → your_user_id/** folder

---

## 🎯 Database Tables

### **plans**
Defines subscription tiers (Free, Pro, Enterprise, Admin)
- `id`: Plan identifier (free, pro, enterprise, admin)
- `credits`: Number of credits included
- `price`: Monthly price
- `features`: JSON array of features

### **profiles**
User information and plan details
- `id`: User ID (from auth.users)
- `email`: User email
- `plan_id`: Current plan (default: 'free')
- `credits`: Remaining credits
- `total_designs`: Total designs created
- `total_exports`: Total exports

### **designs**
AI-generated designs with automatic storage and expiry
- `id`: Design ID
- `user_id`: Owner
- `name`: Design name
- `type`: logo, social, mobile, etc.
- `style`: modern, corporate, creative, etc.
- `prompt`: AI generation prompt
- `image_url`: Permanent URL in Supabase Storage
- `thumbnail_url`: Thumbnail URL
- `folder`: Organization folder name
- `favorite`: Boolean flag
- `credits_used`: Credits consumed
- `metadata`: JSON with expiry date and extra info
  - `expiryDate`: Auto-set based on plan (free=5d, pro=10d, enterprise=15d, admin=20d)
  - `variation_number`: If multiple variations generated
  - `text_mode`: Text overlay settings

**Storage Structure:**
```
designs/
  └── {user_id}/
      └── {prompt_folder}/
          ├── 1732387200000_logo_1.png
          ├── 1732387200000_logo_2.png
          └── 1732387200000_logo_3.png
```

### **projects**
Design organization folders
- `id`: Project ID
- `user_id`: Owner
- `name`: Project name
- `status`: active, archived, completed
- `design_count`: Number of designs

### **activity_log**
User activity tracking
- `action`: created, edited, exported, deleted
- `entity_type`: design, project, plan
- `entity_name`: Name of the entity

### **credit_transactions**
Credit usage history
- `amount`: Credits added/removed
- `reason`: design_generation, plan_upgrade, etc.
- `balance_after`: Credits remaining after transaction

### **achievements**
User milestones and badges
- `achievement_type`: first_design, designs_10, etc.
- `title`: Achievement name
- `icon`: Emoji icon

---

## 🔧 Common Operations

### Change User Plan (Manual)
```sql
-- In Supabase Dashboard → Table Editor → profiles
-- 1. Find the user row
-- 2. Edit 'plan_id' column: free | pro | enterprise | admin
-- 3. Edit 'credits' column:
--    - Free: 100
--    - Pro: 2000
--    - Enterprise: 10000
--    - Admin: 999999
-- 4. Save

-- Or use SQL:
SELECT public.change_user_plan('USER_ID_HERE', 'pro');
```

### Add Credits Manually
```sql
-- Add 500 credits to a user
SELECT public.add_credits('USER_ID_HERE', 500, 'bonus_reward');
```

### Check User Stats
```sql
SELECT * FROM public.get_user_stats('USER_ID_HERE');
```

### View Credit History
```sql
SELECT 
  amount,
  reason,
  balance_after,
  created_at
FROM public.credit_transactions
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 20;
```

### View Designs by Expiry Date
```sql
-- Designs expiring in next 7 days
SELECT 
  name,
  created_at,
  (metadata->>'expiryDate')::TIMESTAMPTZ as expires_at,
  EXTRACT(DAY FROM (metadata->>'expiryDate')::TIMESTAMPTZ - NOW()) as days_remaining
FROM public.designs
WHERE user_id = 'USER_ID_HERE'
  AND (metadata->>'expiryDate')::TIMESTAMPTZ > NOW()
ORDER BY expires_at ASC;
```

### Manually Cleanup Expired Designs
```sql
-- Delete expired designs from database
DELETE FROM designs
WHERE (metadata->>'expiryDate')::TIMESTAMPTZ < NOW();

-- Note: You'll need to delete from storage separately or use the cleanupExpiredDesigns() function
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- ✅ View/edit their own data
- ✅ Read public plan information
- ❌ Access other users' data

### Admin Access
To give admin access, update the user's plan:
```sql
UPDATE public.profiles
SET plan_id = 'admin', credits = 999999
WHERE email = 'admin@yourdomain.com';
```

---

## 🎨 Credit System Flow

### How Credits Work:
1. **New User Signup** → Gets 100 credits (Free plan)
2. **Generate Design** → Deducts 1 credit automatically (via trigger)
3. **Upgrade Plan** → Credits reset to plan amount
4. **Manual Adjustment** → Admin can add/remove credits

### Credit Deduction Trigger:
When a design is created, the `on_design_created` trigger:
- Checks if user has enough credits
- Deducts 1 credit
- Logs transaction
- Updates `total_designs` counter
- Fails if insufficient credits

---

## 📊 Monitoring

### Check System Health
```sql
-- Total users by plan
SELECT plan_id, COUNT(*) 
FROM public.profiles 
GROUP BY plan_id;

-- Total designs created today
SELECT COUNT(*) 
FROM public.designs 
WHERE created_at >= CURRENT_DATE;

-- Users running low on credits
SELECT email, credits 
FROM public.profiles 
WHERE credits < 10 AND plan_id = 'free';

-- Designs expiring in next 24 hours
SELECT COUNT(*)
FROM public.designs
WHERE (metadata->>'expiryDate')::TIMESTAMPTZ BETWEEN NOW() AND NOW() + INTERVAL '24 hours';

-- Storage usage by user
SELECT 
  user_id,
  COUNT(*) as design_count,
  pg_size_pretty(SUM(LENGTH(image_url))) as approx_size
FROM public.designs
GROUP BY user_id
ORDER BY design_count DESC
LIMIT 10;
```

### Cron Job Status
```sql
-- View scheduled cleanup job
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-designs';

-- View job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-designs')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🚀 Integration with Backend

### Save Design (Python/FastAPI)
```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Save design after generation
design = supabase.table('designs').insert({
    'user_id': user_id,
    'name': 'My Logo',
    'type': 'logo',
    'style': 'modern',
    'prompt': prompt,
    'image_url': image_url,
    'width': 1024,
    'height': 1024,
    'model_used': 'flux-schnell'
}).execute()

# Credits are automatically deducted by trigger!
```

### Check Credits Before Generation
```python
# Get user credits
profile = supabase.table('profiles').select('credits').eq('id', user_id).single().execute()

if profile.data['credits'] < 1:
    raise Exception('Insufficient credits')
```

---

## 🧹 Maintenance

### Clean Old Activity Logs (Run Monthly)
```sql
SELECT public.cleanup_old_activity();
```

### Backup Important Tables
```sql
-- In Supabase Dashboard → Database → Backups
-- Enable automatic daily backups
```

---

## 📝 Notes

- ✅ All timestamps are in UTC
- ✅ UUIDs are auto-generated
- ✅ RLS policies prevent unauthorized access
- ✅ Triggers handle automatic credit deduction
- ✅ Foreign keys ensure data integrity
- ✅ Indexes optimize query performance

---

## 🆘 Troubleshooting

### "Insufficient credits" Error
```sql
-- Check user credits
SELECT credits FROM public.profiles WHERE id = 'USER_ID';

-- Add credits if needed
SELECT public.add_credits('USER_ID', 100, 'admin_bonus');
```

### User Can't See Their Designs
```sql
-- Check RLS policies
SELECT * FROM public.designs WHERE user_id = 'USER_ID';

-- If empty, verify user_id matches auth.uid()
```

### Profile Not Created on Signup
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually create profile if needed
INSERT INTO public.profiles (id, email, plan_id, credits)
VALUES ('USER_ID', 'user@email.com', 'free', 100);
```

---

## 🎉 You're All Set!

Your database is now ready to:
- ✅ Handle user authentication
- ✅ Manage plans and credits
- ✅ Store AI-generated designs
- ✅ Track user activity
- ✅ Award achievements
- ✅ Scale to thousands of users

**Next Steps:**
1. Test signup/login in your app
2. Generate a design and watch credits decrease
3. Try changing plans manually in Supabase
4. Check the activity log to see all events
