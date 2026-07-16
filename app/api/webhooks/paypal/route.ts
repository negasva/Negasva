import { NextResponse } from 'next/server';
import { rateLimitByIp } from '@/lib/security/apiHelpers';
import { verifyPayPalWebhook } from '@/lib/payments/paypal';
import { verifyAmount } from '@/lib/payments/verifyAmount';
import { createServiceClient } from '@/lib/supabase/server';
import { recordDiscountCodeUse } from '@/lib/pricing/server';
import { notifyNewOrder } from '@/lib/notify/newOrder';

/**
 * Webhook de PayPal. La firma se verifica con la API oficial
 * (verify-webhook-signature + PAYPAL_WEBHOOK_ID). El pedido pendiente se
 * coteja por custom_id (nuestra provider_reference), igual que Mercado Pago.
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'webhook', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const rawBody = await request.text();

  const valid = await verifyPayPalWebhook(request.headers, rawBody);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  let event: {
    event_type?: string;
    resource?: {
      id?: string;
      custom_id?: string;
      invoice_id?: string;
      amount?: { value?: string; currency_code?: string };
      payer?: { email_address?: string };
      // CUSTOMER.DISPUTE.CREATED trae las transacciones disputadas.
      disputed_transactions?: Array<{ seller_transaction_id?: string; custom_id?: string; invoice_number?: string }>;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const resource = event.resource ?? {};

  try {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const reference = resource.custom_id ?? resource.invoice_id;
        if (!reference) break;

        // ¿Ya estaba pagado? Evita acreditar el cupón dos veces si PayPal
        // reintenta el evento.
        const { data: existing } = await supabase
          .from('orders')
          .select('status, discount_code, amount_total, currency, style, body_type, background, people_count, express, cart_id')
          .eq('provider', 'paypal')
          .eq('provider_reference', reference)
          .maybeSingle();
        const wasPaid = existing?.status === 'paid';

        // Coteja el monto capturado contra el monto autoritativo del pedido.
        // El value de PayPal viene en unidades mayores; amount_total en menores.
        const paid = Number(resource.amount?.value) * 100;
        if (existing && !verifyAmount(paid, resource.amount?.currency_code ?? '', existing)) {
          console.error('amount mismatch', { paid, expected: existing.amount_total, ref: reference });
          break; // responde 200 (sin reintentos) pero NO marca paid
        }

        await supabase
          .from('orders')
          .update({
            status: 'paid',
            provider_transaction_id: resource.id ?? null,
          })
          .eq('provider', 'paypal')
          .eq('provider_reference', reference);

        // Post-proceso aislado: el estado ya quedó confirmado arriba, así que un
        // fallo acreditando el cupón o enviando el email no debe propagarse.
        if (!wasPaid && existing) {
          try {
            // Conversión REAL del carrito: solo al confirmarse el pago.
            if (existing.cart_id) {
              await supabase.from('carts').update({ status: 'converted' }).eq('cart_id', existing.cart_id);
            }
            if (existing.discount_code) await recordDiscountCodeUse(existing.discount_code);
            await notifyNewOrder({
              provider: 'paypal',
              reference,
              amountTotal: existing.amount_total ?? null,
              currency: existing.currency ?? null,
              style: existing.style,
              bodyType: existing.body_type,
              background: existing.background,
              peopleCount: existing.people_count ?? null,
              express: existing.express ?? null,
              customerEmail: resource.payer?.email_address ?? null,
            });
          } catch (postErr) {
            console.error('[webhook/paypal] post-process failed:', postErr);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        const reference = resource.custom_id ?? resource.invoice_id;
        if (!reference) break;
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('provider', 'paypal')
          .eq('provider_reference', reference);
        break;
      }

      case 'CUSTOMER.DISPUTE.CREATED': {
        // La disputa referencia el capture id (provider_transaction_id).
        for (const tx of resource.disputed_transactions ?? []) {
          if (tx.seller_transaction_id) {
            await supabase
              .from('orders')
              .update({ status: 'disputed' })
              .eq('provider', 'paypal')
              .eq('provider_transaction_id', tx.seller_transaction_id);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook/paypal] ${event.event_type} handler failed:`, err);
  }

  return NextResponse.json({ received: true });
}
