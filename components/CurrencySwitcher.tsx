'use client';

import { memo, useRef, useEffect, useState } from 'react';
import { useCurrency, CURRENCIES, type Currency } from '@/lib/currency/CurrencyContext';

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (c: Currency) => {
    setCurrency(c);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold bg-transparent border border-primary-lighter rounded-md px-3 py-1.5 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors text-center"
        aria-label="Currency"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currency}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-secondary-light rounded-lg shadow-lg overflow-hidden border border-secondary-lighter z-50">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className="w-full px-4 py-3 text-left text-sm text-accent hover:bg-secondary-lighter transition-colors flex items-center justify-between"
            >
              <span>{c}</span>
              {c === currency && (
                <span className="text-primary font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(CurrencySwitcher);
