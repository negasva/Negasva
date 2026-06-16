import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

// Conteo agregado de pedidos recientes para social proof en la landing.
// Solo expone un número, nunca datos de pedidos.
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'pub-stats', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['paid', 'completed'])
    .gte('created_at', since);

  if (error) return errorResponse('Failed to load stats', 500, error);

  return NextResponse.json(
    { weekly_orders: count ?? 0 },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } },
  );
}
