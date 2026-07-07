-- ─────────────────────────────────────────────────────────────────────────
-- 023: make the landing styles fully manageable from the admin.
--   • show_in_home  → the style appears in the home grid
--   • landing_slug  → the SEO url for /styles/[slug] (differs from the wizard slug)
--   • is_active     → REUSED as "available in /order" (the wizard reads it)
-- New styles are inserted with is_active = false: they keep their SEO landing
-- but stay out of the /order wizard until the admin turns them on.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.portrait_styles
  ADD COLUMN IF NOT EXISTS show_in_home boolean NOT NULL DEFAULT true;

ALTER TABLE public.portrait_styles
  ADD COLUMN IF NOT EXISTS landing_slug text;

-- Seed / sync the full catalogue (matches lib/content/styles.ts). On conflict we
-- refresh the presentational + landing fields but leave is_active untouched, so
-- the admin's own /order on/off choices survive re-runs.
INSERT INTO public.portrait_styles (slug, landing_slug, name, description, example_image_url, is_active, show_in_home) VALUES
  ('rick-morty',       'rick-and-morty-style-portrait',  'Rick and Morty Style',  'A custom portrait style bursting with chaotic energy, visual humor and sci-fi adventure.', '/backgrounds/rm-1.webp',  true,  true),
  ('simpsons',         'simpsons-style-portrait',        'Simpsons Style',        'The most recognizable cartoon look in the world: yellow skin, bold outlines and flat colors.', '/backgrounds/rm-3.webp',  true,  true),
  ('gravity-falls',    'gravity-falls-style-portrait',   'Gravity Falls Style',   'A sweet, expressive, adventure-flavored style: big eyes, soft proportions and warm palettes.', '/backgrounds/rm-4.webp',  true,  true),
  ('fairly-odd',       'fairly-oddparents-style-portrait','Fairly OddParents Style','A colorful, geometric, high-energy style with vivid flat colors and magical touches.', '/backgrounds/rm-5.webp',  true,  true),
  ('family-guy',       'family-guy-style-portrait',      'Family Guy Style',      'The look of the classic adult animated sitcom: round faces, big chins and bold outlines.', '/backgrounds/rm-6.webp',  false, true),
  ('south-park',       'south-park-style-portrait',      'South Park Style',      'The iconic paper-cutout look: big round heads, tiny hands and snowy mountain-town backdrops.', '/backgrounds/rm-10.webp', false, true),
  ('anime',            'anime-style-portrait',           'Anime Style',           'A hand-drawn anime portrait: large expressive eyes, dynamic hair, clean linework and cel shading.', '/backgrounds/rm-3.webp',  false, true),
  ('disney-pixar',     'disney-pixar-style-portrait',    'Disney-Pixar Style',    'The warm, polished look of modern animated movies: big eyes, soft shading and storybook lighting.', '/backgrounds/rm-4.webp',  false, true),
  ('futurama',         'futurama-style-portrait',        'Futurama Style',        'A custom portrait style straight out of the year 3000: clean outlines and retro-future palettes.', '/backgrounds/rm-4.webp',  false, true),
  ('bobs-burgers',     'bobs-burgers-style-portrait',    'Bob''s Burgers Style',  'A custom portrait style with small-business heart: simple lines, warm flat colors and oval eyes.', '/backgrounds/rm-6.webp',  false, true),
  ('american-dad',     'american-dad-style-portrait',    'American Dad Style',    'A custom portrait style with sharp suburban satire: strong jaws, clean geometry and bright lighting.', '/backgrounds/rm-5.webp',  false, true),
  ('king-of-the-hill', 'king-of-the-hill-style-portrait','King of the Hill Style','A custom portrait style with down-to-earth realism: naturalistic proportions and earthy palettes.', '/backgrounds/rm-3.webp',  false, true),
  ('studio-ghibli',    'studio-ghibli-style-portrait',   'Studio Ghibli Style',   'A custom portrait style of quiet wonder: soft painterly light, gentle faces and living backgrounds.', '/backgrounds/rm-10.webp', false, true)
ON CONFLICT (slug) DO UPDATE SET
  landing_slug      = EXCLUDED.landing_slug,
  name              = EXCLUDED.name,
  description       = EXCLUDED.description,
  example_image_url = EXCLUDED.example_image_url,
  show_in_home      = EXCLUDED.show_in_home;

-- The wizard-only NEGASVA style has no SEO landing: keep it out of the home grid.
UPDATE public.portrait_styles SET show_in_home = false WHERE slug = 'negasva';

-- Public can now read a style if it is orderable OR shown on the home grid
-- (a home style may be disabled in /order but still needs to render its landing).
DROP POLICY IF EXISTS "public read styles" ON public.portrait_styles;
CREATE POLICY "public read styles" ON public.portrait_styles
  FOR SELECT USING (is_active = true OR show_in_home = true);
