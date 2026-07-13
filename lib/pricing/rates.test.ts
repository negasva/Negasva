import { describe, it, expect } from 'vitest';
import { FALLBACK } from './rates';
import { CURRENCY } from '@/lib/validation/order';

// Invariante de dinero: toda moneda aceptada en checkout DEBE tener tasa
// server-side. Si faltara, getServerRate caería a 1 y COP se cobraría ~4050x
// más barato. Este test rompe si alguien añade una moneda sin su tasa.
describe('server exchange rate', () => {
  it('has a positive FALLBACK for every accepted currency', () => {
    for (const c of CURRENCY.options) {
      expect(FALLBACK[c.toUpperCase()]).toBeGreaterThan(0);
    }
  });
});
