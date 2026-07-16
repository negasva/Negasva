import { NextResponse } from 'next/server';
import { rateLimitByIp } from '@/lib/security/apiHelpers';
import { verifyWompiEvent, type WompiEvent } from '@/lib/payments/wompi';
import { verifyAmount } from '@/lib/payments/verifyAmount';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';
import { notifyNewOrder } from '@/lib/notify/newOrder';

// Wompi event → our internal status
function mapStatus(s: WompiEvent['data']['transaction']['status']): string {
  switch (s) {
    case 'APPROVED': return 'paid';
    case 'DECLINED': return 'failed';
    case 'VOIDED': return 'refunded';
    case 'ERROR': return 'failed';
    case 'PENDING': return 'pending';
    default: return 'pending';
  }
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'webhook', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  let payload: WompiEvent;
  try {
    payload = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!verifyWompiEvent(payload)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (payload.event !== 'transaction.updated') {
    return NextResponse.json({ received: true });
  }

  const tx = payload.data.transaction;
  const newStatus = mapStatus(tx.status);

  try {
    const supabase = createServiceClient();

    // Read current state first so we can credit the coupon only on the first
    // transition to paid (Wompi may deliver the event more than once).
    const { data: existing } = await supabase
      .from('orders')
      .select('status, discount_code, amount_total, currency, style, body_type, background, people_count, express, cart_id')
      .eq('provider', 'wompi')
      .eq('provider_reference', tx.reference)
      .maybeSingle();
    const wasPaid = existing?.status === 'paid';

    // Coteja el monto pagado contra el monto autoritativo antes de marcar paid.
    // Wompi expresa el monto en "cents"; COP no tiene decimales, así que /100.
    if (newStatus === 'paid' && existing &&
        !verifyAmount(tx.amount_in_cents / 100, tx.currency, existing)) {
      console.error('amount mismatch', {
        paid: tx.amount_in_cents / 100,
        expected: existing.amount_total,
        ref: tx.reference,
      });
      return NextResponse.json({ received: true }); // 200 sin marcar paid
    }

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        provider_transaction_id: tx.id,
        customer_email: tx.customer_email ?? null,
      })
      .eq('provider', 'wompi')
      .eq('provider_reference', tx.reference);

    // Post-proceso aislado: el estado ya quedó confirmado, un fallo aquí no
    // debe deshacerlo ni propagarse.
    if (newStatus === 'paid' && !wasPaid) {
      try {
        // Conversión REAL del carrito: solo al confirmarse el pago.
        if (existing?.cart_id) {
          await supabase.from('carts').update({ status: 'converted' }).eq('cart_id', existing.cart_id);
        }
        if (existing?.discount_code) await recordDiscountCodeUse(existing.discount_code);
        await notifyNewOrder({
          provider: 'wompi',
          reference: tx.reference,
          amountTotal: existing?.amount_total ?? null,
          currency: existing?.currency ?? null,
          style: existing?.style,
          bodyType: existing?.body_type,
          background: existing?.background,
          peopleCount: existing?.people_count ?? null,
          express: existing?.express ?? null,
          customerEmail: tx.customer_email ?? null,
        });
      } catch (postErr) {
        console.error('[webhook/wompi] post-process failed:', postErr);
      }
    }
  } catch (err) {
    console.error('[webhook/wompi] update failed:', err);
  }

  return NextResponse.json({ received: true });
}
