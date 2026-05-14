'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/translations';

const LANGS: Lang[] = ['en', 'es', 'fr'];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center">
          <button
            onClick={() => setLang(l)}
            className={`text-xs font-bold transition-colors ${
              lang === l ? 'text-primary' : 'text-secondary-lighter hover:text-secondary'
            }`}
          >
            {l.toUpperCase()}
          </button>
          {i < LANGS.length - 1 && (
            <span className="text-secondary-lighter mx-1 text-xs">·</span>
          )}
        </span>
      ))}
    </div>
  );
}
