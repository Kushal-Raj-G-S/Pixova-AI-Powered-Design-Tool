"""
Quick fix for Supabase Storage RLS issue
This script uses Supabase Management API to set bucket policies
"""

# Since we can't modify storage.objects table directly via pooler,
# you need to run this in Supabase Dashboard SQL Editor:

INSTRUCTIONS = """
========================================================
QUICK FIX: Run this in Supabase Dashboard
========================================================

1. Go to: https://supabase.com/dashboard
2. Select your project: ckvypawtqdcoxbcyqwqp
3. Go to: SQL Editor (left sidebar)
4. Click: New Query
5. Paste and run this SQL:

--------------------------------------------------------
"""

SQL_TO_RUN = """
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload designs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read designs" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow authenticated users to upload designs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'designs');

CREATE POLICY "Allow users to read designs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'designs');

CREATE POLICY "Allow users to update designs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'designs')
WITH CHECK (bucket_id = 'designs');

CREATE POLICY "Allow users to delete designs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'designs');

CREATE POLICY "Allow public to read designs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'designs');
"""

ALTERNATIVE = """
--------------------------------------------------------

OR ALTERNATIVE (Quick Test - Disable RLS temporarily):
--------------------------------------------------------
Go to: Storage → Policies → designs bucket
Click: Disable RLS

⚠️ WARNING: This makes storage public! 
   Only for testing. Re-enable and add policies for production.

========================================================
"""

if __name__ == "__main__":
    print(INSTRUCTIONS)
    print(SQL_TO_RUN)
    print(ALTERNATIVE)
    
    # Save to file
    with open('QUICK_FIX_STORAGE.sql', 'w') as f:
        f.write(SQL_TO_RUN)
    
    print("\n✅ SQL saved to: QUICK_FIX_STORAGE.sql")
    print("📋 Copy and paste the SQL above into Supabase SQL Editor")
