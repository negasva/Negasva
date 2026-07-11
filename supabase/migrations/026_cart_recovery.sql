-- ─────────────────────────────────────────────────────────────────────────
-- 026: tracking de recuperación de carritos abandonados
--
-- El cron /api/cron/recover-carts busca carritos abandonados con email, genera
-- un código de descuento único (discount_codes) y envía 1 de 4 versiones de
-- email. Estas columnas evitan reenvíos y permiten medir qué versión funciona.
--
-- Ejecutar una vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.carts ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz;
-- Qué versión (1..4) se envió — para A/B testing desde el admin.
ALTER TABLE public.carts ADD COLUMN IF NOT EXISTS recovery_variant integer;
-- Código de descuento único generado para este carrito.
ALTER TABLE public.carts ADD COLUMN IF NOT EXISTS recovery_code    text;

-- Índice para que el cron encuentre rápido los pendientes de recuperar.
CREATE INDEX IF NOT EXISTS carts_recovery_pending_idx
  ON public.carts (updated_at)
  WHERE recovery_sent_at IS NULL AND status = 'active';
