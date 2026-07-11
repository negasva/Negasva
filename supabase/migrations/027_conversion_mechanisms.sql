-- Mecanismos de conversión:
-- 1. Cupones no combinables (newsletter 20%): un código con combinable=false
--    anula el descuento por nº de personas al aplicarse (valida el server).
-- 2. Código único por suscriptor del newsletter (se guarda para no re-emitir).
-- 3. Descuento agresivo al 2º retrato, % editable desde el admin de precios.

ALTER TABLE public.discount_codes
  ADD COLUMN IF NOT EXISTS combinable boolean NOT NULL DEFAULT true;

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS discount_code text;

INSERT INTO public.prices (key, label, amount, currency) VALUES
  ('second_portrait_pct', 'Descuento 2º retrato (%)', 40.00, 'USD')
ON CONFLICT (key) DO NOTHING;
