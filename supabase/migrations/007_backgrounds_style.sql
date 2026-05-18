-- ─────────────────────────────────────────────────────────────────────────
-- Reconcile backgrounds schema and add style column
-- ─────────────────────────────────────────────────────────────────────────
-- The original 001 migration created `backgrounds` with columns
-- (slug, name, description, thumbnail_url, is_active). Migration 006 used
-- CREATE TABLE IF NOT EXISTS with a different schema (name, image_url,
-- active), which was a no-op because the table already existed.
-- This migration normalizes the schema so admin and studio both work, then
-- adds the new `style` column and seeds the existing backgrounds.

-- 1) Add missing columns expected by the admin / studio code
ALTER TABLE public.backgrounds
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS active    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS style     text;

-- 2) Backfill from the legacy columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'backgrounds' AND column_name = 'thumbnail_url'
  ) THEN
    UPDATE public.backgrounds SET image_url = thumbnail_url WHERE image_url IS NULL AND thumbnail_url IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'backgrounds' AND column_name = 'is_active'
  ) THEN
    UPDATE public.backgrounds SET active = is_active WHERE is_active IS NOT NULL;
  END IF;
END $$;

-- 3) Add style check constraint (only if not already there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'backgrounds' AND constraint_name = 'backgrounds_style_check'
  ) THEN
    ALTER TABLE public.backgrounds
      ADD CONSTRAINT backgrounds_style_check
      CHECK (style IS NULL OR style IN ('rick-morty', 'gravity-falls', 'simpsons', 'fairly-odd', 'negasva'));
  END IF;
END $$;

