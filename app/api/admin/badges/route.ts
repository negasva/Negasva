import { requireAdminRoute } from '@/lib/admin/auth';
import { successAdminResponse, errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

/**
 * Conteos "sin gestionar" para los círculos rojos del sidebar admin. Cada uno
 * es un HEAD count barato (sin traer filas). El sidebar los pinta junto a
 * Dashboard (total), Pagos Pendientes, Carritos y Pedidos.
 *
 *   pagos    → pedidos reales todavía en `pending` (pago sin confirmar/gestionar)
 *   carritos → carritos abandonados con contacto, sin convertir y sin email de
 *              recuperación enviado (los accionables)
 *   pedidos  → seguimiento manual (admin_orders) todavía en `pending`
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'admin-badges', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const db = await requireAdminRoute();
  if (!db) return errorResponse('Unauthorized', 401);

  // Carrito abandonado = sin actividad > 1h (mismo umbral que la vista).
  const idleBefore = new Date(Date.now() - 3600_000).toISOString();

  const [pagos, carritos, pedidos] = await Promise.all([
    db.from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('archived_at', null),
    db.from('carts')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'converted')
      .is('archived_at', null)
      .is('recovery_sent_at', null)
      .lte('updated_at', idleBefore)
      .or('customer_email.not.is.null,customer_phone.not.is.null'),
    db.from('admin_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const counts = {
    pagos: pagos.count ?? 0,
    carritos: carritos.count ?? 0,
    pedidos: pedidos.count ?? 0,
  };

  // El panel solo notifica COMPRAS: el total (Dashboard + móvil) refleja solo
  // los pagos pendientes. Carritos y pedidos ya no generan notificación.
  return successAdminResponse({
    ...counts,
    total: counts.pagos,
  });
}
