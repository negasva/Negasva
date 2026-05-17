'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CAD' | 'COP';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'COP'];

export const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  MXN: '🇲🇽',
  CAD: '🇨🇦',
  COP: '🇨🇴',
};

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  MXN: 'MX$',
  CAD: 'CA$',
  COP: 'COP$',
};

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.15,
  CAD: 1.36,
  COP: 4050,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
  fmt: (usd: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  rates: FALLBACK_RATES,
  fmt: (usd) => `$${usd}`,
  symbol: '$',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);

  useEffect(() => {
    const saved = localStorage.getItem('negasva-currency') as Currency | null;
    if (saved && CURRENCIES.includes(saved)) {
      setCurrencyState(saved);
    } else {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)negasva-geo-currency=([^;]+)/);
      const geo = cookieMatch?.[1] as Currency | undefined;
      if (geo && CURRENCIES.includes(geo)) setCurrencyState(geo);
    }

    fetch('/api/rates')
      .then((r) => r.json())
      .then((data) => setRates((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('negasva-currency', c);
  };

  const fmt = useCallback(
    (usd: number): string => {
      const rate = rates[currency] ?? 1;
      const amount = usd * rate;
      const sym = SYMBOLS[currency];

      if (currency === 'COP') {
        return `${sym}${Math.round(amount).toLocaleString('es-CO')}`;
      }
      if (currency === 'EUR' || currency === 'GBP') {
        const rounded = parseFloat(amount.toFixed(2));
        return `${sym}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)}`;
      }
      return `${sym}${Math.round(amount)}`;
    },
    [currency, rates],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, fmt, symbol: SYMBOLS[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
