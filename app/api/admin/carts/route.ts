import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { successAdminResponse, errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

/**
 * Carritos (activos / abandonados / convertidos) para el panel admin. Sirve
 * para ver qué estaban configurando quienes NO terminaron el pedido y, si
 * dejaron contacto, hacerles seguimiento.
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'admin-carts', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  const db = createServiceClient();
  const { data, error } = await db
    .from('carts')
    .select('id, cart_id, status, step, summary, amount_usd, currency, customer_name, customer_email, customer_phone, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(300);

  if (error) return errorResponse('Failed to load carts', 500, error);

  return successAdminResponse(data ?? []);
}
