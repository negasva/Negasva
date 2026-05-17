-- Admin tables migration
-- Run this in your Supabase SQL editor or via CLI

-- Prices table: stores dynamic pricing keys used throughout the site
CREATE TABLE IF NOT EXISTS public.prices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  amount      numeric(10, 2) NOT NULL,
  currency    text NOT NULL DEFAULT 'USD',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text UNIQUE NOT NULL,
  type         text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value        numeric(10, 2) NOT NULL,
  expires_at   timestamptz,
  max_uses     integer,
  current_uses integer NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  final_price numeric(10, 2) NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Backgrounds table
CREATE TABLE IF NOT EXISTS public.backgrounds (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  image_url  text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: only authenticated users with admin role can read/write admin tables
ALTER TABLE public.prices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backgrounds     ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role from JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Prices policies
CREATE POLICY "admin read prices"   ON public.prices FOR SELECT USING (is_admin());
CREATE POLICY "admin write prices"  ON public.prices FOR ALL    USING (is_admin());

-- Discount codes policies
CREATE POLICY "admin read discounts"  ON public.discount_codes FOR SELECT USING (is_admin());
CREATE POLICY "admin write discounts" ON public.discount_codes FOR ALL    USING (is_admin());

-- Packages policies
CREATE POLICY "admin read packages"  ON public.packages FOR SELECT USING (is_admin());
CREATE POLICY "admin write packages" ON public.packages FOR ALL    USING (is_admin());

-- Backgrounds policies
CREATE POLICY "admin read backgrounds"  ON public.backgrounds FOR SELECT USING (is_admin());
CREATE POLICY "admin write backgrounds" ON public.backgrounds FOR ALL    USING (is_admin());

-- Public can read active backgrounds (needed by the frontend gallery)
CREATE POLICY "public read active backgrounds"
  ON public.backgrounds FOR SELECT
  USING (active = true);

-- Storage bucket for background images (run separately in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', false);
