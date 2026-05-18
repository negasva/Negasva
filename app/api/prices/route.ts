import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-prices', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('prices')
    .select('key, label, amount, currency');

  if (error) return errorResponse('Failed to load prices', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  });
}
