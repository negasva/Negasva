'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Background } from '@/types/admin';

const BUCKET = 'backgrounds';

// Fallback while /api/admin/styles loads — the real list is admin-managed
const DEFAULT_STYLES: { id: string; label: string }[] = [
  { id: 'all',          label: 'Todos'                },
  { id: 'rick-morty',   label: 'Cartoon sci-fi'         },
  { id: 'gravity-falls',label: 'Misterio del bosque'         },
  { id: 'simpsons',     label: 'Familia amarilla clasica'          },
  { id: 'fairly-odd',   label: 'Fantasia brillante' },
  { id: 'negasva',      label: 'NEGASVA'               },
];

type StyleId = string;

const EMPTY_EDIT = { name: '', style: 'rick-morty', urlInput: '', uploadMode: 'url' as 'file' | 'url' };

export default function BackgroundsPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStyle = (searchParams.get('style') ?? 'all') as StyleId;

  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [activeStyle, setActiveStyle] = useState<StyleId>(initialStyle);
  const [STYLES, setStyles] = useState<{ id: string; label: string }[]>(DEFAULT_STYLES);

  useEffect(() => {
    fetch('/api/admin/styles')
      .then((res) => res.json())
      .then((data: Array<{ slug: string; name: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setStyles([{ id: 'all', label: 'Todos' }, ...data.map((s) => ({ id: s.slug, label: s.name }))]);
        }
      })
      .catch(() => {});
  }, []);

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [styleInput, setStyleInput] = useState<string>('rick-morty');
  const [urlInput, setUrlInput] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit form
  const [editBg, setEditBg] = useState<Background | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const loadBackgrounds = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/backgrounds');
    setBackgrounds(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadBackgrounds(); }, [loadBackgrounds]);

  function changeStyle(styleId: StyleId) {
    setActiveStyle(styleId);
    const params = new URLSearchParams(searchParams.toString());
    if (styleId === 'all') {
      params.delete('style');
    } else {
      params.set('style', styleId);
    }
    router.replace(`/admin/backgrounds?${params.toString()}`, { scroll: false });
  }

  const filtered = activeStyle === 'all'
    ? backgrounds
    : backgrounds.filter((bg) => bg.style === activeStyle);

  async function uploadImageFile(file: File, style: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const fileName = `${style}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      showToast(`Error: ${uploadError.message}`);
      return null;
    }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setUploading(true);
    let imageUrl = '';

    if (uploadMode === 'file') {
      const file = fileRef.current?.files?.[0];
      if (!file) { setUploading(false); return; }
      const url = await uploadImageFile(file, styleInput);
      if (!url) { setUploading(false); return; }
      imageUrl = url;
    } else {
      if (!urlInput.trim()) { setUploading(false); return; }
      imageUrl = urlInput.trim();
    }

    const res = await fetch('/api/admin/backgrounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.trim(), image_url: imageUrl, style: styleInput || null }),
    });

    if (res.ok) {
      setNameInput('');
      setUrlInput('');
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      await loadBackgrounds();
      showToast('Fondo añadido');
    } else {
      showToast('Error al guardar');
    }
    setUploading(false);
  }

  function openEdit(bg: Background) {
    setEditBg(bg);
    setEditForm({
      name: bg.name,
      style: bg.style ?? 'rick-morty',
      urlInput: bg.image_url,
      uploadMode: 'url',
    });
    setShowForm(false);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editBg) return;
    setEditSaving(true);

    let imageUrl = editBg.image_url;

    if (editForm.uploadMode === 'file') {
      const file = editFileRef.current?.files?.[0];
      if (file) {
        const url = await uploadImageFile(file, editForm.style);
        if (!url) { setEditSaving(false); return; }
        imageUrl = url;
      }
    } else if (editForm.urlInput.trim()) {
      imageUrl = editForm.urlInput.trim();
    }

    const res = await fetch('/api/admin/backgrounds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editBg.id,
        name: editForm.name.trim(),
        image_url: imageUrl,
        style: editForm.style || null,
      }),
    });

    if (res.ok) {
      setEditBg(null);
      await loadBackgrounds();
      showToast('Fondo actualizado');
    } else {
      showToast('Error al guardar');
    }
    setEditSaving(false);
  }

  async function handleToggle(bg: Background) {
    await fetch('/api/admin/backgrounds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bg.id, active: !bg.active }),
    });
    setBackgrounds((prev) => prev.map((b) => b.id === bg.id ? { ...b, active: !b.active } : b));
  }

  async function handleDelete(bg: Background) {
    if (!confirm('¿Eliminar este fondo?')) return;
    const fileName = bg.image_url.includes('/storage/') ? bg.image_url.split('/').pop() : null;
    if (fileName) {
      const path = `${bg.style ?? ''}/${fileName}`.replace(/^\//, '');
      await supabase.storage.from(BUCKET).remove([path, fileName]);
    }
    await fetch('/api/admin/backgrounds', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bg.id }),
    });
    setBackgrounds((prev) => prev.filter((b) => b.id !== bg.id));
    showToast('Fondo eliminado');
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Fondos</h1>
          <p className="text-sm text-secondary-lighter">Gestiona los fondos por estilo de dibujo.</p>
        </div>
        <button
          onClick={() => { setEditBg(null); setShowForm(!showForm); }}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo fondo
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleUpload} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5">
          <h2 className="font-black text-secondary text-base mb-4">Añadir fondo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Nombre del fondo</label>
              <input required className={inputCls} value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Fondo portal sci-fi" />
            </div>
            <div>
              <label className={labelCls}>Estilo de dibujo</label>
              <select required className={inputCls} value={styleInput} onChange={(e) => setStyleInput(e.target.value)}>
                {STYLES.filter(s => s.id !== 'all').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setUploadMode('file')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${uploadMode === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              Subir archivo
            </button>
            <button type="button" onClick={() => setUploadMode('url')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${uploadMode === 'url' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              URL o ruta
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <label className={labelCls}>Imagen (JPG, PNG, WEBP)</label>
              <input ref={fileRef} required type="file" accept="image/jpeg,image/png,image/webp"
                className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer" />
            </div>
          ) : (
            <div>
              <label className={labelCls}>URL o ruta (/backgrounds/rm-1.jpg)</label>
              <input required className={inputCls} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://... o /backgrounds/rm-1.jpg" />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={uploading} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {uploading ? 'Guardando...' : 'Añadir fondo'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-secondary-lighter hover:text-secondary text-sm font-bold px-4 py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit form */}
      {editBg && (
        <form onSubmit={handleEditSave} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5">
          <h2 className="font-black text-secondary text-base mb-1">Editar fondo</h2>
          <p className="text-xs text-secondary-lighter mb-4">Modificando: <span className="font-bold text-secondary">{editBg.name}</span></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Nombre del fondo</label>
              <input required className={inputCls} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Estilo de dibujo</label>
              <select className={inputCls} value={editForm.style} onChange={(e) => setEditForm({ ...editForm, style: e.target.value })}>
                {STYLES.filter(s => s.id !== 'all').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className={labelCls}>Imagen</label>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setEditForm({ ...editForm, uploadMode: 'url' })} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${editForm.uploadMode === 'url' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              URL o ruta
            </button>
            <button type="button" onClick={() => setEditForm({ ...editForm, uploadMode: 'file' })} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${editForm.uploadMode === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
              Subir nueva imagen
            </button>
          </div>

          {editForm.uploadMode === 'url' ? (
            <input className={inputCls} value={editForm.urlInput} onChange={(e) => setEditForm({ ...editForm, urlInput: e.target.value })} placeholder="https://... o /backgrounds/rm-1.jpg" />
          ) : (
            <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer" />
          )}

          {editBg.image_url && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editBg.image_url} alt={`Imagen actual de ${editBg.name}`} loading="lazy" className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
              <p className="text-xs text-secondary-lighter">Imagen actual</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={editSaving} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {editSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setEditBg(null)} className="text-secondary-lighter hover:text-secondary text-sm font-bold px-4 py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Style tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {STYLES.map((style) => {
          const count = style.id === 'all' ? backgrounds.length : backgrounds.filter(b => b.style === style.id).length;
          return (
            <button
              key={style.id}
              onClick={() => changeStyle(style.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                activeStyle === style.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-secondary-lighter border border-gray-100 hover:border-primary-lighter hover:text-secondary'
              }`}
            >
              {style.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-secondary-lighter text-sm">
              <p>No hay fondos en esta categoria.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-primary font-bold text-sm hover:underline">
                Añadir el primero
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
              {filtered.map((bg) => (
                <div key={bg.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden group transition-colors ${editBg?.id === bg.id ? 'border-primary' : 'border-gray-100'}`}>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bg.image_url}
                      alt={bg.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {bg.style && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {STYLES.find(s => s.id === bg.style)?.label}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggle(bg)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full ${bg.active ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}
                      >
                        {bg.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-secondary truncate">{bg.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {bg.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(bg)} className="text-red-400 hover:text-red-600 text-xs font-bold flex-shrink-0 transition-colors">✕</button>
                    </div>
                    <button
                      onClick={() => openEdit(bg)}
                      className="w-full text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 bg-secondary text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

const labelCls = 'block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide';
const inputCls = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white';
