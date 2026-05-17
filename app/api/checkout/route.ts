import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { buildWompiCheckoutUrl, newWompiReference } from '@/lib/payments/wompi';
import { createServiceClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' as any });

const FAMILY_DISCOUNT = (n: number) => (n >= 5 ? 0.25 : n >= 3 ? 0.15 : 0);

const CheckoutSchema = z.object({
  style: z.string().min(1).max(60),
  bodyType: z.enum(['torso_only', 'full_body']),
  background: z.string().max(60).default('none'),
  peopleCount: z.number().int().min(1).max(8),
  express: z.boolean().default(false),
  specialRequests: z.string().max(500).default(''),
  currency: z.enum(['usd', 'eur', 'gbp', 'mxn', 'cad', 'cop']),
  discountCode: z.string().max(40).optional(),
  // exchange rate from client (used only for display; charge is always in stated currency)
  rate: z.number().positive().finite().max(10_000),
});

const STRIPE_PAYMENT_METHODS: Record<string, Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> = {
  usd: ['card', 'link'],
  eur: ['card', 'sepa_debit', 'ideal', 'klarna', 'link'],
  gbp: ['card', 'link'],
  mxn: ['card'],
  cad: ['card', 'acss_debit', 'link'],
};

export async function POST(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'checkout', max: 20, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;

  // Total in USD, then convert to local currency
  const perPersonUsd = d.bodyType === 'full_body' ? 29.99 : 25;
  const subtotalPeopleUsd = d.peopleCount * perPersonUsd;
  const discountRate = FAMILY_DISCOUNT(d.peopleCount);
  const afterDiscountUsd = subtotalPeopleUsd * (1 - discountRate);
  const bgUsd = d.background === 'custom' ? 25 : (d.background && d.background !== 'none') ? 15 : 0;
  const subtotalUsd = afterDiscountUsd + bgUsd;
  const expressUsd = d.express ? subtotalUsd * 0.3 : 0;
  const totalUsd = subtotalUsd + expressUsd;
  const totalLocal = totalUsd * d.rate;

  // COP has no minor units; round up to nearest 1.000 for clean prices
  const isCop = d.currency === 'cop';
  const amountMinor = isCop
    ? Math.ceil(totalLocal / 1000) * 1000
    : Math.round(totalLocal * 100);

  if (amountMinor < (isCop ? 5000 : 50)) {
    return errorResponse('Amount too small', 400);
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // ── Wompi for Colombia (COP) ───────────────────────────────────────────
  if (isCop) {
    const reference = newWompiReference();

    // Persist a pending order so the webhook can find it by reference
    try {
      const supabase = createServiceClient();
      await supabase.from('orders').insert({
        provider: 'wompi',
        provider_reference: reference,
        amount_total: amountMinor,
        currency: 'cop',
        style: d.style,
        body_type: d.bodyType,
        background: d.background,
        people_count: d.peopleCount,
        express: d.express,
        special_requests: d.specialRequests || null,
        status: 'pending',
      });
    } catch (err) {
      console.error('[checkout/wompi] failed to pre-insert order:', err);
    }

    const url = buildWompiCheckoutUrl({
      amountInCents: amountMinor,
      reference,
      redirectUrl: `${origin}/checkout/success?provider=wompi`,
    });
    return NextResponse.json({ url });
  }

  // ── Stripe for everyone else ──────────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: d.currency,
        product_data: {
          name: `NEGASVA Portrait — ${d.style}`,
          description: [
            `${d.bodyType === 'full_body' ? 'Full Body' : 'Torso Only'} × ${d.peopleCount}`,
            d.background !== 'none' ? `Background: ${d.background}` : null,
            d.express ? 'Express 24h delivery' : null,
            d.specialRequests ? `Notes: ${d.specialRequests.slice(0, 80)}` : null,
          ].filter(Boolean).join(' · '),
        },
        unit_amount: amountMinor,
      },
      quantity: 1,
    }],
    payment_method_types: STRIPE_PAYMENT_METHODS[d.currency] ?? ['card'],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/studio`,
    metadata: {
      style: d.style,
      bodyType: d.bodyType,
      background: d.background,
      peopleCount: String(d.peopleCount),
      express: String(d.express),
      specialRequests: d.specialRequests.slice(0, 200),
    },
  });

  return NextResponse.json({ url: session.url });
}
