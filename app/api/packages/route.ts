import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-packages', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('packages')
    .select('id, name, description, final_price')
    .eq('active', true)
    .order('final_price', { ascending: true });

  if (error) return errorResponse('Failed to load packages', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  });
}
