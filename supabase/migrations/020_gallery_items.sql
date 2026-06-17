-- Migration 020: gallery_items — portafolio real gestionado desde el admin.
--
-- Reemplaza los 12 círculos vacíos (Array.from) de /galeria por obras reales.
-- Las imágenes se suben al bucket público "backgrounds" bajo el prefijo
-- gallery/, igual que estilos y fondos. Idempotente.

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  style      text,
  image_url  text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active gallery" ON public.gallery_items;
CREATE POLICY "public read active gallery"
  ON public.gallery_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin manage gallery" ON public.gallery_items;
CREATE POLICY "admin manage gallery"
  ON public.gallery_items FOR ALL
  USING (is_admin());

-- Sin seed: se empieza vacío y la galería oculta la rejilla hasta que haya
-- obras reales. Mejor 0 que 12 placeholders falsos.
