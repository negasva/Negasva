import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { AdminOrderCreateSchema, AdminOrderUpdateSchema, DeleteByIdSchema } from '@/lib/validation/schemas';
import { errorResponse, pickFields, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') return null;
  return supabase;
}

function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  return rateLimitByIp(request, { prefix: 'admin-orders', max: 120, windowMs: 60_000 });
}

export async function GET(request: Request) {
  const blocked = guard(request, false);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('admin_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to load orders', 500, error);
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminOrderCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { data, error } = await db.from('admin_orders').insert(parsed.data).select().single();
  if (error) return errorResponse('Failed to create order', 500, error);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, [
    'client_name', 'client_email', 'client_instagram', 'style', 'body_type',
    'background_name', 'people_count', 'status', 'price', 'currency', 'notes',
    'reference', 'delivered_at',
  ]);

  if (Object.keys(fields).length === 0) return errorResponse('No fields to update', 400);

  const { error } = await db.from('admin_orders').update(fields).eq('id', id);
  if (error) return errorResponse('Failed to update order', 500, error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const { error } = await db.from('admin_orders').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete order', 500, error);
  return NextResponse.json({ ok: true });
}
