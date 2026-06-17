-- Migration 018: translation_cache — caché de traducciones automáticas.
-- El contenido se escribe en español y EN/FR se traducen en runtime una sola
-- vez por texto e idioma; aquí se guarda el resultado para no re-traducir.

CREATE TABLE IF NOT EXISTS public.translation_cache (
  source_hash     text NOT NULL,        -- md5(source_text)
  target_lang     text NOT NULL,        -- 'en' | 'fr'
  source_text     text NOT NULL,
  translated_text text NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_hash, target_lang)
);

ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

-- Lectura pública (los textos no son sensibles). La escritura se hace con el
-- service client desde el endpoint /api/translate (bypassa RLS).
DROP POLICY IF EXISTS "public read translation cache" ON public.translation_cache;
CREATE POLICY "public read translation cache"
  ON public.translation_cache FOR SELECT
  USING (true);
