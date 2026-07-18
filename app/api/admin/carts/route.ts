import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { DeleteByIdSchema } from '@/lib/validation/schemas';
import { successAdminResponse, errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

/**
 * Carritos (activos / abandonados / convertidos) para el panel admin. Sirve
 * para ver qué estaban configurando quienes NO terminaron el pedido y, si
 * dejaron contacto, hacerles seguimiento.
 *
 * Los archivados (archived_at != null) se ocultan: el admin puede "borrar"
 * (ocultar) un carrito sin perder el dato.
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'admin-carts', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  // ?archived=1 → pestaña "Archivados": lista solo los ocultos (para verlos/
  // restaurarlos). Por defecto lista los activos (archived_at IS null).
  const wantArchived = new URL(request.url).searchParams.get('archived') === '1';

  const db = createServiceClient();
  const query = db
    .from('carts')
    .select('id, cart_id, status, step, summary, amount_usd, currency, customer_name, customer_email, customer_phone, recovery_sent_at, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(300);
  const { data, error } = await (wantArchived
    ? query.not('archived_at', 'is', null)
    : query.is('archived_at', null));

  if (error) return errorResponse('Failed to load carts', 500, error);

  return successAdminResponse(data ?? []);
}

/** Restaurar un carrito archivado: vuelve a mostrarse en el panel. */
export async function PATCH(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-carts', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const db = createServiceClient();
  const { error } = await db.from('carts').update({ archived_at: null }).eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to restore cart', 500, error);
  return successAdminResponse({ ok: true });
}

/**
 * "Borrar" un carrito = archivarlo (soft-hide). Marca archived_at para que
 * desaparezca de la vista sin eliminar la fila (reversible desde la BD).
 */
export async function DELETE(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-carts', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const db = createServiceClient();
  const { error } = await db
    .from('carts')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) return errorResponse('Failed to archive cart', 500, error);
  return successAdminResponse({ ok: true });
}
