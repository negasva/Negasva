import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'pub-gallery', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, title, style, image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return errorResponse('Failed to load gallery', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  });
}
