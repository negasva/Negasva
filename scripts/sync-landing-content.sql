-- ============================================================================
-- Sincroniza los DATOS de Supabase con el contenido real de la landing actual
-- (app/page.tsx + app/home-islands.tsx). Ejecutar en el SQL Editor de Supabase.
-- Idempotente: se puede correr varias veces.
--
-- Compañero de CLEANUP.sql (borrado de claves/tablas obsoletas — revisar antes
-- de ejecutar aquél; este archivo solo actualiza/añade datos).
-- ============================================================================

-- ── 1. landing_config.footer ────────────────────────────────────────────────
-- Mismo contenido que el fallback DEFAULT_FOOTER de components/PageFooter.tsx,
-- que es lo que la landing renderiza hoy cuando la tabla está vacía. Con esta
-- fila el panel /adminlanding/landing muestra los valores reales y editarlos
-- se refleja en la web sin cambiar nada visualmente al ejecutarse.
INSERT INTO public.landing_config (key, value, updated_at)
VALUES (
  'footer',
  '{
    "tagline_es": "Retratos personalizados de calidad profesional",
    "tagline_en": "Professional quality custom portraits",
    "tagline_fr": "Portraits personnalisés de qualité professionnelle",
    "social": [
      { "label": "Instagram", "url": "https://instagram.com/negasva" },
      { "label": "TikTok",    "url": "https://tiktok.com/@negasva" }
    ],
    "columns": [
      {
        "title_es": "Producto", "title_en": "Product", "title_fr": "Produit",
        "links": [
          { "label_es": "Cómo funciona", "label_en": "How It Works", "label_fr": "Comment ça marche", "href": "/how-it-works" },
          { "label_es": "Estilos",       "label_en": "Styles",       "label_fr": "Styles",            "href": "/styles" },
          { "label_es": "Precios",       "label_en": "Pricing",      "label_fr": "Tarifs",            "href": "/pricing" },
          { "label_es": "Galería",       "label_en": "Gallery",      "label_fr": "Galerie",           "href": "/gallery" },
          { "label_es": "Productos",     "label_en": "Products",     "label_fr": "Produits",          "href": "/products" },
          { "label_es": "Seguimiento",   "label_en": "Tracking",     "label_fr": "Suivi",             "href": "/track-order" }
        ]
      },
      {
        "title_es": "Empresa", "title_en": "Company", "title_fr": "Entreprise",
        "links": [
          { "label_es": "Sobre",    "label_en": "About",   "label_fr": "À propos", "href": "/about" },
          { "label_es": "Blog",     "label_en": "Blog",    "label_fr": "Blog",     "href": "/blog" },
          { "label_es": "Contacto", "label_en": "Contact", "label_fr": "Contact",  "href": "/contact" },
          { "label_es": "FAQ",      "label_en": "FAQ",     "label_fr": "FAQ",      "href": "/faq" }
        ]
      },
      {
        "title_es": "Legal", "title_en": "Legal", "title_fr": "Légal",
        "links": [
          { "label_es": "Privacidad", "label_en": "Privacy", "label_fr": "Confidentialité", "href": "/privacidad" },
          { "label_es": "Términos",   "label_en": "Terms",   "label_fr": "Conditions",      "href": "/terminos" },
          { "label_es": "Cookies",    "label_en": "Cookies", "label_fr": "Cookies",         "href": "/cookies" }
        ]
      }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();

-- ── 2. landing_config.site_images: poda de claves huérfanas ────────────────
-- La landing actual solo lee landing_hero_img1/2 y landing_paso_img1/2 (más
-- las claves order_body_* de /order). Elimina del JSON las claves del diseño
-- antiguo sin tocar el resto.
UPDATE public.landing_config
SET value = value
  - 'landing_hero_bg'
  - 'landing_before_sample'
  - 'landing_after_sample'
  - 'landing_how_step_1'
  - 'landing_how_step_2'
  - 'landing_how_step_3'
  - 'landing_how_step_4'
  - 'landing_how_step_5',
  updated_at = now()
WHERE key = 'site_images';

-- ── 3. Precios: alinear con lo anunciado en la landing ─────────────────────
-- app/page.tsx anuncia: torso $15, full body $25, "Custom Background: +$15".
-- ⚠️ Esto cambia lo que se COBRA en /order. Verificar antes de ejecutar que
-- estos son los precios comerciales correctos (la landing es la fuente de
-- verdad según la auditoría; los fallbacks del código ya se actualizaron en
-- lib/pricing/fallbacks.ts).
UPDATE public.body_types SET price_usd = 15 WHERE slug = 'torso_only';
UPDATE public.body_types SET price_usd = 25 WHERE slug = 'full_body';
UPDATE public.prices SET amount = 15 WHERE key = 'background_custom';
-- background_standard ya es 15 según los fallbacks; se fija por si difiere:
UPDATE public.prices SET amount = 15 WHERE key = 'background_standard';
