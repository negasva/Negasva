import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import {
  AdminBackgroundCreateSchema,
  AdminBackgroundUpdateSchema,
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
  const rl = await rateLimitByIp(request, { prefix: 'admin-bg', max: 60, windowMs: 60_000 });
  return rl;
}

// The DB no longer constrains backgrounds.style to a fixed list, so verify
// the slug exists in portrait_styles (the table the admin Estilos manages).
async function styleExists(db: ReturnType<typeof createServiceClient>, slug: string) {
  const { data } = await db
    .from('portrait_styles')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();
  return !!data;
}

export async function GET(request: Request) {
  const blocked = await guard(request, false);
  if (blocked) return blocked;

  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('backgrounds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to load backgrounds', 500, error);
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

  const parsed = AdminBackgroundCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  if (parsed.data.style && !(await styleExists(db, parsed.data.style))) {
    return errorResponse('Unknown style', 400);
  }

  const { data, error } = await db
    .from('backgrounds')
    .insert({ ...parsed.data, active: parsed.data.active ?? true })
    .select()
    .single();

  if (error) return errorResponse('Failed to create background', 500, error);
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

  const parsed = AdminBackgroundUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, ['name', 'image_url', 'style', 'active']);
  if (Object.keys(fields).length === 0) {
    return errorResponse('No fields to update', 400);
  }

  if (typeof fields.style === 'string' && !(await styleExists(db, fields.style))) {
    return errorResponse('Unknown style', 400);
  }

  const { error } = await db.from('backgrounds').update(fields).eq('id', id);
  if (error) return errorResponse('Failed to update background', 500, error);
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

  const { error } = await db.from('backgrounds').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete background', 500, error);
  return NextResponse.json({ ok: true });
}
