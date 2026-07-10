import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';
import { styleImageFor } from '@/lib/content/stylesDb';

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'pub-styles', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('portrait_styles')
    .select('id, slug, landing_slug, name, description, example_image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name');

  if (error) return errorResponse('Failed to load styles', 500, error);

  // `image`: la misma resolución que la home (BD → contenido → fallback).
  return NextResponse.json((data ?? []).map((s) => ({ ...s, image: styleImageFor(s) })), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
