'use client';

import { memo } from 'react';
import { useCurrency, CURRENCIES, type Currency } from '@/lib/currency/CurrencyContext';

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      aria-label="Currency"
      className="text-xs font-bold bg-transparent border border-primary-lighter rounded-md px-2 py-1 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors appearance-none text-center"
      style={{ minWidth: '3.5rem' }}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

export default memo(CurrencySwitcher);
