-- Supabase Storage RLS Policies Setup
-- Run these commands in your Supabase SQL Editor to allow anonymous uploads

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage.buckets (if not already enabled) 
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to upload to player-documents bucket
CREATE POLICY "Allow anonymous uploads to player-documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'player-documents');

-- Allow anonymous users to read from player-documents bucket
CREATE POLICY "Allow anonymous reads from player-documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'player-documents');

-- Allow anonymous users to upload to player-photos bucket
CREATE POLICY "Allow anonymous uploads to player-photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'player-photos');

-- Allow anonymous users to read from player-photos bucket
CREATE POLICY "Allow anonymous reads from player-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'player-photos');

-- Optional: Allow updates/deletes (for file replacement functionality)
CREATE POLICY "Allow anonymous updates to player-documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'player-documents')
WITH CHECK (bucket_id = 'player-documents');

CREATE POLICY "Allow anonymous deletes from player-documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'player-documents');

CREATE POLICY "Allow anonymous updates to player-photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'player-photos')
WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Allow anonymous deletes from player-photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'player-photos');

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;