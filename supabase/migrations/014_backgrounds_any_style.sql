-- Migration 014: allow backgrounds for admin-created styles
--
-- The backgrounds.style CHECK constraint hardcoded the five original style
-- slugs, so backgrounds could never be assigned to a new style created from
-- the admin panel. Validation now happens in the admin API against
-- portrait_styles.

ALTER TABLE public.backgrounds
  DROP CONSTRAINT IF EXISTS backgrounds_style_check;
