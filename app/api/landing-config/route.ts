import { NextResponse } from 'next/server';
import { createServerClient, createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

const ALLOWED_KEYS = ['hero', 'how_it_works', 'gallery_images', 'stats', 'footer'];

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-landing', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('landing_config')
    .select('key, value');

  if (error) return errorResponse('Failed to load landing config', 500, error);

  const config: Record<string, unknown> = {};
  for (const row of data ?? []) config[row.key] = row.value;

  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export async function PATCH(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = rateLimitByIp(request, { prefix: 'admin-landing', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400);

  const { key, value } = body as { key?: string; value?: unknown };
  if (!key || !ALLOWED_KEYS.includes(key)) return errorResponse('Invalid key', 400);
  if (value === undefined || value === null) return errorResponse('Missing value', 400);

  const db = createServiceClient();
  const { error } = await db
    .from('landing_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return errorResponse('Failed to save landing config', 500, error);
  return NextResponse.json({ ok: true });
}
