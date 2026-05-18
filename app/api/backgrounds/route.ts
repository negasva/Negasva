import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp } from '@/lib/security/apiHelpers';

const VALID_STYLES = ['rick-morty', 'gravity-falls', 'simpsons', 'fairly-odd', 'negasva'] as const;

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-bg', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const style = searchParams.get('style');

  if (style && !VALID_STYLES.includes(style as (typeof VALID_STYLES)[number])) {
    return errorResponse('Invalid style', 400);
  }

  const supabase = createServerClient();
  let query = supabase
    .from('backgrounds')
    .select('id, name, image_url, style')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (style) {
    query = query.eq('style', style);
  }

  const { data, error } = await query;
  if (error) return errorResponse('Failed to load backgrounds', 500, error);

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
