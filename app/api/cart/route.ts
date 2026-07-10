import { NextResponse } from 'next/server';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { createServiceClient } from '@/lib/supabase/server';
import { CartSchema } from '@/lib/validation/order';

/**
 * Guardado progresivo del carrito (recuperación de carritos abandonados).
 *
 * El wizard llama aquí (debounced) mientras el cliente avanza. Hacemos UPSERT
 * por `cart_id` (id estable generado en el navegador): una sola fila por
 * carrito que se va actualizando. Es best-effort — nunca cobra nada — así que
 * los fallos no rompen el flujo del cliente; solo devolvemos el estado.
 *
 * Un carrito ya `converted` (llegó al pago) no se vuelve a marcar `active`.
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'cart', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = CartSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }
  const d = parsed.data;

  try {
    const supabase = createServiceClient();
    // No pisar contacto/estado con vacíos: solo mandamos lo que llegó.
    const row: Record<string, unknown> = {
      cart_id: d.cartId,
      step: d.step,
      state: d.state,
      updated_at: new Date().toISOString(),
    };
    if (d.summary !== undefined) row.summary = d.summary;
    if (d.amountUsd !== undefined) row.amount_usd = d.amountUsd;
    if (d.currency !== undefined) row.currency = d.currency;
    if (d.customerName) row.customer_name = d.customerName;
    if (d.customerEmail) row.customer_email = d.customerEmail;
    if (d.customerPhone) row.customer_phone = d.customerPhone;
    if (d.status) row.status = d.status;

    // Solo (re)activa si no está ya convertido: un carrito pagado no vuelve
    // a "activo" por un guardado tardío del navegador.
    const { data: existing } = await supabase
      .from('carts')
      .select('status')
      .eq('cart_id', d.cartId)
      .maybeSingle();

    if (existing?.status === 'converted' && !d.status) {
      return NextResponse.json({ ok: true, status: 'converted' });
    }
    if (!existing && !d.status) row.status = 'active';

    const { error } = await supabase
      .from('carts')
      .upsert(row, { onConflict: 'cart_id' });
    if (error) return errorResponse('Could not save cart', 500, error);
  } catch (err) {
    return errorResponse('Could not save cart', 500, err);
  }

  return NextResponse.json({ ok: true });
}
