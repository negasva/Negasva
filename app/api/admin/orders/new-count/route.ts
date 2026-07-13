import { requireAdminRoute } from '@/lib/admin/auth';
import { successAdminResponse, errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

// Count of paid orders, for the live "new orders" badge in the admin sidebar
// (polled). Cheap head-count query — no photo signing, unlike checkout-orders.
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'admin-order-count', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const db = await requireAdminRoute();
  if (!db) return errorResponse('Unauthorized', 401);

  const { count, error } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'paid');

  if (error) return errorResponse('Failed to count orders', 500, error);
  return successAdminResponse({ count: count ?? 0 });
}
