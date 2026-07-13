import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import {
  AdminDiscountCodeCreateSchema,
  AdminDiscountCodeUpdateSchema,
  DeleteByIdSchema,
} from '@/lib/validation/schemas';
import {
  errorResponse,
  pickFields,
  rateLimitByIp,
  readJson,
  validateSameOrigin,
  successAdminResponse,
} from '@/lib/security/apiHelpers';

async function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) {
    return errorResponse('Invalid origin', 403);
  }
  const rl = await rateLimitByIp(request, { prefix: 'admin-dc', max: 60, windowMs: 60_000 });
  return rl;
}

export async function GET(request: Request) {
  const blocked = await guard(request, false);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to load discount codes', 500, error);
  return successAdminResponse(data);
}

export async function POST(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminDiscountCodeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;
  const { data, error } = await db
    .from('discount_codes')
    .insert({
      code: d.code.toUpperCase(),
      type: d.type,
      value: d.value,
      expires_at: d.expires_at ?? null,
      max_uses: d.max_uses ?? null,
      active: d.active ?? true,
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create discount code', 500, error);
  return successAdminResponse(data, 201);
}

export async function PUT(request: Request) {
  const blocked = await guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdminRoute();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminDiscountCodeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const { id } = parsed.data;
  const fields = pickFields(parsed.data, [
    'code', 'type', 'value', 'expires_at', 'max_uses', 'active',
  ]);
  if (Object.keys(fields).length === 0) {
    return errorResponse('No fields to update', 400);
  }
  if (typeof fields.code === 'string') fields.code = fields.code.toUpperCase();

  const { error } = await db.from('discount_codes').update(fields).eq('id', id);
  if (error) return errorResponse('Failed to update discount code', 500, error);
  return successAdminResponse({ ok: true });
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

  const { error } = await db.from('discount_codes').delete().eq('id', parsed.data.id);
  if (error) return errorResponse('Failed to delete discount code', 500, error);
  return successAdminResponse({ ok: true });
}
