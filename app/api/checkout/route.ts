import { NextResponse } from 'next/server';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { newMpReference } from '@/lib/payments/mercadopago';
import { createPayPalOrder, PAYPAL_CURRENCIES, type PayPalItem } from '@/lib/payments/paypal';
import { createServiceClient } from '@/lib/supabase/server';
import { applyDiscountCode, loadPricingConfig } from '@/lib/pricing/server';
import { computeQuoteUsd } from '@/lib/pricing/calc';
import { getPodProduct, productsSummaryEs, optionsSurchargeUsd, optionsLabelEs, sanitizeProductUnits } from '@/lib/pricing/products';
import { CheckoutSchema } from '@/lib/validation/order';
import { verifyRecaptcha } from '@/lib/security/recaptcha';
import { listShippingOptions } from '@/lib/printful';

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
  // First pass without the code to know the base the discount applies to. Los
  // códigos no combinables se calculan sobre la base sin descuento por
  // personas y lo anulan en el quote final.
  const base = computeQuoteUsd(d, pricing, 0);
  const baseNoPromos = computeQuoteUsd(d, pricing, 0, true);
  const appliedCode = d.discountCode
    ? await applyDiscountCode(d.discountCode, base.preCodeTotal, baseNoPromos.preCodeTotal)
    : null;
  const quote = computeQuoteUsd(d, pricing, appliedCode?.amountUsd ?? 0, appliedCode ? !appliedCode.combinable : false);

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

  // Propina opcional: el % se calcula AQUÍ sobre el total del pedido (no se
  // confía en un monto del cliente); la personalizada llega en USD acotada.
  const tipUsd = d.tip?.pct
    ? quote.total * (d.tip.pct / 100)
    : Math.min(Math.max(d.tip?.usd ?? 0, 0), 500);

  const totalLocal = (quote.total + shippingUsd + tipUsd) * d.rate;

  // Note prepended to the order so the illustrator knows which physical
  // products to fulfill via Printful (the finished art is the print file).
  const productsNote = productsSummaryEs(productUnits);
  const notes = [
    d.recording ? 'Incluye video del proceso de dibujo' : '',
    tipUsd > 0 ? `Propina: $${tipUsd.toFixed(2)} USD` : '',
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
        // Contacto del cliente (quién compra y cómo escribirle).
        customer_name: d.customerName,
        customer_email: d.customerEmail,
        customer_phone: d.customerPhone || null,
        // Stored so the webhook can credit the code AFTER payment is approved.
        discount_code: appliedCode?.code ?? null,
        status: 'pending',
      });
      // Best-effort: el carrito que llegó al pago deja de ser "abandonado".
      if (d.cartId) {
        await supabase.from('carts').update({ status: 'converted' }).eq('cart_id', d.cartId);
      }
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

  // ── PayPal (Orders API v2) para monedas internacionales ─────────────────
  const currency = d.currency.toUpperCase();
  if (!PAYPAL_CURRENCIES.has(currency)) {
    return errorResponse(`Currency ${currency} not supported`, 400);
  }

  // Resolve human-readable names so the customer sees exactly what they're
  // buying instead of internal UUIDs.
  let styleName = d.style;
  let bgName = d.background === 'custom' ? 'Fondo personalizado' : d.background;
  try {
    const supabase = createServiceClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const [styleRes, bgRes] = await Promise.all([
      supabase
        .from('portrait_styles')
        .select('name')
        .eq(isUuid.test(d.style) ? 'id' : 'slug', d.style)
        .maybeSingle(),
      isUuid.test(d.background)
        ? supabase.from('backgrounds').select('name').eq('id', d.background).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (styleRes.data) styleName = styleRes.data.name;
    if (bgRes.data) bgName = bgRes.data.name;
  } catch (err) {
    console.error('[checkout/paypal] failed to resolve names:', err);
  }

  const bodyLabel = d.bodyType === 'full_body' ? 'Cuerpo completo' : 'Solo torso';

  // Itemized lines that mirror the order summary in the wizard.
  // Family discount is baked into the per-person price (the promo code goes
  // in amount.breakdown.discount).
  const perPersonMinor = Math.round(perPersonUsd * (1 - discountRate) * d.rate * 100);
  const bgMinor = Math.round(bgUsd * d.rate * 100);
  const expressMinor = Math.round(expressUsd * d.rate * 100);
  const recordingMinor = Math.round(quote.recordingCost * d.rate * 100);
  const shippingMinor = Math.round(shippingUsd * d.rate * 100);

  const items: PayPalItem[] = [
    {
      name: `Retrato ${styleName} — ${bodyLabel}`,
      description: discountRate > 0
        ? `${d.peopleCount} personas · Incluye ${Math.round(discountRate * 100)}% dcto. pack familia`
        : `${d.peopleCount} ${d.peopleCount === 1 ? 'persona' : 'personas'}`,
      unitMinor: perPersonMinor,
      quantity: d.peopleCount,
    },
  ];
  if (bgMinor > 0) {
    items.push({
      name: `Fondo: ${bgName}`,
      description: d.background === 'custom' ? 'Fondo a tu medida, descríbenos tu idea' : `Fondo temático ${styleName}`,
      unitMinor: bgMinor,
      quantity: 1,
    });
  }
  if (expressMinor > 0) {
    items.push({
      name: 'Entrega exprés 24h',
      description: 'Tu retrato salta la cola y llega en 24 horas',
      unitMinor: expressMinor,
      quantity: 1,
    });
  }
  if (recordingMinor > 0) {
    items.push({
      name: 'Video del proceso de dibujo',
      description: 'Grabamos cómo se crea tu retrato, de boceto a color',
      unitMinor: recordingMinor,
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
      items.push({
        name: `${product.name.es} — tu dibujo impreso`,
        description: spec ? `${product.desc.es} · ${spec}` : product.desc.es,
        unitMinor: unit,
        quantity: qty,
      });
    }
  }

  const tipMinor = Math.round(tipUsd * d.rate * 100);
  if (tipMinor > 0) {
    items.push({
      name: 'Propina para el artista',
      description: 'Gracias por apoyar el trabajo hecho a mano',
      unitMinor: tipMinor,
      quantity: 1,
    });
  }

  // Promo code as a real discount row in the PayPal breakdown, capped so the
  // total never drops below the provider minimum.
  const itemTotalMinor = items.reduce((s, i) => s + i.unitMinor * i.quantity, 0);
  let discountMinor = 0;
  if (appliedCode) {
    discountMinor = Math.max(
      0,
      Math.min(Math.round(appliedCode.amountUsd * d.rate * 100), itemTotalMinor + shippingMinor - 50),
    );
  }
  // El monto que se guarda y se cobra es EXACTAMENTE la suma del desglose que
  // ve el cliente en PayPal (mismo criterio que los line items de antes).
  const chargedMinor = itemTotalMinor + shippingMinor - discountMinor;

  // Igual que Mercado Pago: primero se persiste el pedido pendiente con el
  // monto autoritativo y una referencia propia; esa referencia viaja como
  // custom_id/invoice_id de PayPal y es la que el webhook usa para cotejar.
  const reference = newMpReference();
  try {
    const supabase = createServiceClient();
    await supabase.from('orders').insert({
      provider: 'paypal',
      provider_reference: reference,
      amount_total: chargedMinor,
      currency: d.currency,
      style: d.style,
      body_type: d.bodyType,
      background: d.background,
      people_count: d.peopleCount,
      express: d.express,
      special_requests: composedRequests || null,
      photo_paths: d.photoPaths ?? [],
      upload_id: d.uploadId ?? null,
      // Contacto del cliente (quién compra y cómo escribirle).
      customer_name: d.customerName,
      customer_email: d.customerEmail,
      customer_phone: d.customerPhone || null,
      // Stored so the webhook can credit the code AFTER payment is captured.
      discount_code: appliedCode?.code ?? null,
      status: 'pending',
    });
    // Best-effort: el carrito que llegó al pago deja de ser "abandonado".
    if (d.cartId) {
      await supabase.from('carts').update({ status: 'converted' }).eq('cart_id', d.cartId);
    }
  } catch (err) {
    // Sin BD no se puede cotejar el pago con el pedido — se aborta el checkout.
    return errorResponse('Could not create order', 500, err);
  }

  let orderID: string;
  try {
    orderID = await createPayPalOrder({
      reference,
      currency,
      items,
      shippingMinor,
      discountMinor,
    });
  } catch (err) {
    return errorResponse('Could not create PayPal order', 502, err);
  }

  // NOTE: discount usage is recorded by the PayPal webhook on a captured
  // payment, never here — abandoned checkouts must not consume coupon uses.
  return NextResponse.json({ paypal: { orderID, reference } });
}
