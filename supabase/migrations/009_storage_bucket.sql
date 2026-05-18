-- Migration 009: Storage bucket "backgrounds" for admin image uploads.
--
-- Fixes "Error al subir imagen" (HTTP 400 from storage.objects) by:
--  1. Creating the public bucket if it does not exist.
--  2. Allowing public read access (so getPublicUrl works on the website).
--  3. Allowing authenticated admins to insert / update / delete objects.
--
-- Run this once in the Supabase SQL editor.

-- 1. Create / ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Helper: same is_admin() defined in earlier migrations relies on JWT claim.
--    Storage policies can call it directly.

-- 3. Drop existing policies to keep this migration idempotent
DROP POLICY IF EXISTS "Public read backgrounds bucket"          ON storage.objects;
DROP POLICY IF EXISTS "Admin insert backgrounds bucket"          ON storage.objects;
DROP POLICY IF EXISTS "Admin update backgrounds bucket"          ON storage.objects;
DROP POLICY IF EXISTS "Admin delete backgrounds bucket"          ON storage.objects;

-- 4. Anyone (anon + authenticated) can READ files in the bucket
CREATE POLICY "Public read backgrounds bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'backgrounds');

-- 5. Admins can write / update / delete files in the bucket
CREATE POLICY "Admin insert backgrounds bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin update backgrounds bucket"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin delete backgrounds bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
