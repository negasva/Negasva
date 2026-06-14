import { NextResponse } from 'next/server';
import { createServerClient, createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

// Contenido editable de páginas (es/en/fr). Ver migración 017_page_content.

const noStore = { 'Cache-Control': 'no-store, must-revalidate' };

export async function GET(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'pub-page-content', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const supabase = createServerClient();

  // ?page=faq -> overrides de una página (consumo público).
  if (page) {
    const { data, error } = await supabase
      .from('page_content')
      .select('content')
      .eq('page', page)
      .maybeSingle();
    if (error) return errorResponse('Failed to load page content', 500, error);
    return NextResponse.json({ content: data?.content ?? {} }, { headers: noStore });
  }

  // Sin page -> todas las filas (para el editor del admin).
  const { data, error } = await supabase.from('page_content').select('page, content');
  if (error) return errorResponse('Failed to load page content', 500, error);
  const all: Record<string, unknown> = {};
  for (const row of data ?? []) all[row.page] = row.content;
  return NextResponse.json(all, { headers: noStore });
}

export async function PATCH(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = rateLimitByIp(request, { prefix: 'admin-page-content', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400);

  const { page, content } = body as { page?: string; content?: unknown };
  if (!page || typeof page !== 'string') return errorResponse('Invalid page', 400);
  if (!content || typeof content !== 'object') return errorResponse('Invalid content', 400);

  const db = createServiceClient();
  const { error } = await db
    .from('page_content')
    .upsert({ page, content, updated_at: new Date().toISOString() }, { onConflict: 'page' });

  if (error) return errorResponse('Failed to save page content', 500, error);
  return NextResponse.json({ ok: true });
}
