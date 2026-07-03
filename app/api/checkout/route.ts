import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { newMpReference } from '@/lib/payments/mercadopago';
import { createServiceClient } from '@/lib/supabase/server';
import { applyDiscountCode, loadPricingConfig } from '@/lib/pricing/server';
import { computeQuoteUsd } from '@/lib/pricing/calc';
import { getPodProduct, productsSummaryEs, optionsSurchargeUsd, optionsLabelEs, sanitizeProductUnits } from '@/lib/pricing/products';
import { CheckoutSchema } from '@/lib/validation/order';
import { verifyRecaptcha } from '@/lib/security/recaptcha';
import { listShippingOptions } from '@/lib/printful';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
}

// Google Pay y Apple Pay se ofrecen automáticamente con 'card' en Stripe
// Checkout (según navegador/dispositivo); no requieren tipo aparte.
const STRIPE_PAYMENT_METHODS: Record<string, Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> = {
  usd: ['card', 'link'],
  eur: ['card', 'sepa_debit', 'ideal', 'klarna', 'link'],
  gbp: ['card', 'link'],
  mxn: ['card'],
  cad: ['card', 'acss_debit', 'link'],
};

// PayPal en Stripe hay que activarlo en el dashboard; si la cuenta no lo tiene,
// añadirlo rompería TODOS los checkouts. Por eso va detrás de un flag de env.
const PAYPAL_CURRENCIES = new Set(['usd', 'eur', 'gbp']);
function stripeMethods(currency: string): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const base = STRIPE_PAYMENT_METHODS[currency] ?? ['card'];
  if (process.env.STRIPE_PAYPAL_ENABLED === 'true' && PAYPAL_CURRENCIES.has(currency)) {
    return [...base, 'paypal' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
  }
  return base;
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'checkout', max: 20, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  // Anti-spam: verifica el token reCAPTCHA si llega. Best-effort en checkout —
  // un token presente con score bajo se bloquea, pero un token ausente (adblock,
  // fallo de red) NO bloquea para no perder ventas; el rate-limit cubre el resto.
  const recaptchaToken = (body as { recaptchaToken?: string }).recaptchaToken;
  const human = await verifyRecaptcha(recaptchaToken, { action: 'checkout' });
  if (!human) return errorResponse('Verificación de seguridad fallida', 400);

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;

  // Pricing comes from the admin-managed tables (prices, body_types),
  // with hardcoded fallback only if the DB is unreachable.
  const pricing = await loadPricingConfig();

  // Same math as /api/pricing/quote (single source of truth in lib/pricing/calc).
  // First pass without the code to know the base the discount applies to.
  const base = computeQuoteUsd(d, pricing, 0);
  const appliedCode = d.discountCode
    ? await applyDiscountCode(d.discountCode, base.preCodeTotal)
    : null;
  const quote = computeQuoteUsd(d, pricing, appliedCode?.amountUsd ?? 0);

  const perPersonUsd = quote.perPerson;
  const discountRate = quote.discountRate;
  const bgUsd = quote.bgCost;
  const expressUsd = quote.expressSurcharge;
  // Physical POD add-ons that survived sanitizing/pricing.
  const products = quote.products;
  const productUnits = sanitizeProductUnits(d.productUnits);

  // Envío elegido en el calculador: se re-cotiza con Printful para la misma
  // dirección y se cobra la tarifa REAL de la opción elegida (por id). Si esa
  // opción ya no existe, cae a la más barata disponible. El monto del cliente
  // nunca se usa.
  let shippingUsd = 0;
  let shippingName = '';
  if (products.length > 0 && d.shipping) {
    const { options } = await listShippingOptions(productUnits, {
      country: d.shipping.country,
      state: d.shipping.state,
      city: d.shipping.city,
      zip: d.shipping.zip,
    });
    const opt = options.find((o) => o.id === d.shipping!.rateId) ?? options[0];
    if (opt) {
      shippingUsd = opt.rateUsd;
      shippingName = opt.name;
    }
  }

  const totalLocal = (quote.total + shippingUsd) * d.rate;

  // Note prepended to the order so the illustrator knows which physical
  // products to fulfill via Printful (the finished art is the print file).
  const productsNote = productsSummaryEs(productUnits);
  const notes = [
    d.recording ? 'Incluye video del proceso de dibujo' : '',
    productsNote,
    shippingName
      ? `Envío elegido: ${shippingName} — $${shippingUsd.toFixed(2)} USD (${d.shipping?.country ?? ''})`
      : '',
    d.specialRequests,
  ].filter(Boolean);
  const composedRequests = notes.join('\n');

  // COP has no minor units; round up to nearest 1.000 for clean prices
  const isCop = d.currency === 'cop';
  const amountMinor = isCop
    ? Math.ceil(totalLocal / 1000) * 1000
    : Math.round(totalLocal * 100);

  if (amountMinor < (isCop ? 5000 : 50)) {
    return errorResponse('Amount too small', 400);
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // ── Mercado Pago para Colombia (COP) — checkout embebido (Payment Brick) ──
  // Se persiste el pedido pendiente (con el monto AUTORITATIVO) y se devuelven
  // referencia + monto para inicializar el Brick. El pago real lo crea
  // /api/payments/mercadopago tomando el monto del pedido, nunca del cliente.
  if (isCop) {
    const reference = newMpReference();

    try {
      const supabase = createServiceClient();
      await supabase.from('orders').insert({
        provider: 'mercadopago',
        provider_reference: reference,
        amount_total: amountMinor,
        currency: 'cop',
        style: d.style,
        body_type: d.bodyType,
        background: d.background,
        people_count: d.peopleCount,
        express: d.express,
        special_requests: composedRequests || null,
        photo_paths: d.photoPaths ?? [],
        upload_id: d.uploadId ?? null,
        // Stored so the webhook can credit the code AFTER payment is approved.
        discount_code: appliedCode?.code ?? null,
        status: 'pending',
      });
    } catch (err) {
      // Sin BD no se puede cotejar el pago con el pedido — se aborta el checkout.
      return errorResponse('Could not create order', 500, err);
    }

    // NOTE: el uso del cupón lo registra el webhook de MP al aprobar el pago,
    // nunca aquí — pagos abandonados/rechazados no queman usos.
    return NextResponse.json({
      mp: {
        reference,
        amount: amountMinor,
        description: `Retrato personalizado NEGASVA — ${d.peopleCount} ${d.peopleCount === 1 ? 'persona' : 'personas'}`,
      },
    });
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
  const recordingMinor = Math.round(quote.recordingCost * d.rate * 100);
  const shippingMinor = Math.round(shippingUsd * d.rate * 100);

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
          name: 'Entrega exprés 24h',
          description: 'Tu retrato salta la cola y llega en 24 horas',
        },
        unit_amount: expressMinor,
      },
      quantity: 1,
    });
  }
  if (recordingMinor > 0) {
    lineItems.push({
      price_data: {
        currency: d.currency,
        product_data: {
          name: 'Video del proceso de dibujo',
          description: 'Grabamos cómo se crea tu retrato, de boceto a color',
        },
        unit_amount: recordingMinor,
      },
      quantity: 1,
    });
  }
  // Physical print-on-demand add-ons (mug, t-shirt, pillow, …). Each unit is a
  // line item; identical units (same product + same variant) are grouped with a
  // quantity so the customer sees "x2" instead of duplicate rows.
  for (const [key, unitList] of Object.entries(productUnits)) {
    const product = getPodProduct(key);
    if (!product) continue;
    const grouped = new Map<string, { opts: typeof unitList[number]; qty: number }>();
    for (const opts of unitList) {
      const sig = JSON.stringify(opts ?? {});
      const g = grouped.get(sig);
      if (g) g.qty += 1;
      else grouped.set(sig, { opts, qty: 1 });
    }
    for (const { opts, qty } of grouped.values()) {
      const priceUsd = (pricing.podProductsUsd[key] ?? product.priceUsd) + optionsSurchargeUsd(key, opts);
      const unit = Math.round(priceUsd * d.rate * 100);
      if (unit <= 0) continue;
      const spec = optionsLabelEs(key, opts);
      lineItems.push({
        price_data: {
          currency: d.currency,
          product_data: {
            name: `${product.name.es} — tu dibujo impreso`,
            description: spec ? `${product.desc.es} · ${spec}` : product.desc.es,
          },
          unit_amount: unit,
        },
        quantity: qty,
      });
    }
  }

  // Envío elegido: se cobra como línea propia para que el cliente lo vea
  // desglosado igual que en el resumen del pedido.
  if (shippingMinor > 0) {
    lineItems.push({
      price_data: {
        currency: d.currency,
        product_data: {
          name: `Envío: ${shippingName}`,
          description: 'Envío de tus productos físicos (Printful)',
        },
        unit_amount: shippingMinor,
      },
      quantity: 1,
    });
  }

  const stripe = getStripe();

  // Promo code shown as a real Stripe discount row instead of text
  let productsMinor = 0;
  for (const [key, unitList] of Object.entries(productUnits)) {
    for (const opts of unitList) {
      productsMinor += Math.round(
        ((pricing.podProductsUsd[key] ?? getPodProduct(key)?.priceUsd ?? 0) + optionsSurchargeUsd(key, opts)) * d.rate * 100,
      );
    }
  }

  let couponId: string | undefined;
  if (appliedCode) {
    const lineTotal = perPersonMinor * d.peopleCount + bgMinor + expressMinor + recordingMinor + productsMinor + shippingMinor;
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
    payment_method_types: stripeMethods(d.currency),
    // Con productos físicos pedimos dirección de envío en el propio checkout;
    // el costo de envío se cotiza con Printful al preparar el pedido.
    ...(products.length > 0
      ? { shipping_address_collection: { allowed_countries: ['CO', 'US', 'MX', 'ES', 'FR', 'GB', 'DE', 'IT', 'CA', 'AR', 'CL', 'PE', 'EC'] } }
      : {}),
    metadata: {
      style: d.style,
      styleName,
      bodyType: d.bodyType,
      background: d.background,
      backgroundName: bgName,
      peopleCount: String(d.peopleCount),
      express: String(d.express),
      recording: String(d.recording),
      products: products.join(','),
      shippingRateId: d.shipping?.rateId ?? '',
      shippingName,
      shippingUsd: shippingUsd ? shippingUsd.toFixed(2) : '',
      discountCode: appliedCode?.code ?? '',
      uploadId: d.uploadId ?? '',
      specialRequests: composedRequests.slice(0, 220),
    },
  });

  // NOTE: discount usage is recorded by the Stripe webhook on a paid session,
  // never here — abandoned checkouts must not consume coupon uses.
  return NextResponse.json({ client_secret: session.client_secret });
}
