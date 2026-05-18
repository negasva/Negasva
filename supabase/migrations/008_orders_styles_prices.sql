-- ─────────────────────────────────────────────────────────────────────────
-- 008: admin_orders table, normalize portrait_styles slugs, seed prices
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Table for manual order tracking by admin (no user_id required)
CREATE TABLE IF NOT EXISTS public.admin_orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name      text NOT NULL,
  client_email     text,
  client_instagram text,
  style            text,
  body_type        text CHECK (body_type IN ('torso_only', 'full_body')),
  background_name  text,
  people_count     integer NOT NULL DEFAULT 1,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'in_progress', 'delivered', 'cancelled')),
  price            numeric(10,2),
  currency         text NOT NULL DEFAULT 'USD',
  notes            text,
  reference        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  delivered_at     timestamptz
);

ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all admin_orders" ON public.admin_orders FOR ALL USING (is_admin());

-- 2) Normalize portrait_styles slugs to match studio IDs
UPDATE public.portrait_styles SET slug = 'rick-morty'  WHERE slug = 'rick-and-morty';
UPDATE public.portrait_styles SET slug = 'fairly-odd'  WHERE slug = 'fairly-odd-parents';
UPDATE public.portrait_styles SET name = 'Rick & Morty'           WHERE slug = 'rick-morty';
UPDATE public.portrait_styles SET name = 'Gravity Falls'          WHERE slug = 'gravity-falls';
UPDATE public.portrait_styles SET name = 'Los Simpsons'           WHERE slug = 'simpsons';
UPDATE public.portrait_styles SET name = 'Los Padrinos Mágicos'   WHERE slug = 'fairly-odd';

-- Update example images to use actual paths
UPDATE public.portrait_styles SET example_image_url = '/backgrounds/rm-1.jpg'  WHERE slug = 'rick-morty';
UPDATE public.portrait_styles SET example_image_url = '/backgrounds/gf-1.jpg'  WHERE slug = 'gravity-falls';
UPDATE public.portrait_styles SET example_image_url = '/backgrounds/sp-1.jpg'  WHERE slug = 'simpsons';
UPDATE public.portrait_styles SET example_image_url = '/backgrounds/fo-1.jpg'  WHERE slug = 'fairly-odd';

-- Add NEGASVA style if not present
INSERT INTO public.portrait_styles (slug, name, description, example_image_url, is_active)
VALUES ('negasva', 'Estilo NEGASVA', 'El estilo propio y exclusivo de NEGASVA.', '/backgrounds/rm-1.jpg', true)
ON CONFLICT (slug) DO NOTHING;

-- 3) Seed prices (base in USD; studio converts to user currency)
INSERT INTO public.prices (key, label, amount, currency) VALUES
  ('torso_only',           'Torso únicamente (por persona)',  15.00, 'USD'),
  ('full_body',            'Cuerpo completo (por persona)',   25.00, 'USD'),
  ('background_standard',  'Fondo estándar',                  15.00, 'USD'),
  ('background_custom',    'Fondo personalizado',             25.00, 'USD'),
  ('express_surcharge_pct','Recargo entrega express (%)',     30.00, 'USD')
ON CONFLICT (key) DO NOTHING;

-- 4) Remove old backgrounds with broken /images/bg/ paths (from migration 003)
--    They have no style assigned and point to non-existent files.
DELETE FROM public.backgrounds WHERE image_url LIKE '/images/bg/%';

-- Also add RLS policies for portrait_styles if not done
ALTER TABLE public.portrait_styles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin read styles"   ON public.portrait_styles;
DROP POLICY IF EXISTS "admin write styles"  ON public.portrait_styles;
DROP POLICY IF EXISTS "public read styles"  ON public.portrait_styles;
CREATE POLICY "admin read styles"  ON public.portrait_styles FOR SELECT USING (is_admin());
CREATE POLICY "admin write styles" ON public.portrait_styles FOR ALL    USING (is_admin());
CREATE POLICY "public read styles" ON public.portrait_styles FOR SELECT USING (is_active = true);
