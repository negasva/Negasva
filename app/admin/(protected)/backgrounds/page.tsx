'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Background } from '@/types/admin';

const BUCKET = 'backgrounds';

export default function BackgroundsPage() {
  const supabase = createClientComponentClient();
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [nameInput, setNameInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function loadBackgrounds() {
    const res = await fetch('/api/admin/backgrounds');
    setBackgrounds(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadBackgrounds(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !nameInput.trim()) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      showToast('Error al subir imagen');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    await fetch('/api/admin/backgrounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.trim(), image_url: urlData.publicUrl }),
    });

    setNameInput('');
    if (fileRef.current) fileRef.current.value = '';
    await loadBackgrounds();
    showToast('Fondo añadido');
    setUploading(false);
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

    const fileName = bg.image_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from(BUCKET).remove([fileName]);
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
      <div className="mb-8">
        <h1 className="text-2xl font-black text-secondary mb-1">Fondos</h1>
        <p className="text-sm text-secondary-lighter">Sube y gestiona los fondos disponibles para los retratos.</p>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-6 mb-8">
        <h2 className="font-black text-secondary text-base mb-4">Subir nuevo fondo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nombre del fondo</label>
            <input
              required
              className={inputCls}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Fondo Montaña"
            />
          </div>
          <div>
            <label className={labelCls}>Imagen (JPG, PNG, WEBP)</label>
            <input
              ref={fileRef}
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
        >
          {uploading ? 'Subiendo...' : 'Subir fondo'}
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {backgrounds.map((bg) => (
            <div key={bg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bg.image_url}
                  alt={bg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggle(bg)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${bg.active ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}
                  >
                    {bg.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-secondary truncate">{bg.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {bg.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <button onClick={() => handleDelete(bg)} className="text-red-400 hover:text-red-600 text-xs font-bold ml-2 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ))}
          {backgrounds.length === 0 && (
            <p className="col-span-4 text-center py-10 text-secondary-lighter text-sm">No hay fondos. Sube el primero.</p>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-secondary text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

const labelCls = 'block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide';
const inputCls = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors';
