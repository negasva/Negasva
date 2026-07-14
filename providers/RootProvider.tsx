'use client';

import React from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { CurrencyProvider } from '@/lib/currency/CurrencyContext';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </LanguageProvider>
  );
}
