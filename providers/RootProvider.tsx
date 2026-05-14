'use client';

import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase/client';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionContextProvider>
  );
}
