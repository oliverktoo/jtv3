-- Alternative RLS Policy Creation (run in Supabase SQL Editor)
-- This uses a simpler approach that might work with your permissions

-- First, let's just try to create the most basic upload policy
-- without the ALTER TABLE commands that caused the permission error

-- Create basic upload policy for player-documents
CREATE POLICY IF NOT EXISTS "Allow all uploads to player-documents" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'player-documents');

-- Create basic read policy for player-documents  
CREATE POLICY IF NOT EXISTS "Allow all reads from player-documents" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'player-documents');

-- Create basic upload policy for player-photos
CREATE POLICY IF NOT EXISTS "Allow all uploads to player-photos" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'player-photos');

-- Create basic read policy for player-photos
CREATE POLICY IF NOT EXISTS "Allow all reads from player-photos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'player-photos');

-- Test query to see current policies
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%player-%';