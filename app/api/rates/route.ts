import { NextResponse } from 'next/server';
import { rateLimitByIp } from '@/lib/security/apiHelpers';
import { getRates } from '@/lib/pricing/rates';

export const revalidate = 3600;

export async function GET(request: Request) {
  // Generous limit — response is cached and lightweight, but cap absurd
  // abuse from a single IP (scrapers, broken clients).
  const rl = await rateLimitByIp(request, { prefix: 'rates', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  // Misma fuente que el checkout: la tasa vive en lib/pricing/rates (server-side).
  const rates = await getRates();
  return NextResponse.json(rates, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
}
