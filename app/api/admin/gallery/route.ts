import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';

// La galería aparece en / (marquee) y en /gallery (ISR). Regenerar ambas al
// mutar para que las subidas se vean sin esperar al revalidate periódico.
function revalidateGallery() {
  revalidatePath('/');
  revalidatePath('/gallery');
}
import {
  AdminGalleryCreateSchema,
  AdminGalleryUpdateSchema,
  DeleteByIdSchema,
} from '@/lib/validation/schemas';
import {
  errorResponse,
  pickFields,
  rateLimitByIp,
  readJson,
  validateSameOrigin,
} from '@/lib/security/apiHelpers';

async function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) {
    return errorResponse('Invalid origin', 403);
  }
  return await rateLimitByIp(request, { prefix: 'admin-gallery', max: 150, windowMs: 60_000 });
}

export async function GET(request: Request) {
  const blocked = await guard(request, false);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return errorResponse('Failed to load gallery', 500, error);
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminGalleryCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const d = parsed.data;
  const { data, error } = await db
    .from('gallery_items')
    .insert({
      title: d.title,
      style: d.style ?? null,
      image_url: d.image_url,
      before_url: d.before_url ?? null,
      sort_order: d.sort_order ?? 0,
      is_active: d.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    const hint = error.code === '42P01' ? ' (tabla gallery_items no existe — ejecuta migraciones 020 y 021 en Supabase)' : '';
    return errorResponse(`Failed to create item${hint}`, 500, error);
  }
  revalidateGallery();
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminGalleryUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, ['title', 'style', 'image_url', 'before_url', 'sort_order', 'is_active']);
  if (Object.keys(fields).length === 0) return errorResponse('No fields to update', 400);

  const { error } = await db
    .from('gallery_items')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return errorResponse('Failed to update item', 500, error);
  revalidateGallery();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const { error } = await db.from('gallery_items').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete item', 500, error);
  revalidateGallery();
  return NextResponse.json({ ok: true });
}
