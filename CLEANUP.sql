-- ============================================================================
-- CLEANUP.sql — datos y tablas de Supabase que quedaron huérfanos tras el
-- rediseño de la landing (ver AUDIT-ADMIN-LANDING.md, columna c).
--
-- NO se ejecuta automáticamente. Revisar y correr a mano en el SQL Editor de
-- Supabase DESPUÉS de desplegar el código de esta rama (que ya no escribe ni
-- lee estas claves) y de ejecutar scripts/sync-landing-content.sql.
-- ============================================================================

-- ── 1. Claves de landing_config sin lector ──────────────────────────────────
-- La landing actual (app/page.tsx) tiene el hero, los pasos y las stats
-- hardcodeados, y ya no existe la sección de galería-marquee. Los editores
-- correspondientes se retiraron de /adminlanding/landing y de /admin/imagenes,
-- y la API /api/landing-config ya no acepta estas claves.
DELETE FROM public.landing_config
WHERE key IN ('hero', 'how_it_works', 'gallery_images', 'stats');

-- ── 2. NO tocar ──────────────────────────────────────────────────────────────
-- packages        → la consume /pricing (query directa a Supabase en
--                   app/pricing/page.tsx). Solo se eliminó la ruta pública
--                   /api/packages, que no tenía ningún consumidor.
-- faqs            → la usa la home (/api/faqs) y /faq.
-- gallery         → la usa /gallery (panel /adminlanding/galeria).
-- discount_codes  → checkout.
-- prices, body_types, backgrounds, portrait_styles, admin_orders,
-- page_content    → flujo /order, paneles /admin y editor de contenido.
-- landing_config ('footer', 'site_images') → PageFooter y fotos de la landing.
