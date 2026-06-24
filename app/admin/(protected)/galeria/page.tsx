'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const BUCKET = 'backgrounds';

interface GalleryItem {
  id: string;
  title: string;
  style: string | null;
  image_url: string;
  before_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const labelCls = 'block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide';
const inputCls = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white';

export default function AdminGaleriaPage() {
  const supabase = createClientComponentClient();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const fileRef = useRef<HTMLInputElement>(null);
  const beforeRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/gallery');
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const name = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(name, file, { cacheControl: '3600', upsert: false });
    if (error) { showToast(`Error: ${error.message}`); return null; }
    return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    let imageUrl = '';
    if (mode === 'file') {
      const file = fileRef.current?.files?.[0];
      if (!file) { setSaving(false); return; }
      const url = await uploadFile(file);
      if (!url) { setSaving(false); return; }
      imageUrl = url;
    } else {
      if (!urlInput.trim()) { setSaving(false); return; }
      imageUrl = urlInput.trim();
    }

    // Foto "antes" opcional: si se sube, habilita el slider antes/después.
    let beforeUrl: string | null = null;
    const beforeFile = beforeRef.current?.files?.[0];
    if (beforeFile) {
      const url = await uploadFile(beforeFile);
      if (!url) { setSaving(false); return; }
      beforeUrl = url;
    }

    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), style: style.trim() || null, image_url: imageUrl, before_url: beforeUrl }),
    });

    if (res.ok) {
      setTitle(''); setStyle(''); setUrlInput('');
      if (fileRef.current) fileRef.current.value = '';
      if (beforeRef.current) beforeRef.current.value = '';
      setShowForm(false);
      await load();
      showToast('Obra añadida');
    } else {
      showToast('Error al guardar');
    }
    setSaving(false);
  }

  async function toggle(item: GalleryItem) {
    await fetch('/api/admin/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
  }

  async function remove(item: GalleryItem) {
    if (!confirm('¿Eliminar esta obra?')) return;
    await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    showToast('Obra eliminada');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Galería</h1>
          <p className="text-sm text-secondary-lighter">Portafolio real que se muestra en /galeria.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nueva obra
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Título</label>
              <input required className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Retrato familia Pérez" />
            </div>
            <div>
              <label className={labelCls}>Estilo (opcional)</label>
              <input className={inputCls} value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Rick & Morty" />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setMode('file')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${mode === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              Subir archivo
            </button>
            <button type="button" onClick={() => setMode('url')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${mode === 'url' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              URL o ruta
            </button>
          </div>

          {mode === 'file' ? (
            <input ref={fileRef} required type="file" accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer" />
          ) : (
            <input required className={inputCls} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://... o /samples/after-1.svg" />
          )}

          <div className="mt-4">
            <label className={labelCls}>Foto antes (opcional)</label>
            <p className="text-[11px] text-secondary-lighter mb-1.5">Sube la foto original para activar el slider antes/después en la landing.</p>
            <input ref={beforeRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer" />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'Guardando...' : 'Añadir obra'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-secondary-lighter hover:text-secondary text-sm font-bold px-4 py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">
          <p>No hay obras todavía.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-primary font-bold text-sm hover:underline">
            Añadir la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => toggle(item)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${item.is_active ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}
                  >
                    {item.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                {item.before_url && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow">
                    antes ✓
                  </span>
                )}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-secondary truncate">{item.title}</p>
                  {item.style && <p className="text-[10px] text-primary font-semibold truncate">{item.style}</p>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <button onClick={() => remove(item)} className="text-red-400 hover:text-red-600 text-xs font-bold flex-shrink-0 transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 bg-secondary text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
