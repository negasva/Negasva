import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createRecoveryDiscount } from '@/lib/carts/recovery';
import { NewsletterSchema } from '@/lib/validation/schemas';
import { verifyRecaptcha } from '@/lib/security/recaptcha';
import {
  errorResponse,
  rateLimitByIp,
  readJson,
} from '@/lib/security/apiHelpers';

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'newsletter', max: 5, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  // Newsletter es un imán de spam y de bajo riesgo para el usuario legítimo:
  // exigimos token reCAPTCHA válido cuando hay secret configurado.
  const token = (body as { recaptchaToken?: string }).recaptchaToken;
  const human = await verifyRecaptcha(token, { action: 'newsletter', required: true });
  if (!human) return errorResponse('Verificación de seguridad fallida', 400);

  const parsed = NewsletterSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Invalid email', 400);

  const { email, source } = parsed.data;

  // Código ÚNICO de 20% por email, NO combinable con otras promociones (al
  // aplicarse anula el descuento por nº de personas — lo valida el server).
  // Si el email ya tiene código, se le devuelve el mismo (no se re-emite).
  let code: string | null = null;
  try {
    const db = createServiceClient();
    const { data: existing } = await db
      .from('newsletter_subscribers')
      .select('discount_code')
      .eq('email', email)
      .maybeSingle();
    code = existing?.discount_code ?? null;

    if (!code) {
      const discount = await createRecoveryDiscount(db, {
        type: 'percentage',
        value: 20,
        prefix: 'HOLA20',
        combinable: false,
      });
      code = discount?.code ?? null;
    }

    await db
      .from('newsletter_subscribers')
      .upsert({ email, source: source ?? 'popup', ...(code ? { discount_code: code } : {}) }, { onConflict: 'email' });
  } catch (err) {
    console.error('[newsletter] subscribe failed', err);
  }

  if (!code) return errorResponse('No se pudo generar tu código. Inténtalo de nuevo.', 500);
  return NextResponse.json({ ok: true, code });
}
