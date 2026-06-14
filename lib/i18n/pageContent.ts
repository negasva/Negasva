'use client';

// Sistema de contenido de páginas editable desde /admin en es/en/fr.
//
// Cada página declara un "diccionario por defecto" (los textos del código) con
// la forma { es: {...}, en: {...}, fr: {...} }. El admin puede sobreescribir
// cualquier campo guardándolo en la tabla `page_content` (vía /api/page-content).
// En el cliente, usePageText() fusiona overrides de BD sobre los defaults y
// devuelve los textos del idioma activo (fallback a los defaults si la BD falla).

import { useEffect, useState } from 'react';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { useLanguage } from './LanguageContext';
import type { Lang } from './translations';

export type PageDict<T extends Record<string, string>> = Record<Lang, T>;

// Overrides guardados en BD: { es?: Partial<T>, en?: ..., fr?: ... }
export type PageOverrides<T extends Record<string, string>> = Partial<Record<Lang, Partial<T>>>;

function mergeLang<T extends Record<string, string>>(
  base: T,
  override: Partial<T> | undefined,
): T {
  if (!override) return base;
  const out = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const v = override[key];
    if (typeof v === 'string' && v.trim() !== '') out[key] = v as T[keyof T];
  }
  return out;
}

// Hook de página pública: devuelve los textos del idioma activo, ya fusionados
// con lo que el admin haya editado en la BD.
export function usePageText<T extends Record<string, string>>(
  page: string,
  defaults: PageDict<T>,
): T {
  const { lang } = useLanguage();
  const [overrides, setOverrides] = useState<PageOverrides<T> | null>(null);

  useEffect(() => {
    let active = true;
    cachedFetchJSON<{ content?: PageOverrides<T> }>(`/api/page-content?page=${encodeURIComponent(page)}`)
      .then((data) => { if (active && data && typeof data === 'object') setOverrides(data.content ?? null); })
      .catch(() => {});
    return () => { active = false; };
  }, [page]);

  return mergeLang(defaults[lang], overrides?.[lang]);
}
