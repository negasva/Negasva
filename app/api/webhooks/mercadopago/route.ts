import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { rateLimitByIp } from '@/lib/security/apiHelpers';
import { fetchMpPayment, mapMpStatus } from '@/lib/payments/mercadopago';
import { verifyAmount } from '@/lib/payments/verifyAmount';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';
import { notifyNewOrder } from '@/lib/notify/newOrder';

/**
 * Verifica la firma HMAC-SHA256 del webhook (x-signature + x-request-id) con
 * MERCADOPAGO_WEBHOOK_SECRET. Falla cerrado: sin secreto o sin cabeceras, no se
 * confía en el evento. https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifyMpSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = request.headers.get('x-signature');
  const xRequestId = request.headers.get('x-request-id');
  if (!xSignature || !xRequestId) return false;

  // x-signature llega como "ts=1704908010,v1=<hmac hex>".
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=').map((s) => s.trim())),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // MP normaliza el data.id a minúsculas cuando es alfanumérico.
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Webhook de Mercado Pago. Llega solo el id del pago; el estado real se
 * consulta a la API con el access token, lo que a la vez autentica el evento
 * (un id inventado no devuelve un pago con nuestra external_reference).
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'webhook', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  let paymentId = '';
  try {
    const url = new URL(request.url);
    // Formato query (?type=payment&data.id=…) o body JSON ({type, data:{id}}).
    const qsId = url.searchParams.get('data.id') ?? url.searchParams.get('id');
    const body = await request.json().catch(() => null) as { type?: string; action?: string; data?: { id?: string | number } } | null;
    const type = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? body?.type ?? '';
    if (type && type !== 'payment') return NextResponse.json({ received: true });
    paymentId = String(body?.data?.id ?? qsId ?? '');
  } catch { /* cae al 400 de abajo */ }

  if (!paymentId) return NextResponse.json({ error: 'No payment id' }, { status: 400 });

  // Firma HMAC ANTES del re-fetch: rechaza eventos que no vengan de MP.
  if (!verifyMpSignature(request, paymentId)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payment = await fetchMpPayment(paymentId);
  if (!payment?.external_reference) return NextResponse.json({ received: true });

  const newStatus = mapMpStatus(payment.status);

  try {
    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('orders')
      .select('status, discount_code, amount_total, currency, style, body_type, background, people_count, express, cart_id')
      .eq('provider', 'mercadopago')
      .eq('provider_reference', payment.external_reference)
      .maybeSingle();
    const wasPaid = existing?.status === 'paid';

    // Coteja el monto pagado contra el monto autoritativo antes de marcar paid.
    if (newStatus === 'paid' && existing &&
        !verifyAmount(payment.transaction_amount ?? 0, payment.currency_id ?? '', existing)) {
      console.error('amount mismatch', {
        paid: payment.transaction_amount,
        expected: existing.amount_total,
        ref: payment.external_reference,
      });
      return NextResponse.json({ received: true }); // 200 sin marcar paid
    }

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        provider_transaction_id: String(payment.id),
        customer_email: payment.payer?.email ?? null,
      })
      .eq('provider', 'mercadopago')
      .eq('provider_reference', payment.external_reference);

    // Post-proceso aislado: el estado ya quedó confirmado, un fallo aquí no
    // debe deshacerlo ni propagarse. El cupón se acredita solo en la primera
    // transición a pagado.
    if (newStatus === 'paid' && !wasPaid) {
      try {
        // Conversión REAL del carrito: solo al confirmarse el pago.
        if (existing?.cart_id) {
          await supabase.from('carts').update({ status: 'converted' }).eq('cart_id', existing.cart_id);
        }
        if (existing?.discount_code) await recordDiscountCodeUse(existing.discount_code);
        await notifyNewOrder({
          provider: 'mercadopago',
          reference: payment.external_reference,
          amountTotal: existing?.amount_total ?? null,
          currency: existing?.currency ?? null,
          style: existing?.style,
          bodyType: existing?.body_type,
          background: existing?.background,
          peopleCount: existing?.people_count ?? null,
          express: existing?.express ?? null,
          customerEmail: payment.payer?.email ?? null,
        });
      } catch (postErr) {
        console.error('[webhook/mercadopago] post-process failed:', postErr);
      }
    }
  } catch (err) {
    console.error('[webhook/mercadopago] update failed:', err);
  }

  return NextResponse.json({ received: true });
}
