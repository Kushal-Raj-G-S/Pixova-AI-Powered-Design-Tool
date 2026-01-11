
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
