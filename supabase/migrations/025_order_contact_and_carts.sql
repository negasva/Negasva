-- ─────────────────────────────────────────────────────────────────────────
-- 025: datos de contacto del cliente en `orders` + tabla `carts` (carritos)
--
--  1. Contacto en el pedido real: hasta ahora el checkout guardaba el pedido
--     sin saber QUIÉN compra ni CÓMO contactarlo. `customer_email` ya existía
--     (005) pero nunca se rellenaba; añadimos nombre y teléfono/WhatsApp. Con
--     esto /track-order (que pide email) por fin funciona.
--
--  2. Carritos: cada pedido en curso se va guardando en `carts` (upsert por
--     `cart_id`, un id generado en el navegador). Si el cliente cierra el
--     proceso a mitad, en `carts` queda lo que llevaba y en qué paso iba, para
--     verlo en el admin y hacer seguimiento. Al pagar, el carrito se marca
--     `converted`.
--
-- Ejecutar una vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Contacto en el pedido real -------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name  text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;

-- 2) Tabla de carritos (activos / abandonados / convertidos) ---------------
CREATE TABLE IF NOT EXISTS public.carts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Id estable generado en el navegador; una fila por carrito. El upsert
  -- público actualiza SIEMPRE la misma fila mientras el cliente avanza.
  cart_id        text NOT NULL UNIQUE,
  status         text NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'converted', 'abandoned')),
  step           integer NOT NULL DEFAULT 1,
  -- Snapshot completo de la selección (estilo, fondo, add-ons, productos…).
  state          jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Resumen legible para el admin sin tener que abrir el JSON.
  summary        text,
  amount_usd     numeric(10,2),
  currency       text,
  -- Contacto, si el cliente llegó a escribirlo (checkout).
  customer_name  text,
  customer_email text,
  customer_phone text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS carts_status_idx      ON public.carts (status);
CREATE INDEX IF NOT EXISTS carts_updated_at_idx  ON public.carts (updated_at DESC);

-- RLS: solo el admin lee/gestiona. El upsert público del wizard usa el
-- service role (createServiceClient), que salta RLS — igual que `orders`.
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin all carts" ON public.carts;
CREATE POLICY "admin all carts" ON public.carts FOR ALL USING (is_admin());

-- Mantener updated_at al día en cada upsert.
DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
