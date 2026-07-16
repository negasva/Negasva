import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { createRecoveryDiscount, type DiscountType } from '@/lib/carts/recovery';
import { buildRecoveryEmail } from '@/lib/notify/cartRecovery';
import { sendEmail } from '@/lib/notify/email';
import { DeleteByIdSchema } from '@/lib/validation/schemas';
import { successAdminResponse, errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Envío MANUAL del email de recuperación de un carrito, desde el botón
 * "Enviar email" del panel. Reutiliza exactamente el mismo motor que el cron
 * automático (/api/cron/recover-carts): genera un cupón único, arma 1 de las 4
 * plantillas y lo manda por Resend. La diferencia es que aquí lo dispara el
 * admin sobre un carrito concreto, sin esperar al cron.
 *
 * Config por env (mismos defaults que el cron):
 *   CART_RECOVERY_DISCOUNT_TYPE  'percentage' | 'fixed'  (def. percentage)
 *   CART_RECOVERY_DISCOUNT_VALUE número                   (def. 10)
 *   CART_RECOVERY_EXPIRES_HOURS  horas de validez del cupón (def. 72)
 */
export async function POST(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-cart-recovery', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  const auth = await requireAdminRoute();
  if (!auth) return errorResponse('Unauthorized', 401);

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return errorResponse('Email (Resend) no configurado. Revisa RESEND_API_KEY y RESEND_FROM.', 503);
  }

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = DeleteByIdSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Missing id', 400);

  const db = createServiceClient();
  const { data: cart, error } = await db
    .from('carts')
    .select('id, cart_id, customer_name, customer_email, summary, recovery_sent_at')
    .eq('id', parsed.data.id)
    .maybeSingle();

  if (error) return errorResponse('Failed to load cart', 500, error);
  if (!cart) return errorResponse('Cart not found', 404);

  const email = (cart.customer_email ?? '').trim();
  if (!email) return errorResponse('Este carrito no tiene email de contacto.', 400);

  const type: DiscountType = process.env.CART_RECOVERY_DISCOUNT_TYPE === 'fixed' ? 'fixed' : 'percentage';
  const value = Number(process.env.CART_RECOVERY_DISCOUNT_VALUE) || 10;
  const expiresHours = Number(process.env.CART_RECOVERY_EXPIRES_HOURS) || 72;
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://negasva.shop';
  const replyTo = process.env.ADMIN_NOTIFY_EMAIL || undefined;
  const expiresLabel = expiresHours % 24 === 0 ? `${expiresHours / 24} días` : `${expiresHours} horas`;
  const expiresAt = new Date(Date.now() + expiresHours * 3600_000);

  const discount = await createRecoveryDiscount(db, { type, value, expiresAt });
  if (!discount) return errorResponse('No se pudo generar el cupón.', 500);

  const url = `${site}/order?code=${encodeURIComponent(discount.code)}`;
  const { subject, html, variant } = buildRecoveryEmail({
    name: cart.customer_name,
    code: discount.code,
    discountLabel: discount.label,
    expiresLabel,
    url,
    summary: cart.summary,
  });

  const ok = await sendEmail({ to: email, subject, html, replyTo });
  if (!ok) return errorResponse('El correo no se pudo enviar (Resend).', 502);

  await db
    .from('carts')
    .update({
      recovery_sent_at: new Date().toISOString(),
      recovery_variant: variant,
      recovery_code: discount.code,
    })
    .eq('id', cart.id);

  return successAdminResponse({ ok: true, sentTo: email, code: discount.code, variant });
}
