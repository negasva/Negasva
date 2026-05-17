import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';
import { NewsletterSchema } from '@/lib/validation/schemas';
import {
  errorResponse,
  rateLimitByIp,
  readJson,
} from '@/lib/security/apiHelpers';

export async function POST(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'newsletter', max: 5, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = NewsletterSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Invalid email', 400);

  const { email, source } = parsed.data;

  try {
    await getSupabase()
      .from('newsletter_subscribers')
      .upsert({ email, source: source ?? 'popup' }, { onConflict: 'email' });
  } catch (err) {
    console.error('[newsletter] upsert failed', err);
    // Storage best-effort; client still gets the coupon.
  }

  return NextResponse.json({ ok: true });
}
