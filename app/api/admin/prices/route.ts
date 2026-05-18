import { NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { AdminPriceUpdateSchema } from '@/lib/validation/schemas';
import {
  errorResponse,
  pickFields,
  rateLimitByIp,
  readJson,
  validateSameOrigin,
} from '@/lib/security/apiHelpers';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') return null;
  return supabase;
}

function guard(request: Request, mutating: boolean) {
  if (mutating && !validateSameOrigin(request)) {
    return errorResponse('Invalid origin', 403);
  }
  const rl = rateLimitByIp(request, { prefix: 'admin-price', max: 60, windowMs: 60_000 });
  return rl;
}

export async function GET(request: Request) {
  const blocked = guard(request, false);
  if (blocked) return blocked;

  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .order('key');

  if (error) return errorResponse('Failed to load prices', 500, error);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const blocked = guard(request, true);
  if (blocked) return blocked;

  const supabase = await requireAdmin();
  if (!supabase) return errorResponse('Unauthorized', 401);
  const db = createServiceClient();

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = AdminPriceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const fields = pickFields(parsed.data, ['amount']);

  const { error } = await db
    .from('prices')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) return errorResponse('Failed to update price', 500, error);
  return NextResponse.json({ ok: true });
}
