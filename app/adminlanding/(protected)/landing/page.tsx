'use client';

import { useEffect, useState, useCallback, useRef, DragEvent } from 'react';
import { uploadAdminImage } from '@/lib/admin/uploadImage';
import {
  HOME_TEXT_SECTIONS,
  DEFAULT_HOME_CONTENT,
  mergeHomeContent,
  type HomeContent,
  type HomeStat,
  type HomeStep,
  type HomeTestimonial,
} from '@/lib/content/homeContent';

// Editor de la landing (landing_config, claves 'home_content' y 'footer').
//
// Todo lo que se guarda aquí lo lee la home en el servidor
// (lib/content/homeContent.server.ts) y se regenera al instante vía
// revalidatePath en /api/landing-config. Los precios de la home se editan en
// /admin/prices y /admin/body-types; las fotos del hero/pasos en
// /admin/imagenes; las FAQs en /adminlanding/faqs.

interface FooterLink { label_es: string; label_en: string; label_fr?: string; href: string; }
interface FooterColumn { title_es: string; title_en: string; title_fr?: string; links: FooterLink[]; }
interface FooterSocial { label: string; url: string; }
interface FooterValue { tagline_es: string; tagline_en: string; tagline_fr?: string; social: FooterSocial[]; columns: FooterColumn[]; }

const EMPTY_FOOTER: FooterValue = { tagline_es: '', tagline_en: '', social: [], columns: [] };

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelCls = 'block text-xs font-bold text-gray-500 mb-1';
const saveCls = 'mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-50';
const cardCls = 'bg-white rounded-2xl border-2 border-gray-100 p-6 mb-8';
const addCls = 'px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-primary hover:text-primary';
const delCls = 'px-3 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100';

