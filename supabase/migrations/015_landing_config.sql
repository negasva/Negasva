-- Migration 015: landing_config — contenido editable de la landing desde el admin

CREATE TABLE IF NOT EXISTS public.landing_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read landing config" ON public.landing_config;
CREATE POLICY "public read landing config"
  ON public.landing_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin manage landing config" ON public.landing_config;
CREATE POLICY "admin manage landing config"
  ON public.landing_config FOR ALL
  USING (is_admin());

INSERT INTO public.landing_config (key, value) VALUES
('hero', '{
  "badge_es": "✦ Ilustración digital personalizada",
  "badge_en": "✦ Custom digital illustration",
  "headline_es": "Tu Retrato Animado",
  "headline_en": "Your Personalized",
  "headline_highlight_es": "Personalizado",
  "headline_highlight_en": "Animated Portrait",
  "subheadline_es": "Transforma tu foto en un personaje de caricatura icónico. Rick y Morty, Gravity Falls, Los Simpsons y más.",
  "subheadline_en": "Turn your photo into an iconic cartoon character. Rick and Morty, Gravity Falls, The Simpsons and more.",
  "cta_primary_es": "Pedir mi retrato",
  "cta_primary_en": "Order my portrait",
  "cta_secondary_es": "Ver cómo funciona",
  "cta_secondary_en": "See how it works"
}'::jsonb),
('how_it_works', '[
  {"step":1,"icon":"palette","title_es":"Elige tu estilo","title_en":"Choose your style","desc_es":"Rick & Morty, Simpsons, Gravity Falls, Padrinos Mágicos y más","desc_en":"Rick & Morty, Simpsons, Gravity Falls, Fairly OddParents and more"},
  {"step":2,"icon":"users","title_es":"Elige tus personajes","title_en":"Choose your characters","desc_es":"Selecciona cuántas personas y si quieres retrato de torso o cuerpo completo","desc_en":"Select how many people and whether you want a torso or full-body portrait"},
  {"step":3,"icon":"image","title_es":"Elige el fondo","title_en":"Choose the background","desc_es":"Fondos temáticos del estilo elegido, fondo personalizado o sin fondo","desc_en":"Themed backgrounds from your chosen style, a custom background, or none"},
  {"step":4,"icon":"camera","title_es":"Sube tus fotos e indicaciones","title_en":"Upload your photos & instructions","desc_es":"Cuéntanos poses, orden y detalles. Sube una foto clara de cada persona","desc_en":"Tell us poses, order and details. Upload a clear photo of each person"},
  {"step":5,"icon":"sparkles","title_es":"Recibe tu retrato","title_en":"Receive your portrait","desc_es":"En 48 horas recibes tu ilustración digital lista para imprimir y compartir","desc_en":"In 48 hours you get your digital illustration, ready to print and share"}
]'::jsonb),
('gallery_images', '[
  {"url":"/backgrounds/rm-1.jpg","caption":"Rick & Morty"},
  {"url":"/backgrounds/rm-3.jpg","caption":"Rick & Morty — Garage"},
  {"url":"/backgrounds/rm-4.jpg","caption":"Rick & Morty — Espacio"},
  {"url":"/backgrounds/rm-5.jpg","caption":"Rick & Morty — Planeta C-137"},
  {"url":"/backgrounds/rm-6.jpg","caption":"Rick & Morty — Nave"}
]'::jsonb),
('stats', '[
  {"value":"1000+","label_es":"clientes felices","label_en":"happy clients"},
  {"value":"48h","label_es":"entrega","label_en":"delivery"},
  {"value":"100%","label_es":"satisfacción","label_en":"satisfaction"},
  {"value":"4+","label_es":"estilos","label_en":"styles"}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Si la fila ya existía con los 3 pasos antiguos, actualízala a los 5 pasos.
UPDATE public.landing_config SET value = '[
  {"step":1,"icon":"palette","title_es":"Elige tu estilo","title_en":"Choose your style","desc_es":"Rick & Morty, Simpsons, Gravity Falls, Padrinos Mágicos y más","desc_en":"Rick & Morty, Simpsons, Gravity Falls, Fairly OddParents and more"},
  {"step":2,"icon":"users","title_es":"Elige tus personajes","title_en":"Choose your characters","desc_es":"Selecciona cuántas personas y si quieres retrato de torso o cuerpo completo","desc_en":"Select how many people and whether you want a torso or full-body portrait"},
  {"step":3,"icon":"image","title_es":"Elige el fondo","title_en":"Choose the background","desc_es":"Fondos temáticos del estilo elegido, fondo personalizado o sin fondo","desc_en":"Themed backgrounds from your chosen style, a custom background, or none"},
  {"step":4,"icon":"camera","title_es":"Sube tus fotos e indicaciones","title_en":"Upload your photos & instructions","desc_es":"Cuéntanos poses, orden y detalles. Sube una foto clara de cada persona","desc_en":"Tell us poses, order and details. Upload a clear photo of each person"},
  {"step":5,"icon":"sparkles","title_es":"Recibe tu retrato","title_en":"Receive your portrait","desc_es":"En 48 horas recibes tu ilustración digital lista para imprimir y compartir","desc_en":"In 48 hours you get your digital illustration, ready to print and share"}
]'::jsonb, updated_at = now()
WHERE key = 'how_it_works' AND jsonb_array_length(value) = 3;

-- Si la fila hero ya existía con el titular antiguo, actualiza al nuevo.
UPDATE public.landing_config SET value = value || '{
  "headline_es": "Tu Retrato Animado",
  "headline_en": "Your Personalized",
  "headline_highlight_es": "Personalizado",
  "headline_highlight_en": "Animated Portrait",
  "cta_primary_es": "Pedir mi retrato",
  "cta_primary_en": "Order my portrait"
}'::jsonb, updated_at = now()
WHERE key = 'hero' AND value->>'headline_highlight_es' = 'Animado';
