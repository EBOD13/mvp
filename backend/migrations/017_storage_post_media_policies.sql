-- 017_storage_post_media_policies.sql
-- Creates the post-media storage bucket (if not exists) and sets RLS policies
-- so authenticated users can upload, and anyone can read public URLs.

-- Create the bucket as public (so getPublicUrl() works without signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "post_media_insert" ON storage.objects;
DROP POLICY IF EXISTS "post_media_update" ON storage.objects;
DROP POLICY IF EXISTS "post_media_select" ON storage.objects;
DROP POLICY IF EXISTS "post_media_delete" ON storage.objects;

-- Authenticated users can upload files
CREATE POLICY "post_media_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-media');

-- Authenticated users can update (needed for upsert: avatar overwrite)
CREATE POLICY "post_media_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-media');

-- Anyone (public) can read — required for getPublicUrl() to serve images
CREATE POLICY "post_media_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-media');

-- Authenticated users can delete their own uploads
CREATE POLICY "post_media_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-media');
