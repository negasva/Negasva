'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES, type Currency } from '@/lib/currency/CurrencyContext';

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Seleccionar divisa"
 claude/ponytail-caveman-mode-76u40v
        className="flex items-center gap-1.5 min-h-[44px] text-xs font-bold bg-transparent border border-primary-lighter rounded-md pl-2.5 pr-6 py-1.5 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors"

        className="flex min-h-[44px] items-center gap-1.5 text-xs font-bold bg-transparent border border-primary-lighter rounded-md pl-2.5 pr-5 py-1.5 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors"
 main
        style={{ touchAction: 'manipulation' }}
      >
        <span>{currency}</span>
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-secondary-lighter text-[10px]"
      >
        ▼
      </span>

      {open && (
        <ul
          role="listbox"
          aria-label="Divisa"
          className="absolute right-0 mt-1 z-50 min-w-[7rem] rounded-md border border-primary-lighter bg-white shadow-lg py-1"
        >
          {CURRENCIES.map((c) => (
            <li
              key={c}
              role="option"
              aria-selected={c === currency}
              onClick={() => { setCurrency(c); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold cursor-pointer select-none transition-colors ${
                c === currency
                  ? 'bg-primary text-white'
                  : 'text-secondary-lighter hover:bg-primary-lighter'
              }`}
            >
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CurrencySwitcher;
