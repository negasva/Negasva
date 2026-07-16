-- ─────────────────────────────────────────────────────────────────────────
-- 031: archivar items en el admin (soft-hide) + vincular carrito ↔ pedido
--
--  1. `archived_at` en `orders` y `carts`: el admin puede "borrar" (ocultar)
--     items sin perder el dato. Las vistas del panel filtran archived_at IS NULL;
--     nada se borra físicamente, así que es reversible desde la BD.
--
--  2. `cart_id` en `orders`: hasta ahora no había forma fiable de saber qué
--     carrito terminó pagado. El checkout marcaba el carrito `converted` en el
--     mismo momento de CREAR el pedido pendiente (antes de pagar), así que un
--     carrito aparecía "Convertido" aunque el pago nunca se aprobara. Con este
--     enlace, el panel calcula "convertido" solo cuando existe un pedido
--     realmente `paid` para ese cart_id (fuente de verdad = webhook de pago).
--
-- Ejecutar una vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Archivar (ocultar) items sin borrarlos ------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.carts  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 2) Enlace carrito → pedido para calcular conversión real ----------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cart_id text;

-- Índice para cotejar rápido qué carritos tienen un pedido pagado.
CREATE INDEX IF NOT EXISTS orders_cart_id_paid_idx
  ON public.orders (cart_id)
  WHERE cart_id IS NOT NULL AND status = 'paid';

-- 3) Sanear datos histórico: carritos marcados `converted` que NO tienen un
--    pedido pagado asociado fueron marcados por error (checkout prematuro).
--    Se devuelven a `active`; el panel decidirá si están abandonados por
--    inactividad. No toca los que sí tengan un pago real.
UPDATE public.carts c
   SET status = 'active'
 WHERE c.status = 'converted'
   AND NOT EXISTS (
     SELECT 1 FROM public.orders o
      WHERE o.status = 'paid'
        AND (o.cart_id = c.cart_id OR o.customer_email = c.customer_email)
   );
