import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { createMpPayment } from '@/lib/payments/mercadopago';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * Procesa un pago de Mercado Pago desde el Payment Brick embebido en
 * negasva.shop (tarjeta o PSE). El navegador envía los datos ya tokenizados
 * (`formData`) más la referencia del pedido; el servidor NUNCA confía en el
 * monto del cliente: lo toma del pedido pendiente guardado en la BD.
 *
 * El estado definitivo lo fija el webhook (/api/webhooks/mercadopago). Aquí
 * solo se crea el pago y se devuelve el estado inmediato para dirigir la UI
 * (aprobado → éxito, PSE → redirección al banco, rechazado → error).
 */

// El Brick arma `formData` con la forma que espera /v1/payments. Se valida de
// forma permisiva (MP añade/omite campos según el método) y el servidor pisa
// transaction_amount con el monto autoritativo.
const FormDataSchema = z.object({
  token: z.string().max(120).optional(),
  payment_method_id: z.string().min(1).max(60),
  issuer_id: z.union([z.string(), z.number()]).optional(),
  installments: z.number().int().min(1).max(48).optional(),
  payer: z.record(z.unknown()).default({}),
  additional_info: z.record(z.unknown()).optional(),
}).passthrough();

const Schema = z.object({
  reference: z.string().trim().min(6).max(80),
  formData: FormDataSchema,
});

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'mp-pay', max: 15, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  const { reference, formData } = parsed.data;

  // Monto autoritativo desde el pedido pendiente creado por /api/checkout.
  let amount = 0;
  try {
    const supabase = createServiceClient();
    const { data: order } = await supabase
      .from('orders')
      .select('amount_total, currency, status')
      .eq('provider', 'mercadopago')
      .eq('provider_reference', reference)
      .maybeSingle();
    if (!order || order.currency !== 'cop') return errorResponse('Order not found', 404);
    if (order.status === 'paid') return errorResponse('Order already paid', 409);
    amount = Number(order.amount_total);
  } catch (err) {
    return errorResponse('Could not load order', 500, err);
  }
  if (!Number.isFinite(amount) || amount <= 0) return errorResponse('Invalid order amount', 400);

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://negasva.shop';
  const successUrl = `${origin}/checkout/success?provider=mercadopago&ref=${encodeURIComponent(reference)}`;

  const { token, payment_method_id, issuer_id, installments, payer, additional_info } = formData;

  // PSE requiere la IP del pagador en additional_info; el Brick no la incluye.
  const clientIp = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const mergedInfo = {
    ...(additional_info ?? {}),
    ...(clientIp ? { ip_address: clientIp } : {}),
  };

  try {
    const result = await createMpPayment(
      {
        transaction_amount: amount,
        ...(token ? { token } : {}),
        payment_method_id,
        ...(installments ? { installments } : {}),
        ...(issuer_id != null ? { issuer_id: String(issuer_id) } : {}),
        payer: payer as Record<string, unknown>,
        ...(Object.keys(mergedInfo).length ? { additional_info: mergedInfo } : {}),
        description: `Retrato personalizado NEGASVA — ${reference}`,
        external_reference: reference,
        notification_url: `${origin}/api/webhooks/mercadopago`,
        // PSE redirige al banco y vuelve aquí al terminar.
        callback_url: successUrl,
      },
      // Clave de idempotencia única por intento (reintentos con otra tarjeta
      // deben crear un pago nuevo, no reutilizar la respuesta anterior).
      randomUUID(),
    );

    return NextResponse.json({
      status: result.status,
      statusDetail: result.statusDetail,
      redirectUrl: result.redirectUrl,
      ref: reference,
    });
  } catch (err) {
    return errorResponse('Payment could not be processed', 502, err);
  }
}
