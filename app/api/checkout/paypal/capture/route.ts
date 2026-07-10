import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';

/**
 * Captura una orden PayPal aprobada por el comprador (onApprove del JS SDK).
 * El estado autoritativo del pedido lo fija el webhook (PAYMENT.CAPTURE.
 * COMPLETED); aquí solo se ejecuta la captura y se devuelve la referencia
 * para redirigir a /checkout/success.
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'paypal-capture', max: 20, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request) as { orderID?: string } | null;
  const orderID = body?.orderID;
  if (!orderID || typeof orderID !== 'string') return errorResponse('Missing orderID', 400);

  try {
    const result = await capturePayPalOrder(orderID);
    return NextResponse.json({
      status: result.status,
      reference: result.reference,
    });
  } catch (err) {
    return errorResponse('Capture failed', 502, err);
  }
}
