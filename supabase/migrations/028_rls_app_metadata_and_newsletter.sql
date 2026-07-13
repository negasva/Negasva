-- ─────────────────────────────────────────────────────────────────────────
-- 028: endurecer RLS
--
-- A1 — is_admin() y las políticas de storage no deben confiar en user_metadata.
--   user_metadata es editable por el propio usuario vía el cliente Supabase;
--   app_metadata solo se puede modificar con la service role key. Reemplazamos
--   todas las referencias a user_metadata por app_metadata.
--
-- M2 — quitar el INSERT anónimo directo en newsletter_subscribers. El alta
--   pasa únicamente por /api/newsletter (route handler con rate limit + service
--   role), así el INSERT público ya no saltea el rate limit.
--
-- Idempotente. Ejecutar una vez en el editor SQL de Supabase.
-- ─────────────────────────────────────────────────────────────────────────

-- A1) is_admin() desde app_metadata --------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- A1) Políticas de storage (bucket "backgrounds", migración 009) -----------
DROP POLICY IF EXISTS "Admin insert backgrounds bucket" ON storage.objects;
CREATE POLICY "Admin insert backgrounds bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Admin update backgrounds bucket" ON storage.objects;
CREATE POLICY "Admin update backgrounds bucket"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Admin delete backgrounds bucket" ON storage.objects;
CREATE POLICY "Admin delete backgrounds bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'backgrounds'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- A1) Política de storage (bucket "order-photos", migración 019) ------------
DROP POLICY IF EXISTS "Admin read order-photos bucket" ON storage.objects;
CREATE POLICY "Admin read order-photos bucket"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- M2) Quitar INSERT anónimo en newsletter_subscribers ----------------------
-- El alta va solo por /api/newsletter (service role). RLS sigue habilitada,
-- así que sin política de INSERT, anon/authenticated no pueden insertar.
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
