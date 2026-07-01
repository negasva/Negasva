import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';
import { getPodProduct } from '@/lib/pricing/products';
import { listOrderPhotos } from '@/lib/payments/orderPhotos';
import { notifyNewOrder } from '@/lib/notify/newOrder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
}

function rowFromSession(
  session: Stripe.Checkout.Session,
  status: 'paid' | 'pending',
  photoPaths: string[],
) {
  const meta = session.metadata ?? {};
  return {
    provider: 'stripe' as const,
    provider_reference: session.id,
    provider_transaction_id: (session.payment_intent as string) ?? null,
    amount_total: session.amount_total,
    currency: session.currency,
    style: meta.style,
    body_type: meta.bodyType,
    background: meta.background,
    people_count: Number(meta.peopleCount),
    express: meta.express === 'true',
    special_requests: meta.specialRequests ?? null,
    discount_code: meta.discountCode || null,
    upload_id: meta.uploadId || null,
    photo_paths: photoPaths,
    status,
    customer_email: session.customer_details?.email ?? null,
  };
}

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // For card/Link/Apple Pay/etc: payment_status === 'paid' → mark paid.
        // For OXXO/SEPA/ACSS: payment_status === 'unpaid' → wait for async_payment_succeeded.
        const status: 'paid' | 'pending' = session.payment_status === 'paid' ? 'paid' : 'pending';

        // Was this reference already paid? Guards against double-crediting the
        // coupon if Stripe retries the event.
        const { data: existing } = await supabase
          .from('orders')
          .select('status')
          .eq('provider_reference', session.id)
          .maybeSingle();
        const wasPaid = existing?.status === 'paid';

        const photoPaths = await listOrderPhotos(supabase, session.metadata?.uploadId);
        await supabase.from('orders').upsert(rowFromSession(session, status, photoPaths), {
          onConflict: 'provider_reference',
        });

        // On the first transition to paid: credit the coupon and notify.
        // (async OXXO/SEPA flows arrive here as pending and turn paid in
        // async_payment_succeeded; those rarer cases skip the email.)
        const code = session.metadata?.discountCode;
        if (status === 'paid' && !wasPaid) {
          if (code) await recordDiscountCodeUse(code);
          const meta = session.metadata ?? {};
          await notifyNewOrder({
            provider: 'stripe',
            reference: session.id,
            amountTotal: session.amount_total,
            currency: session.currency,
            style: meta.style,
            bodyType: meta.bodyType,
            background: meta.background,
            peopleCount: meta.peopleCount ? Number(meta.peopleCount) : null,
            express: meta.express === 'true',
            products: (meta.products || '')
              .split(',')
              .map((k) => getPodProduct(k.trim())?.name.es)
              .filter(Boolean)
              .join(', ') || null,
            customerEmail: session.customer_details?.email ?? null,
          });
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('provider_reference', session.id);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('provider_reference', session.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('provider_transaction_id', charge.payment_intent as string);
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        if (dispute.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'disputed' })
            .eq('provider_transaction_id', dispute.payment_intent as string);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] ${event.type} handler failed:`, err);
  }

  return NextResponse.json({ received: true });
}
