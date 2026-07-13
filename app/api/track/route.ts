import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { TrackOrderSchema } from '@/lib/validation/order';
import {
  errorResponse,
  rateLimitByIp,
  readJson,
} from '@/lib/security/apiHelpers';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de pago',
  uploaded: 'Fotos recibidas',
  drawing: 'Dibujando',
  ready: 'Listo para enviar',
  sent: 'Enviado',
};

// Generic 404 — never differentiate "wrong email" vs "order doesn't exist"
// or attackers can enumerate which order ids exist by probing.
const NOT_FOUND = 'Pedido no encontrado';

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'track', max: 10, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = TrackOrderSchema.safeParse(body);
  if (!parsed.success) return errorResponse(NOT_FOUND, 404);

  const { orderId, email } = parsed.data;

  // Service role: orders is RLS-locked to auth.uid() = user_id, so anon reads
  // return nothing. Matching (orderId + email) is enforced here in the query.
  const { data, error } = await createServiceClient()
    .from('orders')
    .select('id, provider_reference, production_status, status, created_at, completed_at')
    .eq('provider_reference', orderId)
    .eq('customer_email', email)
    .maybeSingle();

  if (error) return errorResponse(NOT_FOUND, 404, error);
  if (!data) return errorResponse(NOT_FOUND, 404);

  return NextResponse.json({
    orderId: data.id,
    productionStatus: data.production_status,
    statusLabel: STATUS_LABEL[data.production_status] ?? data.production_status,
    paymentStatus: data.status,
    createdAt: data.created_at,
    completedAt: data.completed_at,
  });
}
