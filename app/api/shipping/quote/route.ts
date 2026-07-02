import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { quoteShippingUsd } from '@/lib/printify';

/**
 * Cotización pública de envío de los productos físicos (vía Printify).
 * Devuelve { available:false } cuando Printify no está configurado — el
 * checkout muestra entonces "envío calculado luego" en vez de un monto.
 */

const Schema = z.object({
  country: z.string().trim().toUpperCase().length(2),
  productUnits: z
    .record(z.string().max(30), z.array(z.record(z.string().max(30), z.string().max(60))).max(20))
    .default({}),
});

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'shipping-quote', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);

  if (!process.env.PRINTIFY_API_TOKEN) {
    return NextResponse.json({ available: false, totalUsd: 0 });
  }

  const quote = await quoteShippingUsd(parsed.data.productUnits, parsed.data.country);
  return NextResponse.json({ available: quote.complete, totalUsd: quote.totalUsd });
}
