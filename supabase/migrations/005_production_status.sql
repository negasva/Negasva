-- Production status: granular tracking states surfaced on /seguimiento
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS production_status VARCHAR(20)
    NOT NULL DEFAULT 'pending'
    CHECK (production_status IN ('pending', 'uploaded', 'drawing', 'ready', 'sent'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

CREATE INDEX IF NOT EXISTS orders_customer_email_idx
  ON public.orders (customer_email);