-- 4) Seed the existing hardcoded backgrounds from the studio into the DB.
-- We use slug (if the column exists) for ON CONFLICT, otherwise we check name uniqueness manually.
DO $$
DECLARE
  has_slug boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'backgrounds' AND column_name = 'slug'
  ) INTO has_slug;

  IF has_slug THEN
    -- Insert with slug to make this idempotent across re-runs
    INSERT INTO public.backgrounds (slug, name, image_url, style, active) VALUES
      ('rm-1',  'Rick & Morty — Portal',         '/backgrounds/rm-1.jpg',  'rick-morty',    true),
      ('rm-3',  'Rick & Morty — Garage',         '/backgrounds/rm-3.jpg',  'rick-morty',    true),
      ('rm-4',  'Rick & Morty — Espacio',        '/backgrounds/rm-4.jpg',  'rick-morty',    true),
      ('rm-5',  'Rick & Morty — Planeta C-137',  '/backgrounds/rm-5.jpg',  'rick-morty',    true),
      ('rm-6',  'Rick & Morty — Nave espacial',  '/backgrounds/rm-6.jpg',  'rick-morty',    true),
      ('rm-10', 'Rick & Morty — Dimensión',      '/backgrounds/rm-10.jpg', 'rick-morty',    true),
      ('gf-1',  'Gravity Falls — Bosque',        '/backgrounds/gf-1.jpg',  'gravity-falls', true),
      ('gf-2',  'Gravity Falls — Cabaña',        '/backgrounds/gf-2.jpg',  'gravity-falls', true),
      ('gf-3',  'Gravity Falls — Pueblo',        '/backgrounds/gf-3.jpg',  'gravity-falls', true),
      ('gf-4',  'Gravity Falls — Lago',          '/backgrounds/gf-4.jpg',  'gravity-falls', true),
      ('gf-5',  'Gravity Falls — Cueva',         '/backgrounds/gf-5.jpg',  'gravity-falls', true),
      ('gf-8',  'Gravity Falls — Noche',         '/backgrounds/gf-8.jpg',  'gravity-falls', true),
      ('gf-9',  'Gravity Falls — Misterio',      '/backgrounds/gf-9.jpg',  'gravity-falls', true),
      ('sp-1',  'Simpsons — Springfield',        '/backgrounds/sp-1.jpg',  'simpsons',      true),
      ('sp-2',  'Simpsons — Casa',               '/backgrounds/sp-2.jpg',  'simpsons',      true),
      ('sp-3',  'Simpsons — Bar de Moe',         '/backgrounds/sp-3.jpg',  'simpsons',      true),
      ('sp-4',  'Simpsons — Nuclear',            '/backgrounds/sp-4.jpg',  'simpsons',      true),
      ('sp-5',  'Simpsons — Escuela',            '/backgrounds/sp-5.jpg',  'simpsons',      true),
      ('sp-6',  'Simpsons — Calle',              '/backgrounds/sp-6.jpg',  'simpsons',      true),
      ('sp-10', 'Simpsons — Noche Springfield',  '/backgrounds/sp-10.jpg', 'simpsons',      true),
      ('fo-1',  'Padrinos — Dimmsdale',          '/backgrounds/fo-1.jpg',  'fairly-odd',    true),
      ('fo-2',  'Padrinos — Casa Turner',        '/backgrounds/fo-2.jpg',  'fairly-odd',    true),
      ('fo-3',  'Padrinos — Hada World',         '/backgrounds/fo-3.jpg',  'fairly-odd',    true),
      ('fo-5',  'Padrinos — Escuela',            '/backgrounds/fo-5.jpg',  'fairly-odd',    true),
      ('fo-10', 'Padrinos — Cosmos',             '/backgrounds/fo-10.jpg', 'fairly-odd',    true)
    ON CONFLICT (slug) DO UPDATE
      SET image_url = EXCLUDED.image_url,
          style     = EXCLUDED.style,
          active    = EXCLUDED.active;
  ELSE
    -- No slug column: only insert if there are no existing rows for that name
    INSERT INTO public.backgrounds (name, image_url, style, active)
    SELECT v.name, v.image_url, v.style, v.active
    FROM (VALUES
      ('Rick & Morty — Portal',         '/backgrounds/rm-1.jpg',  'rick-morty',    true),
      ('Rick & Morty — Garage',         '/backgrounds/rm-3.jpg',  'rick-morty',    true),
      ('Rick & Morty — Espacio',        '/backgrounds/rm-4.jpg',  'rick-morty',    true),
      ('Rick & Morty — Planeta C-137',  '/backgrounds/rm-5.jpg',  'rick-morty',    true),
      ('Rick & Morty — Nave espacial',  '/backgrounds/rm-6.jpg',  'rick-morty',    true),
      ('Rick & Morty — Dimensión',      '/backgrounds/rm-10.jpg', 'rick-morty',    true),
      ('Gravity Falls — Bosque',        '/backgrounds/gf-1.jpg',  'gravity-falls', true),
      ('Gravity Falls — Cabaña',        '/backgrounds/gf-2.jpg',  'gravity-falls', true),
      ('Gravity Falls — Pueblo',        '/backgrounds/gf-3.jpg',  'gravity-falls', true),
      ('Gravity Falls — Lago',          '/backgrounds/gf-4.jpg',  'gravity-falls', true),
      ('Gravity Falls — Cueva',         '/backgrounds/gf-5.jpg',  'gravity-falls', true),
      ('Gravity Falls — Noche',         '/backgrounds/gf-8.jpg',  'gravity-falls', true),
      ('Gravity Falls — Misterio',      '/backgrounds/gf-9.jpg',  'gravity-falls', true),
      ('Simpsons — Springfield',        '/backgrounds/sp-1.jpg',  'simpsons',      true),
      ('Simpsons — Casa',               '/backgrounds/sp-2.jpg',  'simpsons',      true),
      ('Simpsons — Bar de Moe',         '/backgrounds/sp-3.jpg',  'simpsons',      true),
      ('Simpsons — Nuclear',            '/backgrounds/sp-4.jpg',  'simpsons',      true),
      ('Simpsons — Escuela',            '/backgrounds/sp-5.jpg',  'simpsons',      true),
      ('Simpsons — Calle',              '/backgrounds/sp-6.jpg',  'simpsons',      true),
      ('Simpsons — Noche Springfield',  '/backgrounds/sp-10.jpg', 'simpsons',      true),
      ('Padrinos — Dimmsdale',          '/backgrounds/fo-1.jpg',  'fairly-odd',    true),
      ('Padrinos — Casa Turner',        '/backgrounds/fo-2.jpg',  'fairly-odd',    true),
      ('Padrinos — Hada World',         '/backgrounds/fo-3.jpg',  'fairly-odd',    true),
      ('Padrinos — Escuela',            '/backgrounds/fo-5.jpg',  'fairly-odd',    true),
      ('Padrinos — Cosmos',             '/backgrounds/fo-10.jpg', 'fairly-odd',    true)
    ) AS v(name, image_url, style, active)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.backgrounds b WHERE b.name = v.name
    );
  END IF;
END $$;

-- 5) Fix the broken RLS policy from 006 if it exists (it referenced `is_active`
-- but the admin code uses `active`). Recreate as a public read policy on active rows.
DROP POLICY IF EXISTS "public read active backgrounds" ON public.backgrounds;
CREATE POLICY "public read active backgrounds"
  ON public.backgrounds FOR SELECT
  USING (active = true);
