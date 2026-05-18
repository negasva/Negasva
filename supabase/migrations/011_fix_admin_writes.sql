-- Fix admin write blockers
-- 1. portrait_styles.example_image_url was NOT NULL but the admin form allows
--    creating a style without an image — drop the constraint.
ALTER TABLE public.portrait_styles
  ALTER COLUMN example_image_url DROP NOT NULL;

-- 2. backgrounds.slug was NOT NULL UNIQUE from the original migration, but the
--    current admin flow never sets it (images are identified by name + id).
--    Make it nullable so new rows can be inserted without a slug.
ALTER TABLE public.backgrounds
  ALTER COLUMN slug DROP NOT NULL;
