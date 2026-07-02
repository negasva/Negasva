import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { listShippingOptions } from '@/lib/printful';

/**
 * Opciones de envío públicas para una dirección completa (vía Printful).
 * A diferencia de /api/shipping/quote (que devuelve solo la más barata para
 * el estimado del resumen), este endpoint devuelve TODAS las opciones
 * (STANDARD, EXPRESS…) para que el cliente elija en el calculador del carrito.
 * Devuelve { available:false, options:[] } cuando Printful no está configurado
 * o no hay productos mapeados.
 */

const Schema = z.object({
  country: z.string().trim().toUpperCase().length(2),
  state: z.string().trim().max(40).optional(),
  city: z.string().trim().max(80).optional(),
  zip: z.string().trim().max(16).optional(),
  productUnits: z
    .record(z.string().max(30), z.array(z.record(z.string().max(30), z.string().max(60))).max(20))
    .default({}),
});

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'shipping-options', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  if (!process.env.PRINTFUL_API_TOKEN) {
    return NextResponse.json({ available: false, complete: false, options: [] });
  }

  const { country, state, city, zip, productUnits } = parsed.data;
  const { options, complete } = await listShippingOptions(productUnits, { country, state, city, zip });
  return NextResponse.json({ available: options.length > 0, complete, options });
}
