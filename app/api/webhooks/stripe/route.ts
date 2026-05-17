import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = { api: { bodyParser: false } };

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    try {
      const supabase = createServiceClient();
      await supabase.from('orders').insert({
        stripe_payment_intent_id: session.payment_intent as string,
        amount_total: session.amount_total,
        currency: session.currency,
        style: meta.style,
        body_type: meta.bodyType,
        background: meta.background,
        people_count: Number(meta.peopleCount),
        express: meta.express === 'true',
        special_requests: meta.specialRequests ?? null,
        status: 'paid',
        customer_email: session.customer_details?.email ?? null,
      });
    } catch (err) {
      console.error('[webhook] failed to insert order:', err);
      // Return 200 so Stripe doesn't retry — log the error for manual review
    }
  }

  return NextResponse.json({ received: true });
}
