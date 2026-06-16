import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { buildWompiCheckoutUrl, newWompiReference } from '@/lib/payments/wompi';
import { createServiceClient } from '@/lib/supabase/server';
import { applyDiscountCode, loadPricingConfig, recordDiscountCodeUse } from '@/lib/pricing/server';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
}

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
  const rl = await rateLimitByIp(request, { prefix: 'checkout', max: 20, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;

  // Pricing comes from the admin-managed tables (prices, body_types),
  // with hardcoded fallback only if the DB is unreachable.
  const pricing = await loadPricingConfig();

  // Total in USD, then convert to local currency
  const perPersonUsd = pricing.perPersonUsd[d.bodyType] ?? 25;
  const subtotalPeopleUsd = d.peopleCount * perPersonUsd;
  const discountRate = FAMILY_DISCOUNT(d.peopleCount);
  const afterDiscountUsd = subtotalPeopleUsd * (1 - discountRate);
  const bgUsd = d.background === 'custom'
    ? pricing.backgroundCustomUsd
    : (d.background && d.background !== 'none') ? pricing.backgroundStandardUsd : 0;
  const subtotalUsd = afterDiscountUsd + bgUsd;
  const expressUsd = d.express ? subtotalUsd * pricing.expressSurchargePct : 0;
  const preCodeTotalUsd = subtotalUsd + expressUsd;

  // Admin-managed discount codes (discount_codes table)
  const appliedCode = d.discountCode
    ? await applyDiscountCode(d.discountCode, preCodeTotalUsd)
    : null;
  const totalUsd = preCodeTotalUsd - (appliedCode?.amountUsd ?? 0);
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
      redirectUrl: `${origin}/checkout/success?provider=wompi&ref=${encodeURIComponent(reference)}`,
    });
    if (appliedCode) await recordDiscountCodeUse(appliedCode.code);
    return NextResponse.json({ url });
  }

  // ── Stripe embedded checkout ──────────────────────────────────────────
  // Resolve human-readable names + images so the customer sees exactly
  // what they're buying instead of internal UUIDs.
  let styleName = d.style;
  let styleImage: string | null = null;
  let bgName = d.background === 'custom' ? 'Fondo personalizado' : d.background;
  let bgImage: string | null = null;
  try {
    const supabase = createServiceClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const [styleRes, bgRes] = await Promise.all([
      supabase
        .from('portrait_styles')
        .select('name, example_image_url')
        .eq(isUuid.test(d.style) ? 'id' : 'slug', d.style)
        .maybeSingle(),
      isUuid.test(d.background)
        ? supabase.from('backgrounds').select('name, image_url').eq('id', d.background).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (styleRes.data) {
      styleName = styleRes.data.name;
      styleImage = styleRes.data.example_image_url;
    }
    if (bgRes.data) {
      bgName = bgRes.data.name;
      bgImage = bgRes.data.image_url;
    }
  } catch (err) {
    console.error('[checkout/stripe] failed to resolve names:', err);
  }

  // Stripe needs absolute, public image URLs
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://negasva.shop';
  const absImage = (url: string | null) => {
    if (!url) return undefined;
    const abs = url.startsWith('http') ? url : `${siteUrl}${url}`;
    return abs.startsWith('https://') ? [abs] : undefined;
  };

  const bodyLabel = d.bodyType === 'full_body' ? 'Cuerpo completo' : 'Solo torso';

  // Itemized lines that mirror the order summary in the wizard.
  // Family discount is baked into the per-person price (Stripe allows a
  // single discount per session, reserved for the promo code below).
  const perPersonMinor = Math.round(perPersonUsd * (1 - discountRate) * d.rate * 100);
  const bgMinor = Math.round(bgUsd * d.rate * 100);
  const expressMinor = Math.round(expressUsd * d.rate * 100);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: d.currency,
        product_data: {
          name: `Retrato ${styleName} — ${bodyLabel}`,
          description: discountRate > 0
            ? `${d.peopleCount} personas · Incluye ${Math.round(discountRate * 100)}% dcto. pack familia`
            : `${d.peopleCount} ${d.peopleCount === 1 ? 'persona' : 'personas'}`,
          images: absImage(styleImage),
        },
        unit_amount: perPersonMinor,
      },
      quantity: d.peopleCount,
    },
  ];
  if (bgMinor > 0) {
    lineItems.push({
      price_data: {
        currency: d.currency,
        product_data: {
          name: `Fondo: ${bgName}`,
          description: d.background === 'custom' ? 'Fondo a tu medida, descríbenos tu idea' : `Fondo temático ${styleName}`,
          images: absImage(bgImage),
        },
        unit_amount: bgMinor,
      },
      quantity: 1,
    });
  }
  if (expressMinor > 0) {
    lineItems.push({
      price_data: {
        currency: d.currency,
        product_data: {
          name: '⚡ Entrega exprés 24h',
          description: 'Tu retrato salta la cola y llega en 24 horas',
        },
        unit_amount: expressMinor,
      },
      quantity: 1,
    });
  }

  const stripe = getStripe();

  // Promo code shown as a real Stripe discount row instead of text
  let couponId: string | undefined;
  if (appliedCode) {
    const lineTotal = perPersonMinor * d.peopleCount + bgMinor + expressMinor;
    const amountOff = Math.min(Math.round(appliedCode.amountUsd * d.rate * 100), lineTotal - 50);
    if (amountOff > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: amountOff,
        currency: d.currency,
        duration: 'once',
        name: `Código ${appliedCode.code}`,
      });
      couponId = coupon.id;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (stripe.checkout.sessions.create as any)({
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    line_items: lineItems,
    ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
    payment_method_types: STRIPE_PAYMENT_METHODS[d.currency] ?? ['card'],
    metadata: {
      style: d.style,
      styleName,
      bodyType: d.bodyType,
      background: d.background,
      backgroundName: bgName,
      peopleCount: String(d.peopleCount),
      express: String(d.express),
      discountCode: appliedCode?.code ?? '',
      specialRequests: d.specialRequests.slice(0, 200),
    },
  });

  if (appliedCode) await recordDiscountCodeUse(appliedCode.code);
  return NextResponse.json({ client_secret: session.client_secret });
}
