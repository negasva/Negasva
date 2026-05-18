import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-body-types', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('body_types')
    .select('slug, name, description, price_usd, original_price_usd, is_best_value')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return errorResponse('Failed to load body types', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  });
}
