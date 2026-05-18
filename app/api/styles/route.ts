import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-styles', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('portrait_styles')
    .select('id, slug, name, description, example_image_url')
    .eq('is_active', true)
    .order('name');

  if (error) return errorResponse('Failed to load styles', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
