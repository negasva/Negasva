import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createRecoveryDiscount, type DiscountType } from '@/lib/carts/recovery';
import { buildRecoveryEmail } from '@/lib/notify/cartRecovery';
import { sendEmail } from '@/lib/notify/email';

// Debe ejecutarse siempre en servidor, nunca cacheado (envía correos reales).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cron de recuperación de carritos abandonados.
 *
 * Lo dispara Vercel Cron (ver vercel.json), que envía
 * `Authorization: Bearer <CRON_SECRET>`. Para cada carrito abandonado con
 * email (activo, inactivo hace un rato, no demasiado viejo, sin recuperación
 * previa) genera un código de descuento ÚNICO y envía 1 de 4 versiones de
 * email. Marca el carrito para no reenviar y poder medir qué versión gana.
 *
 * Config por env (con valores por defecto sensatos):
 *   CART_RECOVERY_DISCOUNT_TYPE  'percentage' | 'fixed'   (def. percentage)
 *   CART_RECOVERY_DISCOUNT_VALUE número                    (def. 10)
 *   CART_RECOVERY_EXPIRES_HOURS  horas de validez del cupón (def. 72)
 *   CART_RECOVERY_MIN_AGE_MIN    minutos inactivo mínimo    (def. 60)
 *   CART_RECOVERY_MAX_AGE_HOURS  antigüedad máxima          (def. 168 = 7 días)
 *   CART_RECOVERY_BATCH          máximo por ejecución       (def. 50)
 */
export async function GET(request: Request) {
  // Auth: solo Vercel Cron (o quien tenga el secret). Sin CRON_SECRET no se
  // envía nada — evita disparos accidentales que gastarían cupones/correos.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json({ ok: false, error: 'Email (Resend) no configurado' }, { status: 200 });
  }

  const type: DiscountType = process.env.CART_RECOVERY_DISCOUNT_TYPE === 'fixed' ? 'fixed' : 'percentage';
  const value = Number(process.env.CART_RECOVERY_DISCOUNT_VALUE) || 10;
  const expiresHours = Number(process.env.CART_RECOVERY_EXPIRES_HOURS) || 72;
  const minAgeMin = Number(process.env.CART_RECOVERY_MIN_AGE_MIN) || 60;
  const maxAgeHours = Number(process.env.CART_RECOVERY_MAX_AGE_HOURS) || 168;
  const batch = Number(process.env.CART_RECOVERY_BATCH) || 50;
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://negasva.shop';
  const replyTo = process.env.ADMIN_NOTIFY_EMAIL || undefined;

  const expiresLabel = expiresHours % 24 === 0 ? `${expiresHours / 24} días` : `${expiresHours} horas`;

  const now = Date.now();
  const idleBefore = new Date(now - minAgeMin * 60_000).toISOString();  // inactivo al menos X
  const notOlderThan = new Date(now - maxAgeHours * 3600_000).toISOString(); // pero no muy viejo

  const db = createServiceClient();

  const { data: carts, error } = await db
    .from('carts')
    .select('id, cart_id, customer_name, customer_email, summary')
    .eq('status', 'active')
    .is('recovery_sent_at', null)
    .not('customer_email', 'is', null)
    .lte('updated_at', idleBefore)
    .gte('updated_at', notOlderThan)
    .order('updated_at', { ascending: true })
    .limit(batch);

  if (error) {
    return NextResponse.json({ ok: false, error: 'DB query failed' }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const expiresAt = new Date(now + expiresHours * 3600_000);

  for (const cart of carts ?? []) {
    const email = (cart.customer_email ?? '').trim();
    if (!email) { skipped++; continue; }

    const discount = await createRecoveryDiscount(db, { type, value, expiresAt });
    if (!discount) { skipped++; continue; }

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
    if (!ok) { skipped++; continue; }

    await db
      .from('carts')
      .update({
        recovery_sent_at: new Date().toISOString(),
        recovery_variant: variant,
        recovery_code: discount.code,
      })
      .eq('id', cart.id);
    sent++;
  }

  return NextResponse.json({
    ok: true,
    candidates: carts?.length ?? 0,
    sent,
    skipped,
    checkedAt: new Date().toISOString(),
  });
}
