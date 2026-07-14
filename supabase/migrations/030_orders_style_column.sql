-- 030: columna `style` que faltaba en `orders`
--
-- El insert de POST /api/checkout (y el de PayPal) escribe `style: d.style`,
-- pero ninguna migración creaba la columna `style` en `orders` (la 007 añade
-- `style` a `backgrounds`, no a `orders`). Sin ella, insertar el pedido
-- pendiente fallaba con «column "style" does not exist» → 500 «Could not
-- create order» → el checkout mostraba «Could not start payment» y el pago de
-- Mercado Pago nunca arrancaba.
--
-- Idempotente: seguro de re-ejecutar. Si la columna ya existe, es no-op.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS style text;
