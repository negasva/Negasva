-- Migration 010: sort_order for portrait_styles + body_types admin table
--
-- 1. Adds sort_order to portrait_styles so admin can reorder styles
-- 2. Creates body_types table for admin-configurable body type options

-- ── portrait_styles sort_order ────────────────────────────────────────
ALTER TABLE public.portrait_styles
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Backfill sort_order by current name order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn
  FROM public.portrait_styles
)
UPDATE public.portrait_styles ps
SET sort_order = o.rn
FROM ordered o
WHERE ps.id = o.id;

-- ── body_types table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.body_types (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT        NOT NULL UNIQUE,
  name                TEXT        NOT NULL,
  description         TEXT,
  price_usd           DECIMAL(10,2) NOT NULL,
  original_price_usd  DECIMAL(10,2),
  is_best_value       BOOLEAN     DEFAULT false,
  sort_order          INT         DEFAULT 0,
  is_active           BOOLEAN     DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default body types matching the current studio hardcoded options
INSERT INTO public.body_types (slug, name, description, price_usd, original_price_usd, is_best_value, sort_order)
VALUES
  ('torso_only', 'Torso Only',  'Bust up to the waist',   25.00,  NULL,  false, 1),
  ('full_body',  'Full Body',   'Full body character',     29.99,  39.99, true,  2)
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE public.body_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active body_types" ON public.body_types;
CREATE POLICY "public read active body_types"
  ON public.body_types FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin manage body_types" ON public.body_types;
CREATE POLICY "admin manage body_types"
  ON public.body_types FOR ALL
  USING (is_admin());
