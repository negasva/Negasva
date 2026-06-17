import { NextResponse } from 'next/server';
import { verifyWompiEvent, type WompiEvent } from '@/lib/payments/wompi';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';

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
      .select('status, discount_code')
      .eq('provider', 'wompi')
      .eq('provider_reference', tx.reference)
      .maybeSingle();
    const wasPaid = existing?.status === 'paid';

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        provider_transaction_id: tx.id,
        customer_email: tx.customer_email ?? null,
      })
      .eq('provider', 'wompi')
      .eq('provider_reference', tx.reference);

    if (newStatus === 'paid' && !wasPaid && existing?.discount_code) {
      await recordDiscountCodeUse(existing.discount_code);
    }
  } catch (err) {
    console.error('[webhook/wompi] update failed:', err);
  }

  return NextResponse.json({ received: true });
}