export default function AdminLandingPage() {
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [footer, setFooter] = useState<FooterValue>(EMPTY_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((data) => {
        setHome(mergeHomeContent(data.home_content));
        if (data.footer) setFooter(data.footer);
      })
      .catch(() => setToast({ msg: 'Error cargando configuración', ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (key: string, value: unknown, savingId: string) => {
    setSaving(savingId);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setToast(res.ok ? { msg: 'Guardado ✓ — visible ya en la web', ok: true } : { msg: 'Error al guardar', ok: false });
    } catch {
      setToast({ msg: 'Error de red', ok: false });
    } finally {
      setSaving('');
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const saveHome = useCallback((savingId: string) => save('home_content', home, savingId), [home, save]);

  const setText = (key: string, value: string) =>
    setHome((h) => ({ ...h, texts: { ...h.texts, [key]: value } }));

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-black text-3xl text-secondary mb-2">Landing Page</h1>
      <p className="text-sm text-gray-500 mb-6">
        Todo el texto de la home. Los cambios se publican al guardar, sin redeploy. Los precios se
        editan en <span className="font-bold">/admin/prices</span> y <span className="font-bold">/admin/body-types</span>;
        las fotos del hero y de los pasos en <span className="font-bold">/admin/imagenes</span>;
        las FAQs en su sección.
      </p>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* TEXTOS POR SECCIÓN */}
      {HOME_TEXT_SECTIONS.map(({ section, fields }) => (
        <section key={section} className={cardCls}>
          <h2 className="font-black text-xl text-secondary mb-4">{section}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.long ? 'sm:col-span-2' : undefined}>
                <label className={labelCls}>{f.label}</label>
                {f.long ? (
                  <textarea
                    className={`${inputCls} min-h-[70px] resize-y`}
                    value={home.texts[f.key] ?? ''}
                    onChange={(e) => setText(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={home.texts[f.key] ?? ''}
                    onChange={(e) => setText(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <button className={saveCls} disabled={saving === section} onClick={() => saveHome(section)}>
            {saving === section ? 'Guardando…' : `Guardar ${section}`}
          </button>
        </section>
      ))}

      {/* STATS DEL HERO */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-1">Hero — estadísticas</h2>
        <p className="text-xs text-gray-500 mb-4">Cifras bajo el titular (1.8M TikTok, etc.).</p>
        {home.stats.map((s: HomeStat, i) => (
          <div key={i} className="flex gap-2 mb-3 items-end">
            <div className="w-36">
              <label className={labelCls}>Valor</label>
              <input className={inputCls} value={s.value} onChange={(e) => setHome({ ...home, stats: home.stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Etiqueta</label>
              <input className={inputCls} value={s.label} onChange={(e) => setHome({ ...home, stats: home.stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
            </div>
            <button className={delCls} onClick={() => setHome({ ...home, stats: home.stats.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
        <button className={`${addCls} mr-3`} onClick={() => setHome({ ...home, stats: [...home.stats, { value: '', label: '' }] })}>+ Añadir</button>
        <button className={saveCls} disabled={saving === 'stats'} onClick={() => saveHome('stats')}>
          {saving === 'stats' ? 'Guardando…' : 'Guardar Estadísticas'}
        </button>
      </section>

      {/* TRUST STRIP */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-1">Hero — franja de confianza</h2>
        <p className="text-xs text-gray-500 mb-4">Los ítems con icono bajo el hero (entrega 48h, revisiones, no-AI).</p>
        {home.trust.map((text, i) => (
          <div key={i} className="flex gap-2 mb-3 items-end">
            <input className={inputCls} value={text} onChange={(e) => setHome({ ...home, trust: home.trust.map((x, j) => j === i ? e.target.value : x) })} />
            <button className={delCls} onClick={() => setHome({ ...home, trust: home.trust.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
        <button className={`${addCls} mr-3`} onClick={() => setHome({ ...home, trust: [...home.trust, ''] })}>+ Añadir</button>
        <button className={saveCls} disabled={saving === 'trust'} onClick={() => saveHome('trust')}>
          {saving === 'trust' ? 'Guardando…' : 'Guardar Franja'}
        </button>
      </section>

      {/* PASOS */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-1">Pasos — tarjetas</h2>
        <p className="text-xs text-gray-500 mb-4">Las tarjetas numeradas de "3 simple steps".</p>
        {home.steps.map((s: HomeStep, i) => (
          <div key={i} className="border-b border-gray-100 pb-4 mb-4 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-primary">Paso {i + 1}</p>
              <button className={delCls} onClick={() => setHome({ ...home, steps: home.steps.filter((_, j) => j !== i) })}>×</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Título</label>
                <input className={inputCls} value={s.title} onChange={(e) => setHome({ ...home, steps: home.steps.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <input className={inputCls} value={s.desc} onChange={(e) => setHome({ ...home, steps: home.steps.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })} />
              </div>
            </div>
          </div>
        ))}
        <button className={`${addCls} mr-3`} onClick={() => setHome({ ...home, steps: [...home.steps, { title: '', desc: '' }] })}>+ Añadir paso</button>
        <button className={saveCls} disabled={saving === 'steps'} onClick={() => saveHome('steps')}>
          {saving === 'steps' ? 'Guardando…' : 'Guardar Pasos'}
        </button>
      </section>

      {/* BULLETS POD */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-1">Productos — bullets</h2>
        <p className="text-xs text-gray-500 mb-4">La lista con checks verdes de la sección de productos.</p>
        {home.pod_bullets.map((text, i) => (
          <div key={i} className="flex gap-2 mb-3 items-end">
            <input className={inputCls} value={text} onChange={(e) => setHome({ ...home, pod_bullets: home.pod_bullets.map((x, j) => j === i ? e.target.value : x) })} />
            <button className={delCls} onClick={() => setHome({ ...home, pod_bullets: home.pod_bullets.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
        <button className={`${addCls} mr-3`} onClick={() => setHome({ ...home, pod_bullets: [...home.pod_bullets, ''] })}>+ Añadir</button>
        <button className={saveCls} disabled={saving === 'pod_bullets'} onClick={() => saveHome('pod_bullets')}>
          {saving === 'pod_bullets' ? 'Guardando…' : 'Guardar Bullets'}
        </button>
      </section>

      {/* TESTIMONIOS */}
      <TestimonialsSection
        testimonials={home.testimonials}
        onChange={(testimonials) => setHome({ ...home, testimonials })}
        saving={saving}
        onSave={() => saveHome('testimonials')}
      />

      {/* FOOTER */}
      <section className={cardCls}>
        <h2 className="font-black text-xl text-secondary mb-4">Footer del sitio</h2>

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
            <button className={delCls} onClick={() => setFooter({ ...footer, social: footer.social.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
        <button
          className={`${addCls} mb-6`}
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
              <button className={delCls} onClick={() => setFooter({ ...footer, columns: footer.columns.filter((_, j) => j !== ci) })}>× col</button>
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
                <button className={delCls} onClick={() => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: x.links.filter((_, k) => k !== li) } : x) })}>×</button>
              </div>
            ))}
            <button
              className={addCls}
              onClick={() => setFooter({ ...footer, columns: footer.columns.map((x, j) => j === ci ? { ...x, links: [...x.links, { label_es: '', label_en: '', href: '' }] } : x) })}
            >
              + Añadir link
            </button>
          </div>
        ))}
        <button
          className={`${addCls} mr-3`}
          onClick={() => setFooter({ ...footer, columns: [...footer.columns, { title_es: '', title_en: '', links: [] }] })}
        >
          + Añadir columna
        </button>
        <button className={saveCls} disabled={saving === 'footer'} onClick={() => save('footer', footer, 'footer')}>
          {saving === 'footer' ? 'Guardando…' : 'Guardar Footer'}
        </button>
      </section>
    </div>
  );
}

function TestimonialsSection({
  testimonials,
  onChange,
  saving,
  onSave,
}: {
  testimonials: HomeTestimonial[];
  onChange: (next: HomeTestimonial[]) => void;
  saving: string;
  onSave: () => void;
}) {
  const dragIdx = useRef<number | null>(null);

  function handleDragStart(e: DragEvent<HTMLDivElement>, i: number) {
    dragIdx.current = i;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, i: number) {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const next = [...testimonials];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    onChange(next);
    dragIdx.current = null;
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  return (
    <section className={cardCls}>
      <h2 className="font-black text-xl text-secondary mb-1">Testimonios</h2>
      <p className="text-xs text-gray-500 mb-4">
        Las reseñas del carrusel. La foto (opcional) es el retrato entregado; sin foto la tarjeta se muestra sin imagen.
        <span className="ml-1 font-semibold text-primary">Arrastra ⠿ para reordenar.</span>
      </p>
      {testimonials.map((r, i) => (
        <div
          key={i}
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDrop={(e) => handleDrop(e, i)}
          onDragOver={handleDragOver}
          className="flex gap-2 items-start"
        >
          <div className="mt-5 cursor-grab active:cursor-grabbing text-gray-400 select-none text-lg leading-none pt-1" title="Arrastrar para reordenar">
            ⠿
          </div>
          <div className="flex-1">
            <TestimonialRow
              item={r}
              onChange={(next) => onChange(testimonials.map((x, j) => j === i ? next : x))}
              onDelete={() => onChange(testimonials.filter((_, j) => j !== i))}
            />
          </div>
        </div>
      ))}
      <button
        className={`${addCls} mr-3`}
        onClick={() => onChange([...testimonials, { name: '', comment: '', photo: null, rating: 5, title: '', visible: true }])}
      >
        + Añadir testimonio
      </button>
      <button className={saveCls} disabled={saving === 'testimonials'} onClick={onSave}>
        {saving === 'testimonials' ? 'Guardando…' : 'Guardar Testimonios'}
      </button>
    </section>
  );
}

function TestimonialRow({
  item, onChange, onDelete,
}: {
  item: HomeTestimonial;
  onChange: (next: HomeTestimonial) => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, 'reviews');
      onChange({ ...item, photo: url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir imagen');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <div className="flex gap-2 items-end mb-2">
        <div className="w-48">
          <label className={labelCls}>Nombre</label>
          <input className={inputCls} value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Título (opcional)</label>
          <input className={inputCls} value={item.title ?? ''} onChange={(e) => onChange({ ...item, title: e.target.value })} />
        </div>
        <div className="w-24">
          <label className={labelCls}>Estrellas</label>
          <select className={inputCls} value={item.rating ?? 5} onChange={(e) => onChange({ ...item, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </select>
        </div>
        <button className={delCls} onClick={onDelete}>×</button>
      </div>
      <div className="mb-2">
        <label className={labelCls}>Comentario</label>
        <input className={inputCls} value={item.comment} onChange={(e) => onChange({ ...item, comment: e.target.value })} />
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-secondary">
          <input
            type="checkbox"
            checked={item.visible !== false}
            onChange={(e) => onChange({ ...item, visible: e.target.checked })}
            className="accent-primary w-4 h-4"
          />
          Visible en la home
        </label>
        {item.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <button
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-secondary hover:bg-gray-200"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Subiendo…' : item.photo ? 'Cambiar foto' : 'Subir foto (opcional)'}
        </button>
        {item.photo && (
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            onClick={() => onChange({ ...item, photo: null })}
          >
            Quitar foto
          </button>
        )}
      </div>
    </div>
  );
}
