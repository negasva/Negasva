'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Lang } from './translations';

type TranslationValues = typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationValues;
}

const SUPPORTED: Lang[] = ['en', 'es', 'fr'];
const STORAGE_KEY = 'negasva-lang';

function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (SUPPORTED as string[]).includes(value);
}

// Idioma del navegador limitado a en/es/fr. Si no coincide, undefined.
function detectBrowserLang(): Lang | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of candidates) {
    const code = raw?.slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return undefined;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default 'en' coincide con <html lang="en"> del layout para evitar
  // mismatch de hidratación. El idioma real se resuelve en el efecto.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const resolved: Lang = isLang(saved) ? saved : detectBrowserLang() ?? 'en';
    setLangState(resolved);
  }, []);

  // No tocamos <html lang>: el contenido servido es inglés estático y el
  // atributo debe decir la verdad para que el navegador ofrezca traducir.
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang] as unknown as TranslationValues }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
