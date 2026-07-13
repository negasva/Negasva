// Tasa de cambio USD→moneda local. SIEMPRE server-side: el cliente nunca manda
// el multiplicador de cobro (ver integridad-precios/BUENAS_PRACTICAS punto 2).
// Cacheada vía el Data Cache de Next (`next: { revalidate }`), así que llamarla
// desde /api/rates y desde /api/checkout comparte la misma respuesta.

const NEEDED = ['EUR', 'GBP', 'MXN', 'CAD', 'COP'] as const;

export const FALLBACK: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.15,
  CAD: 1.36,
  COP: 4050,
};

/** Todas las tasas USD→X. Cae a FALLBACK si la API falla. */
export async function getRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rates: Record<string, number> = { USD: 1 };
    for (const c of NEEDED) rates[c] = data.rates?.[c] ?? FALLBACK[c];
    return rates;
  } catch {
    return FALLBACK;
  }
}

/** Tasa para una moneda ('usd', 'cop'…). Cae a FALLBACK, nunca a 1 salvo USD. */
export async function getServerRate(currency: string): Promise<number> {
  const key = currency.toUpperCase();
  const rates = await getRates();
  return rates[key] ?? FALLBACK[key] ?? 1;
}
