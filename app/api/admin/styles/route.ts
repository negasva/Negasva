import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { AdminStyleCreateSchema, AdminStyleUpdateSchema, DeleteByIdSchema } from '@/lib/validation/schemas';
import { errorResponse, pickFields, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return null;
  return supabase;
}

async function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  return await rateLimitByIp(request, { prefix: 'admin-styles', max: 60, windowMs: 60_000 });
}

export async function GET(request: Request) {
  const blocked = await guard(request, false);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('portrait_styles')
    .select('id, slug, name, description, example_image_url, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('name');

  if (error) return errorResponse('Failed to load styles', 500, error);
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminStyleCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { data, error } = await db.from('portrait_styles').insert(parsed.data).select().single();
  if (error) return errorResponse('Failed to create style', 500, error);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminStyleUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, ['name', 'description', 'example_image_url', 'is_active', 'sort_order']);
  if (Object.keys(fields).length === 0) return errorResponse('No fields to update', 400);

  const { error } = await db.from('portrait_styles').update(fields).eq('id', id);
  if (error) return errorResponse('Failed to update style', 500, error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const { error } = await db.from('portrait_styles').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete style', 500, error);
  return NextResponse.json({ ok: true });
}
