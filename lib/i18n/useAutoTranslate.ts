'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

// Traduce automáticamente un conjunto de textos en español al idioma activo.
// Mientras carga (o si falla) devuelve el español, así que nunca queda vacío.

// Caché en memoria por idioma+texto para no repetir peticiones entre montajes.
const memoryCache = new Map<string, string>(); // `${lang}:${text}` -> traducción

function cacheKey(lang: string, text: string) { return `${lang}:${text}`; }

export function useAutoTranslate(texts: string[]): { translated: string[]; loading: boolean } {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<string[]>(texts);
  const [loading, setLoading] = useState(false);

  // Clave estable de dependencia.
  const key = `${lang}|${texts.join('')}`;

  useEffect(() => {
    if (lang === 'es' || texts.length === 0) {
      setTranslated(texts);
      return;
    }

    // Sirve de inmediato lo que ya esté cacheado; pide solo lo que falte.
    const fromCache = texts.map((t) => memoryCache.get(cacheKey(lang, t)));
    if (fromCache.every((v) => v !== undefined)) {
      setTranslated(fromCache as string[]);
      return;
    }
    // Pinta español + lo cacheado mientras llega el resto.
    setTranslated(texts.map((t, i) => fromCache[i] ?? t));

    let active = true;
    setLoading(true);
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target: lang }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { translations?: string[] } | null) => {
        if (!active) return;
        const out = data?.translations;
        if (Array.isArray(out) && out.length === texts.length) {
          out.forEach((tr, i) => { if (tr) memoryCache.set(cacheKey(lang, texts[i]), tr); });
          setTranslated(out);
        }
      })
      .catch(() => { /* mantiene español */ })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { translated, loading };
}
