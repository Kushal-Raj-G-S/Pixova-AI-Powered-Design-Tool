-- =====================================================
-- SUPABASE STORAGE POLICIES FOR DESIGNS BUCKET
-- =====================================================
-- Run this in Supabase SQL Editor to enable storage access
-- =====================================================

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to upload their own files
-- Pattern: user_email_com/prompt_folder/filename.png
CREATE POLICY "Allow authenticated users to upload designs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'designs'
  AND auth.role() = 'authenticated'
);

-- 3. Allow users to read their own files
CREATE POLICY "Allow users to read their own designs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'designs'
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to update their own files
CREATE POLICY "Allow users to update their own designs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'designs'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'designs'
  AND auth.role() = 'authenticated'
);

-- 5. Allow users to delete their own files
CREATE POLICY "Allow users to delete their own designs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'designs'
  AND auth.role() = 'authenticated'
);

-- 6. Allow public read access (optional - for sharing designs)
CREATE POLICY "Allow public to read designs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'designs');

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Run this to see all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
