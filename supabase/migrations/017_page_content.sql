-- Migration 017: page_content — contenido editable de TODAS las páginas (es/en/fr)
-- desde el panel de admin. Cada fila = una página. `content` guarda overrides por
-- idioma: { "es": { campo: valor, ... }, "en": {...}, "fr": {...} }.
-- Las páginas públicas fusionan estos overrides sobre sus textos por defecto.

CREATE TABLE IF NOT EXISTS public.page_content (
  page       text PRIMARY KEY,
  content    jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read page content"
  ON public.page_content FOR SELECT
  USING (true);

CREATE POLICY "admin manage page content"
  ON public.page_content FOR ALL
  USING (is_admin());
