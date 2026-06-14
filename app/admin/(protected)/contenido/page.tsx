'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PAGE_REGISTRY } from '@/lib/i18n/pages';
import type { Lang } from '@/lib/i18n/translations';

// Editor del contenido de TODAS las páginas (es/en/fr). Guarda overrides en la
// tabla page_content vía /api/page-content. Lo no editado usa el texto por
// defecto del código.

const LANGS: { code: Lang; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

type AllOverrides = Record<string, Partial<Record<Lang, Record<string, string>>>>;
type Draft = Record<Lang, Record<string, string>>;

const cardCls = 'bg-white rounded-2xl border-2 border-gray-100 p-6';
const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelCls = 'block text-xs font-bold text-gray-500 mb-1';
const saveCls = 'px-6 py-2.5 rounded-lg bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-50';

// Heurística: textos largos -> textarea.
function isLong(v: string) { return v.length > 60; }

export default function AdminContenidoPage() {
  const [overrides, setOverrides] = useState<AllOverrides>({});
  const [activePage, setActivePage] = useState(PAGE_REGISTRY[0].key);
  const [lang, setLang] = useState<Lang>('es');
  const [draft, setDraft] = useState<Draft>({ es: {}, en: {}, fr: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const entry = useMemo(
    () => PAGE_REGISTRY.find((p) => p.key === activePage)!,
    [activePage],
  );

  useEffect(() => {
    fetch('/api/page-content')
      .then((r) => r.json())
      .then((data) => setOverrides(data && typeof data === 'object' ? data : {}))
      .catch(() => setToast({ msg: 'Error cargando contenido', ok: false }))
      .finally(() => setLoading(false));
  }, []);

  // Reconstruye el borrador de la página activa: override || valor por defecto.
  useEffect(() => {
    const ov = overrides[activePage] ?? {};
    const next: Draft = { es: {}, en: {}, fr: {} };
    for (const code of ['es', 'en', 'fr'] as Lang[]) {
      const base = entry.defaults[code];
      const o = ov[code] ?? {};
      for (const key of Object.keys(base)) {
        next[code][key] = o[key] ?? base[key];
      }
    }
    setDraft(next);
  }, [activePage, entry, overrides]);

  const updateField = useCallback((code: Lang, key: string, value: string) => {
    setDraft((d) => ({ ...d, [code]: { ...d[code], [key]: value } }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    // Guardamos solo lo que difiere del valor por defecto (overrides ligeros).
    const content: Partial<Record<Lang, Record<string, string>>> = {};
    for (const code of ['es', 'en', 'fr'] as Lang[]) {
      const base = entry.defaults[code];
      const diff: Record<string, string> = {};
      for (const key of Object.keys(base)) {
        const val = draft[code][key] ?? '';
        if (val !== base[key]) diff[key] = val;
      }
      if (Object.keys(diff).length > 0) content[code] = diff;
    }
    try {
      const res = await fetch('/api/page-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: activePage, content }),
      });
      if (res.ok) {
        setOverrides((o) => ({ ...o, [activePage]: content }));
        setToast({ msg: 'Guardado ✓', ok: true });
      } else {
        setToast({ msg: 'Error al guardar', ok: false });
      }
    } catch {
      setToast({ msg: 'Error de red', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }, [activePage, draft, entry]);

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;

  const fields = Object.keys(entry.defaults.es);

  return (
    <div className="max-w-4xl">
      <h1 className="font-black text-3xl text-secondary mb-2">Contenido de páginas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Edita el texto de cada página en los tres idiomas. Lo que no toques usa el texto por defecto.
      </p>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Selector de página */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PAGE_REGISTRY.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              activePage === p.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pestañas de idioma */}
      <div className="flex gap-1 mb-5 border-b-2 border-gray-100">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-4 py-2 text-sm font-bold -mb-0.5 border-b-2 transition-colors ${
              lang === l.code ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <section className={cardCls}>
        <div className="space-y-4">
          {fields.map((key) => {
            const val = draft[lang][key] ?? '';
            return (
              <div key={key}>
                <label className={labelCls}>{key}</label>
                {isLong(entry.defaults[lang][key] ?? '') || isLong(val) ? (
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={val}
                    onChange={(e) => updateField(lang, key, e.target.value)}
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={val}
                    onChange={(e) => updateField(lang, key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
        <button className={`${saveCls} mt-6`} disabled={saving} onClick={save}>
          {saving ? 'Guardando…' : `Guardar ${entry.label}`}
        </button>
      </section>
    </div>
  );
}
