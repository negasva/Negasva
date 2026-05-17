'use client';

import { useCurrency, CURRENCIES, CURRENCY_FLAGS, type Currency } from '@/lib/currency/CurrencyContext';

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative inline-block">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        aria-label="Currency"
        className="appearance-none text-xs font-bold bg-transparent border border-primary-lighter rounded-md pl-3 pr-7 py-1.5 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors"
        style={{ touchAction: 'manipulation' }}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{CURRENCY_FLAGS[c]} {c}</option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-secondary-lighter text-[10px]"
      >
        ▼
      </span>
    </div>
  );
}

export default CurrencySwitcher;
