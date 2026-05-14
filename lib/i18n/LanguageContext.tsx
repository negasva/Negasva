'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Lang } from './translations';

type TranslationValues = typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationValues;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    const saved = localStorage.getItem('negasva-lang') as Lang | null;
    if (saved && ['en', 'es', 'fr'].includes(saved)) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('negasva-lang', l); };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as TranslationValues }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
