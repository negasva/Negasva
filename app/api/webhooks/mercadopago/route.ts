import { NextResponse } from 'next/server';
import { fetchMpPayment, mapMpStatus } from '@/lib/payments/mercadopago';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';
import { notifyNewOrder } from '@/lib/notify/newOrder';

/**
 * Webhook de Mercado Pago. Llega solo el id del pago; el estado real se
 * consulta a la API con el access token, lo que a la vez autentica el evento
 * (un id inventado no devuelve un pago con nuestra external_reference).
 */
export async function POST(request: Request) {
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

  const payment = await fetchMpPayment(paymentId);
  if (!payment?.external_reference) return NextResponse.json({ received: true });

  const newStatus = mapMpStatus(payment.status);

  try {
    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('orders')
      .select('status, discount_code, amount_total, currency, style, body_type, background, people_count, express')
      .eq('provider', 'mercadopago')
      .eq('provider_reference', payment.external_reference)
      .maybeSingle();
    const wasPaid = existing?.status === 'paid';

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        provider_transaction_id: String(payment.id),
        customer_email: payment.payer?.email ?? null,
      })
      .eq('provider', 'mercadopago')
      .eq('provider_reference', payment.external_reference);

    // El cupón se acredita solo en la primera transición a pagado.
    if (newStatus === 'paid' && !wasPaid) {
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
    }
  } catch (err) {
    console.error('[webhook/mercadopago] update failed:', err);
  }

  return NextResponse.json({ received: true });
}
