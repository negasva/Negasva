import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = { api: { bodyParser: false } };

type OrderRow = {
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_total: number | null;
  currency: string | null;
  style: string | undefined;
  body_type: string | undefined;
  background: string | undefined;
  people_count: number;
  express: boolean;
  special_requests: string | null;
  status: 'paid' | 'pending';
  customer_email: string | null;
};

function rowFromSession(session: Stripe.Checkout.Session, status: 'paid' | 'pending'): OrderRow {
  const meta = session.metadata ?? {};
  return {
    stripe_session_id: session.id,
    stripe_payment_intent_id: (session.payment_intent as string) ?? null,
    amount_total: session.amount_total,
    currency: session.currency,
    style: meta.style,
    body_type: meta.bodyType,
    background: meta.background,
    people_count: Number(meta.peopleCount),
    express: meta.express === 'true',
    special_requests: meta.specialRequests ?? null,
    status,
    customer_email: session.customer_details?.email ?? null,
  };
}

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

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
        await supabase.from('orders').upsert(rowFromSession(session, status), {
          onConflict: 'stripe_session_id',
        });
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('stripe_session_id', session.id);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', charge.payment_intent as string);
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        if (dispute.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'disputed' })
            .eq('stripe_payment_intent_id', dispute.payment_intent as string);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] ${event.type} handler failed:`, err);
    // Return 200 anyway — log for manual review, don't make Stripe retry forever
  }

  return NextResponse.json({ received: true });
}
