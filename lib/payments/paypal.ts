// PayPal Orders API v2 — https://developer.paypal.com/docs/api/orders/v2/
// API REST directa (sin SDK), igual que mercadopago.ts. El entorno lo decide
// PAYPAL_ENV (sandbox|live); sandbox por defecto.

import { fetchWithTimeout } from '@/lib/net';

function apiBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(): Promise<string> {
  const id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('PayPal env vars missing: NEXT_PUBLIC_PAYPAL_CLIENT_ID / PAYPAL_SECRET');
  const res = await fetchWithTimeout(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Todas las 5 monedas internacionales están soportadas por PayPal:
// https://developer.paypal.com/api/rest/reference/currency-codes/
export const PAYPAL_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'MXN', 'CAD']);

export type PayPalItem = {
  name: string;
  description?: string;
  unitMinor: number; // en unidades menores (centavos)
  quantity: number;
};

const money = (currency: string, minor: number) => ({
  currency_code: currency,
  value: (minor / 100).toFixed(2),
});

/**
 * Crea una orden PayPal (intent CAPTURE) con el desglose autoritativo del
 * servidor. `reference` viaja como custom_id/invoice_id para cotejar el
 * webhook con el pedido pendiente en la BD. Devuelve el orderID.
 */
export async function createPayPalOrder(input: {
  reference: string;
  currency: string; // ISO mayúsculas
  items: PayPalItem[];
  shippingMinor: number;
  discountMinor: number;
}): Promise<string> {
  const { reference, currency, items, shippingMinor, discountMinor } = input;
  const itemTotalMinor = items.reduce((s, i) => s + i.unitMinor * i.quantity, 0);
  const totalMinor = itemTotalMinor + shippingMinor - discountMinor;

  const token = await getAccessToken();
  const res = await fetchWithTimeout(`${apiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      // Idempotencia: reintentos de red no crean órdenes duplicadas.
      'PayPal-Request-Id': reference,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: reference,
          invoice_id: reference,
          amount: {
            ...money(currency, totalMinor),
            breakdown: {
              item_total: money(currency, itemTotalMinor),
              ...(shippingMinor > 0 ? { shipping: money(currency, shippingMinor) } : {}),
              ...(discountMinor > 0 ? { discount: money(currency, discountMinor) } : {}),
            },
          },
          items: items.map((i) => ({
            name: i.name.slice(0, 127),
            ...(i.description ? { description: i.description.slice(0, 127) } : {}),
            unit_amount: money(currency, i.unitMinor),
            quantity: String(i.quantity),
          })),
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PayPal order create failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error('PayPal order has no id');
  return data.id;
}

export type PayPalCaptureResult = {
  status: string; // COMPLETED | ...
  reference: string | null; // custom_id
  captureId: string | null;
};

/** Captura una orden aprobada por el comprador. */
export async function capturePayPalOrder(orderID: string): Promise<PayPalCaptureResult> {
  const token = await getAccessToken();
  const res = await fetchWithTimeout(`${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  }, 15_000);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PayPal capture failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    status?: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id?: string; custom_id?: string }> };
    }>;
  };
  const cap = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: data.status ?? '',
    reference: cap?.custom_id ?? null,
    captureId: cap?.id ?? null,
  };
}

/**
 * Verifica la firma de un webhook con la API oficial de PayPal
 * (v1/notifications/verify-webhook-signature). Requiere PAYPAL_WEBHOOK_ID.
 */
export async function verifyPayPalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  try {
    const token = await getAccessToken();
    const res = await fetchWithTimeout(`${apiBase()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}
