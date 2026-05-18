import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  errorResponse,
  rateLimitByIp,
  readJson,
  validateSameOrigin,
} from '@/lib/security/apiHelpers';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') return null;
  return createServiceClient();
}

function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  return rateLimitByIp(request, { prefix: 'admin-bt', max: 60, windowMs: 60_000 });
}

const CreateSchema = z.object({
  slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300).nullable().optional(),
  price_usd: z.number().min(0).max(9999),
  original_price_usd: z.number().min(0).max(9999).nullable().optional(),
  is_best_value: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(300).nullable().optional(),
  price_usd: z.number().min(0).max(9999).optional(),
  original_price_usd: z.number().min(0).max(9999).nullable().optional(),
  is_best_value: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(request: Request) {
  const blocked = guard(request, false);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('body_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return errorResponse('Failed to load body types', 500, error);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { data, error } = await supabase.from('body_types').insert(parsed.data).select().single();
  if (error) return errorResponse('Failed to create body type', 500, error);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { id, ...fields } = parsed.data;
  if (Object.keys(fields).length === 0) return errorResponse('No fields to update', 400);

  const { error } = await supabase.from('body_types').update(fields).eq('id', id);
  if (error) return errorResponse('Failed to update body type', 500, error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;
  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const { error } = await supabase.from('body_types').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete body type', 500, error);
  return NextResponse.json({ ok: true });
}
