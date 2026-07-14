-- 029: columnas de pago en `orders` (antes numerada 027, colisionaba con
-- 027_conversion_mechanisms.sql y el runner la saltaba en producción)
-- columnas de pago en `orders` que el checkout/pagos/webhooks ya usaban
-- pero que ninguna migración había creado. Sin ellas, POST /api/checkout
-- fallaba al insertar el pedido pendiente (500) y el pago no arrancaba.
--
-- Idempotente: seguro de re-ejecutar. Si las columnas ya existen, es no-op.

-- 1) Columnas que el insert de /api/checkout y las lecturas de
--    /api/payments/mercadopago y el webhook esperan en `orders`.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS provider           text,
  ADD COLUMN IF NOT EXISTS provider_reference text,
  ADD COLUMN IF NOT EXISTS amount_total       bigint,
  ADD COLUMN IF NOT EXISTS body_type          text,
  ADD COLUMN IF NOT EXISTS background          text,
  ADD COLUMN IF NOT EXISTS people_count       integer,
  ADD COLUMN IF NOT EXISTS express            boolean,
  ADD COLUMN IF NOT EXISTS special_requests   text;

-- 2) El pedido lo crea el servidor con service-role antes de que exista un
--    usuario autenticado (checkout de invitado). `user_id` debe poder ser NULL.
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 3) El CHECK original no permitía los estados que usa el flujo de pago
--    (pending/failed). Se amplía manteniendo los antiguos.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'draft', 'submitted', 'payment_pending', 'pending',
    'paid', 'failed', 'completed', 'refunded'
  ));

-- 4) El webhook y el pago cotejan por (provider, provider_reference); índice
--    único para que reintentos/duplicados no creen filas repetidas.
CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_reference_idx
  ON public.orders (provider, provider_reference)
  WHERE provider_reference IS NOT NULL;
