-- Add style column to backgrounds table
ALTER TABLE public.backgrounds
  ADD COLUMN IF NOT EXISTS style text
    CHECK (style IN ('rick-morty', 'gravity-falls', 'simpsons', 'fairly-odd', 'negasva'));

-- Seed the existing hardcoded backgrounds from the studio into the DB
-- so the admin can manage them and the studio can load them dynamically.
-- image_url uses the public path served by Next.js from /public/backgrounds/.
INSERT INTO public.backgrounds (name, image_url, style, active) VALUES
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
ON CONFLICT DO NOTHING;
