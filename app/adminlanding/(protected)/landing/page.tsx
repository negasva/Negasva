'use client';

import { useEffect, useState, useCallback } from 'react';

// Editor del footer del sitio (landing_config, clave 'footer').
//
// Nota: la landing (app/page.tsx) es un server component estático — hero,
// pasos, stats y precios viven en el código. De landing_config solo se leen
// 'footer' (components/PageFooter.tsx) y 'site_images' (fotos del hero y de
// los pasos, editables en /admin/imagenes). Los antiguos editores de hero,
// paso a paso, galería y stats se retiraron porque ya no tenían lector
// (ver AUDIT-ADMIN-LANDING.md y CLEANUP.sql).

interface FooterLink { label_es: string; label_en: string; label_fr?: string; href: string; }
interface FooterColumn { title_es: string; title_en: string; title_fr?: string; links: FooterLink[]; }
interface FooterSocial { label: string; url: string; }
interface FooterValue { tagline_es: string; tagline_en: string; tagline_fr?: string; social: FooterSocial[]; columns: FooterColumn[]; }

const EMPTY_FOOTER: FooterValue = { tagline_es: '', tagline_en: '', social: [], columns: [] };

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelCls = 'block text-xs font-bold text-gray-500 mb-1';
const saveCls = 'mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-50';
const cardCls = 'bg-white rounded-2xl border-2 border-gray-100 p-6 mb-8';

export default function AdminLandingPage() {
  const [footer, setFooter] = useState<FooterValue>(EMPTY_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((data) => { if (data.footer) setFooter(data.footer); })
      .catch(() => setToast({ msg: 'Error cargando configuración', ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'footer', value: footer }),
      });
      setToast(res.ok ? { msg: 'Guardado ✓', ok: true } : { msg: 'Error al guardar', ok: false });
    } catch {
      setToast({ msg: 'Error de red', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }, [footer]);

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-black text-3xl text-secondary mb-2">Footer del sitio</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tagline, redes sociales y columnas de enlaces del pie de página. El resto del contenido de la
        landing (hero, pasos, precios) vive en el código; las fotos del hero y de los pasos se cambian
        en <span className="font-bold">/admin/imagenes</span> y las FAQs en su propia sección.
      </p>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Footer</h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelCls}>Tagline (ES)</label>
            <input className={inputCls} value={footer.tagline_es} onChange={(e) => setFooter({ ...footer, tagline_es: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Tagline (EN)</label>
            <input className={inputCls} value={footer.tagline_en} onChange={(e) => setFooter({ ...footer, tagline_en: e.target.value })} />
          </div>
        </div>

        <p className="font-bold text-sm text-primary mb-2">Redes sociales</p>
        {footer.social.map((s, i) => (
          <div key={i} className="flex gap-2 mb-3 items-end">
            <div className="w-40">
              <label className={labelCls}>Nombre</label>
              <input className={inputCls} value={s.label} onChange={(e) => setFooter({ ...footer, social: footer.social.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>URL</label>
              <input className={inputCls} value={s.url} onChange={(e) => setFooter({ ...footer, social: footer.social.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} />
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
              onClick={() => setFooter({ ...footer, social: footer.social.filter((_, j) => j !== i) })}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-primary hover:text-primary mb-6"
          onClick={() => setFooter({ ...footer, social: [...footer.social, { label: '', url: '' }] })}
        >
          + Añadir red social
        </button>

        {footer.columns.map((col, ci) => (
          <div key={ci} className="border-2 border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex gap-2 items-end mb-3">
              <div className="flex-1">
                <label className={labelCls}>Título columna (ES)</label>
                <input className={inputCls} value={col.title_es} onChange={(e) => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, title_es: e.target.value } : x) })} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Título columna (EN)</label>
                <input className={inputCls} value={col.title_en} onChange={(e) => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, title_en: e.target.value } : x) })} />
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
                onClick={() => setFooter({ ...footer, columns: footer.columns.filter((_, j) => j !== ci) })}
              >
                × col
              </button>
            </div>
            {col.links.map((link, li) => (
              <div key={li} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className={labelCls}>Label (ES)</label>
                  <input className={inputCls} value={link.label_es} onChange={(e) => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: x.links.map((l, k) => k === li ? { ...l, label_es: e.target.value } : l) } : x) })} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Label (EN)</label>
                  <input className={inputCls} value={link.label_en} onChange={(e) => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: x.links.map((l, k) => k === li ? { ...l, label_en: e.target.value } : l) } : x) })} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Ruta</label>
                  <input className={inputCls} value={link.href} onChange={(e) => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: x.links.map((l, k) => k === li ? { ...l, href: e.target.value } : l) } : x) })} />
                </div>
                <button
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
                  onClick={() => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: x.links.filter((_, k) => k !== li) } : x) })}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-primary hover:text-primary"
              onClick={() => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: [...x.links, { label_es: '', label_en: '', href: '' }] } : x) })}
            >
              + Añadir link
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-primary hover:text-primary mr-3"
          onClick={() => setFooter({ ...footer, columns: [...footer.columns, { title_es: '', title_en: '', links: [] }] })}
        >
          + Añadir columna
        </button>
        <button className={saveCls} disabled={saving} onClick={save}>
          {saving ? 'Guardando…' : 'Guardar Footer'}
        </button>
      </section>
    </div>
  );
}
