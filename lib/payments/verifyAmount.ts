/**
 * Coteja el monto realmente pagado contra el monto autoritativo del pedido
 * (`orders.amount_total`) antes de marcarlo como pagado. Evita que un evento
 * manipulado o mal casado acredite un pedido por menos de lo debido.
 *
 * `paid` y `order.amount_total` deben venir en la MISMA unidad (el llamador
 * normaliza: PayPal value*100, Wompi amount_in_cents/100, etc.). Se admite un
 * 1% de margen por redondeo de tasas de cambio.
 */
export function verifyAmount(
  paid: number,
  currency: string,
  order: { amount_total: number; currency: string },
): boolean {
  if (currency.toLowerCase() !== order.currency.toLowerCase()) return false;
  return paid >= order.amount_total * 0.99;
}
