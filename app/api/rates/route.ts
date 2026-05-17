import { NextResponse } from 'next/server';
import { rateLimitByIp } from '@/lib/security/apiHelpers';

const NEEDED = ['EUR', 'GBP', 'MXN', 'CAD', 'COP'] as const;

const FALLBACK: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.15,
  CAD: 1.36,
  COP: 4050,
};

export const revalidate = 3600;

export async function GET(request: Request) {
  // Generous limit — response is cached and lightweight, but cap absurd
  // abuse from a single IP (scrapers, broken clients).
  const rl = rateLimitByIp(request, { prefix: 'rates', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rates: Record<string, number> = { USD: 1 };

    for (const c of NEEDED) {
      rates[c] = data.rates?.[c] ?? FALLBACK[c];
    }

    return NextResponse.json(rates, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json(FALLBACK, {
      headers: { 'Cache-Control': 'public, s-maxage=300' },
    });
  }
}
