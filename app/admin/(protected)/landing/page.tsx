'use client';

import { useEffect, useState, useCallback } from 'react';

// Editor del contenido de la landing (tabla landing_config).

interface StepItem { step: number; icon: string; title_es: string; title_en: string; desc_es: string; desc_en: string; }
interface GalleryItem { url: string; caption: string; }
interface StatItem { value: string; label_es: string; label_en: string; }

type HeroValue = Record<string, string>;

const HERO_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'badge_es', label: 'Badge (ES)' },
  { key: 'badge_en', label: 'Badge (EN)' },
  { key: 'headline_es', label: 'Titular (ES)' },
  { key: 'headline_en', label: 'Titular (EN)' },
  { key: 'headline_highlight_es', label: 'Titular destacado (ES)' },
  { key: 'headline_highlight_en', label: 'Titular destacado (EN)' },
  { key: 'subheadline_es', label: 'Subtítulo (ES)' },
  { key: 'subheadline_en', label: 'Subtítulo (EN)' },
  { key: 'cta_primary_es', label: 'CTA principal (ES)' },
  { key: 'cta_primary_en', label: 'CTA principal (EN)' },
  { key: 'cta_secondary_es', label: 'CTA secundario (ES)' },
  { key: 'cta_secondary_en', label: 'CTA secundario (EN)' },
];

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelCls = 'block text-xs font-bold text-gray-500 mb-1';
const saveCls = 'mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-50';
const cardCls = 'bg-white rounded-2xl border-2 border-gray-100 p-6 mb-8';

export default function AdminLandingPage() {
  const [hero, setHero] = useState<HeroValue>({});
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.hero) setHero(data.hero);
        if (data.how_it_works) setSteps(data.how_it_works);
        if (data.gallery_images) setGallery(data.gallery_images);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => setToast({ msg: 'Error cargando configuración', ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (key: string, value: unknown) => {
    setSaving(key);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setToast(res.ok ? { msg: 'Guardado ✓', ok: true } : { msg: 'Error al guardar', ok: false });
    } catch {
      setToast({ msg: 'Error de red', ok: false });
    } finally {
      setSaving('');
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-black text-3xl text-secondary mb-6">Landing Page</h1>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* HERO */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Hero</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {HERO_FIELDS.map((f) => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input
                className={inputCls}
                value={hero[f.key] ?? ''}
                onChange={(e) => setHero({ ...hero, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button className={saveCls} disabled={saving === 'hero'} onClick={() => save('hero', hero)}>
          {saving === 'hero' ? 'Guardando…' : 'Guardar Hero'}
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Paso a paso</h2>
        {steps.map((s, i) => (
          <div key={s.step} className="border-b border-gray-100 pb-4 mb-4 last:border-0">
            <p className="font-bold text-sm text-primary mb-2">Paso {s.step}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Título (ES)</label>
                <input className={inputCls} value={s.title_es} onChange={(e) => setSteps(steps.map((x, j) => j === i ? { ...x, title_es: e.target.value } : x))} />
              </div>
              <div>
                <label className={labelCls}>Título (EN)</label>
                <input className={inputCls} value={s.title_en} onChange={(e) => setSteps(steps.map((x, j) => j === i ? { ...x, title_en: e.target.value } : x))} />
              </div>
              <div>
                <label className={labelCls}>Descripción (ES)</label>
                <input className={inputCls} value={s.desc_es} onChange={(e) => setSteps(steps.map((x, j) => j === i ? { ...x, desc_es: e.target.value } : x))} />
              </div>
              <div>
                <label className={labelCls}>Descripción (EN)</label>
                <input className={inputCls} value={s.desc_en} onChange={(e) => setSteps(steps.map((x, j) => j === i ? { ...x, desc_en: e.target.value } : x))} />
              </div>
            </div>
          </div>
        ))}
        <button className={saveCls} disabled={saving === 'how_it_works'} onClick={() => save('how_it_works', steps)}>
          {saving === 'how_it_works' ? 'Guardando…' : 'Guardar Pasos'}
        </button>
      </section>

      {/* GALLERY */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Galería</h2>
        {gallery.map((g, i) => (
          <div key={i} className="flex gap-2 mb-3 items-end">
            <div className="flex-1">
              <label className={labelCls}>URL imagen</label>
              <input className={inputCls} value={g.url} onChange={(e) => setGallery(gallery.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Caption</label>
              <input className={inputCls} value={g.caption} onChange={(e) => setGallery(gallery.map((x, j) => j === i ? { ...x, caption: e.target.value } : x))} />
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
              onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-primary hover:text-primary mr-3"
          onClick={() => setGallery([...gallery, { url: '', caption: '' }])}
        >
          + Añadir imagen
        </button>
        <button className={saveCls} disabled={saving === 'gallery_images'} onClick={() => save('gallery_images', gallery.filter(g => g.url))}>
          {saving === 'gallery_images' ? 'Guardando…' : 'Guardar Galería'}
        </button>
      </section>

      {/* STATS */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Estadísticas</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="border-2 border-gray-100 rounded-xl p-4 space-y-2">
              <div>
                <label className={labelCls}>Valor</label>
                <input className={inputCls} value={s.value} onChange={(e) => setStats(stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
              </div>
              <div>
                <label className={labelCls}>Etiqueta (ES)</label>
                <input className={inputCls} value={s.label_es} onChange={(e) => setStats(stats.map((x, j) => j === i ? { ...x, label_es: e.target.value } : x))} />
              </div>
              <div>
                <label className={labelCls}>Etiqueta (EN)</label>
                <input className={inputCls} value={s.label_en} onChange={(e) => setStats(stats.map((x, j) => j === i ? { ...x, label_en: e.target.value } : x))} />
              </div>
            </div>
          ))}
        </div>
        <button className={saveCls} disabled={saving === 'stats'} onClick={() => save('stats', stats)}>
          {saving === 'stats' ? 'Guardando…' : 'Guardar Stats'}
        </button>
      </section>
    </div>
  );
}
