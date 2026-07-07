-- ─────────────────────────────────────────────────────────────────────────
-- 024: el estilo propio NEGASVA es un estilo activo en /order, así que aparece
-- en la grilla de la home (getHomeStyles lee is_active). Su nombre/descr venían
-- en español desde la migración 008 → pásalos a inglés (default del sitio).
-- ─────────────────────────────────────────────────────────────────────────

UPDATE public.portrait_styles
SET name = 'NEGASVA Style',
    description = 'Our own exclusive hand-drawn portrait style.'
WHERE slug = 'negasva';
