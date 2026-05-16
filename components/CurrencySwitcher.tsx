'use client';

import { useRef, useEffect, useState } from 'react';
import { useCurrency, CURRENCIES, type Currency } from '@/lib/currency/CurrencyContext';

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
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
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold bg-transparent border border-primary-lighter rounded-md px-3 py-1.5 text-secondary-lighter hover:border-primary hover:text-secondary focus:outline-none focus:border-primary cursor-pointer transition-colors text-center"
        aria-label="Currency"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currency}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed top-auto left-auto bg-secondary-light rounded-lg shadow-lg overflow-visible border border-secondary-lighter z-[9999]"
          style={{
            top: buttonRef.current ? (buttonRef.current.getBoundingClientRect().bottom + window.scrollY) + 'px' : 'auto',
            right: buttonRef.current ? (window.innerWidth - buttonRef.current.getBoundingClientRect().right + window.scrollX) + 'px' : 'auto',
            minWidth: '120px'
          }}>
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className="w-full px-4 py-3 text-left text-sm text-accent hover:bg-secondary-lighter transition-colors flex items-center justify-between whitespace-nowrap"
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

export default CurrencySwitcher;
