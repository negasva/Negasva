import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { signOrderPhotos } from '@/lib/payments/orderPhotos';
import { DeleteByIdSchema } from '@/lib/validation/schemas';
import { successAdminResponse, errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

/**
 * Real paid orders (the `orders` table written by the Stripe/Wompi webhooks),
 * with short-lived signed URLs for each uploaded photo so the illustrator can
 * see what to draw. Distinct from /api/admin/orders, which manages the manual
 * `admin_orders` tracking table.
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'admin-checkout-orders', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  const db = createServiceClient();
  const { data, error } = await db
    .from('orders')
    .select('id, created_at, provider, provider_reference, status, amount_total, currency, style, body_type, background, people_count, express, special_requests, discount_code, customer_email, photo_paths')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return errorResponse('Failed to load orders', 500, error);

  const orders = await Promise.all(
    (data ?? []).map(async (o) => {
      const paths: string[] = Array.isArray(o.photo_paths) ? o.photo_paths : [];
      const photoUrls = await signOrderPhotos(db, paths);
      return { ...o, photoUrls };
    }),
  );

  return successAdminResponse(orders);
}

/**
 * "Borrar" un pedido de la vista = archivarlo (soft-hide). No elimina la fila
 * (dato de pago/conciliación), solo la oculta del panel marcando archived_at.
 */
export async function DELETE(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-checkout-orders', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const db = createServiceClient();
  const { error } = await db
    .from('orders')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) return errorResponse('Failed to archive order', 500, error);
  return successAdminResponse({ ok: true });
}
