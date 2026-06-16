import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import {
  AdminFaqCreateSchema,
  AdminFaqUpdateSchema,
  DeleteByIdSchema,
} from '@/lib/validation/schemas';
import {
  errorResponse,
  pickFields,
  rateLimitByIp,
  readJson,
  validateSameOrigin,
} from '@/lib/security/apiHelpers';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return null;
  return supabase;
}

async function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) {
    return errorResponse('Invalid origin', 403);
  }
  const rl = await rateLimitByIp(request, { prefix: 'admin-faq', max: 60, windowMs: 60_000 });
  return rl;
}

export async function GET(request: Request) {
  const blocked = await guard(request, false);
  if (blocked) return blocked;

  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return errorResponse('Failed to load faqs', 500, error);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminFaqCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;
  const { data, error } = await db
    .from('faqs')
    .insert({
      question: d.question,
      answer: d.answer,
      sort_order: d.sort_order ?? 0,
      is_active: d.is_active ?? true,
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create faq', 500, error);
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

  const parsed = AdminFaqUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, ['question', 'answer', 'sort_order', 'is_active']);
  if (Object.keys(fields).length === 0) {
    return errorResponse('No fields to update', 400);
  }

  const { error } = await db
    .from('faqs')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return errorResponse('Failed to update faq', 500, error);
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

  const { error } = await db.from('faqs').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete faq', 500, error);
  return NextResponse.json({ ok: true });
}
