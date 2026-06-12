-- Migration 013: allow public read of prices
--
-- /api/prices uses the anon client, but the prices table only had an
-- admin-read policy, so the public endpoint always returned []. The
-- frontend (studio, /precios) and the checkout API need these values.

DROP POLICY IF EXISTS "public read prices" ON public.prices;
CREATE POLICY "public read prices"
  ON public.prices FOR SELECT
  USING (true);
