-- ─────────────────────────────────────────────────────────────────────────
-- 019: customer order photos + discount code attribution on real orders
--
-- Phase 1 "cierre de fugas":
--  1. Private Storage bucket "order-photos" for the photos a customer uploads
--     during checkout. Private because they contain people's faces — read
--     access is granted only via short-lived signed URLs generated server-side
--     with the service role for the admin/illustrator view.
--  2. Columns on `orders` so the paid order carries its photos, the discount
--     code used (so the webhook can credit usage AFTER payment), and the
--     upload folder id.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Columns on orders ------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS photo_paths   jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS upload_id     text;

-- 2) Private bucket for customer uploads ------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-photos',
  'order-photos',
  false,                                                 -- PRIVATE
  10485760,                                              -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3) Storage policies -------------------------------------------------------
-- The service role (server uploads + signed URLs) bypasses RLS, so no anon or
-- authenticated policy is needed for normal operation. We add an admin-read
-- policy purely so an admin browsing the Supabase dashboard can preview files.
DROP POLICY IF EXISTS "Admin read order-photos bucket" ON storage.objects;
CREATE POLICY "Admin read order-photos bucket"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
