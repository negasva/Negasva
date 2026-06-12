-- Migration 015: landing_config — contenido editable de la landing desde el admin

CREATE TABLE IF NOT EXISTS public.landing_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read landing config"
  ON public.landing_config FOR SELECT
  USING (true);

CREATE POLICY "admin manage landing config"
  ON public.landing_config FOR ALL
  USING (is_admin());

INSERT INTO public.landing_config (key, value) VALUES
('hero', '{
  "badge_es": "✦ Ilustración digital personalizada",
  "badge_en": "✦ Custom digital illustration",
  "headline_es": "Tu Retrato",
  "headline_en": "Your Portrait,",
  "headline_highlight_es": "Animado",
  "headline_highlight_en": "Animated",
  "subheadline_es": "Transforma tu foto en un personaje de caricatura icónico. Rick y Morty, Gravity Falls, Los Simpsons y más.",
  "subheadline_en": "Turn your photo into an iconic cartoon character. Rick and Morty, Gravity Falls, The Simpsons and more.",
  "cta_primary_es": "Crear mi retrato",
  "cta_primary_en": "Create my portrait",
  "cta_secondary_es": "Ver cómo funciona",
  "cta_secondary_en": "See how it works"
}'::jsonb),
('how_it_works', '[
  {"step":1,"icon":"palette","title_es":"Elige tu estilo","title_en":"Choose your style","desc_es":"Rick y Morty, Simpsons, Gravity Falls y más","desc_en":"Rick and Morty, Simpsons, Gravity Falls and more"},
  {"step":2,"icon":"upload","title_es":"Sube tu foto","title_en":"Upload your photo","desc_es":"Una foto clara de frente es todo lo que necesitas","desc_en":"A clear front-facing photo is all you need"},
  {"step":3,"icon":"sparkles","title_es":"Recibe tu retrato","title_en":"Receive your portrait","desc_es":"En 48 horas en tu correo, listo para imprimir","desc_en":"In 48 hours to your email, print-ready"}
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
