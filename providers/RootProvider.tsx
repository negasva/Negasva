'use client';

import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase/client';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { CurrencyProvider } from '@/lib/currency/CurrencyContext';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </LanguageProvider>
    </SessionContextProvider>
  );
}
