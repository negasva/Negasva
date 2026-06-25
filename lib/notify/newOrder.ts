// External notification on a new paid order, via the Resend REST API (no SDK —
// a single fetch). No-op when the env vars are unset, and never throws, so a
// notification failure can't break the payment webhook.
//
// Env: RESEND_API_KEY, RESEND_FROM (verified sender), ADMIN_NOTIFY_EMAIL.

interface NewOrderInfo {
  provider: string;
  reference: string | null;
  amountTotal: number | null;
  currency: string | null;
  style?: string | null;
  bodyType?: string | null;
  background?: string | null;
  peopleCount?: number | null;
  express?: boolean | null;
  customerEmail?: string | null;
}

function money(amount: number | null, currency: string | null): string {
  if (amount == null) return '—';
  const cur = (currency ?? 'usd').toUpperCase();
  // COP is stored without minor units; everything else is in cents.
  const value = cur === 'COP' ? amount : amount / 100;
  try {
    return new Intl.NumberFormat('es', { style: 'currency', currency: cur }).format(value);
  } catch {
    return `${value} ${cur}`;
  }
}

export async function notifyNewOrder(o: NewOrderInfo): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!key || !from || !to) return;

  const rows: [string, string | null | undefined][] = [
    ['Total', money(o.amountTotal, o.currency)],
    ['Estilo', o.style],
    ['Tipo', o.bodyType],
    ['Fondo', o.background],
    ['Personas', o.peopleCount != null ? String(o.peopleCount) : null],
    ['Exprés (24h)', o.express ? 'Sí' : 'No'],
    ['Email cliente', o.customerEmail],
    ['Proveedor', o.provider],
    ['Referencia', o.reference],
  ];
  const html =
    '<h2>Nuevo pedido pagado</h2><ul>' +
    rows.filter(([, v]) => v).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('') +
    '</ul>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: `Nuevo pedido pagado · ${money(o.amountTotal, o.currency)}`,
        html,
      }),
    });
  } catch (err) {
    console.error('[notify] new-order email failed:', err);
  }
}
