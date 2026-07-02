-- ─────────────────────────────────────────────────────────────────────────
-- Replace real franchise names with NEGASVA's own "anti copyright" versions
-- ─────────────────────────────────────────────────────────────────────────
-- The /order studio (and admin) display these names straight from the DB,
-- so the trademarked series names must not live here. Slugs stay stable.

UPDATE public.portrait_styles SET name = 'Cartoon sci-fi'            WHERE slug = 'rick-morty';
UPDATE public.portrait_styles SET name = 'Misterio del bosque'       WHERE slug = 'gravity-falls';
UPDATE public.portrait_styles SET name = 'Familia amarilla clásica'  WHERE slug = 'simpsons';
UPDATE public.portrait_styles SET name = 'Fantasía brillante'        WHERE slug = 'fairly-odd';

-- Background names were seeded as "<Series> — <Scene>"; keep only the scene.
UPDATE public.backgrounds
SET name = regexp_replace(name, '^[^—]*—\s*', '')
WHERE name ~ '—';
