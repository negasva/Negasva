import { randomUUID } from 'crypto';

// Mercado Pago Checkout Pro — https://www.mercadopago.com.co/developers/es/docs/checkout-pro
// Se usa la API REST directa (sin SDK) para crear una preferencia de pago y
// redirigir al cliente a `init_point`. El entorno lo determina el token
// (TEST-… vs APP_USR-…).
const MP_API = 'https://api.mercadopago.com';

export type MpPreferenceInput = {
  amountCop: number;        // total en COP (sin centavos)
  reference: string;        // external_reference único por orden
  title: string;
  successUrl: string;
  failureUrl: string;
  notificationUrl: string;  // webhook
};

export function newMpReference(): string {
  return `negasva-${randomUUID().replace(/-/g, '')}`;
}

/** Crea la preferencia de Checkout Pro y devuelve la URL de pago. */
export async function createMpCheckoutUrl(input: MpPreferenceInput): Promise<string> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago env var missing: MERCADOPAGO_ACCESS_TOKEN');

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      // Idempotencia: reintentos de red no crean preferencias duplicadas.
      'X-Idempotency-Key': input.reference,
    },
    body: JSON.stringify({
      items: [
        {
          id: input.reference,
          title: input.title,
          quantity: 1,
          currency_id: 'COP',
          unit_price: input.amountCop,
        },
      ],
      external_reference: input.reference,
      notification_url: input.notificationUrl,
      back_urls: {
        success: input.successUrl,
        pending: input.successUrl,
        failure: input.failureUrl,
      },
      auto_return: 'approved',
      statement_descriptor: 'NEGASVA',
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Mercado Pago preference failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { init_point?: string; sandbox_init_point?: string };
  const url = data.init_point ?? data.sandbox_init_point;
  if (!url) throw new Error('Mercado Pago preference has no init_point');
  return url;
}

// ── Checkout embebido (Payment Brick) ────────────────────────────────────
// A diferencia de Checkout Pro (redirect), el Payment Brick renderiza el
// formulario dentro de negasva.shop y envía los datos tokenizados; aquí se
// crea el pago real con POST /v1/payments. El monto SIEMPRE viene del pedido
// pendiente en la BD, nunca del cliente.
export type MpPaymentBody = {
  transaction_amount: number;
  token?: string;
  payment_method_id: string;
  installments?: number;
  issuer_id?: string;
  payer: Record<string, unknown>;
  // Campos propios que añadimos del lado servidor.
  description: string;
  external_reference: string;
  notification_url: string;
  callback_url?: string;
  additional_info?: Record<string, unknown>;
};

export type MpPaymentResult = {
  id: number;
  status: string;
  statusDetail: string;
  /** URL del banco para PSE (o de reintento): el front redirige allí. */
  redirectUrl?: string;
};

/**
 * Crea un pago real en Mercado Pago a partir de los datos tokenizados del
 * Payment Brick. Devuelve el estado inmediato; el webhook sigue siendo la
 * fuente autoritativa del estado final (PSE confirma de forma asíncrona).
 */
export async function createMpPayment(
  body: MpPaymentBody,
  idempotencyKey: string,
): Promise<MpPaymentResult> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago env var missing: MERCADOPAGO_ACCESS_TOKEN');

  const res = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ statement_descriptor: 'NEGASVA', ...body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mercado Pago payment failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    id: number;
    status: string;
    status_detail?: string;
    transaction_details?: { external_resource_url?: string };
  };
  return {
    id: data.id,
    status: data.status,
    statusDetail: data.status_detail ?? '',
    redirectUrl: data.transaction_details?.external_resource_url || undefined,
  };
}

export type MpPayment = {
  id: number;
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back' | string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
  payer?: { email?: string };
};

/** Consulta un pago por id (los webhooks de MP solo traen el id). */
export async function fetchMpPayment(paymentId: string): Promise<MpPayment | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  const res = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as MpPayment;
}

/** Estado de MP → estado interno de la orden. */
export function mapMpStatus(status: string): string {
  switch (status) {
    case 'approved': return 'paid';
    case 'rejected':
    case 'cancelled': return 'failed';
    case 'refunded':
    case 'charged_back': return 'refunded';
    default: return 'pending';
  }
}
