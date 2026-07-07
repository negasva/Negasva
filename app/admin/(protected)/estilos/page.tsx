'use client';

import { useEffect, useState, useRef } from 'react';
import { uploadAdminImage } from '@/lib/admin/uploadImage';
import type { DrawingStyle } from '@/types/admin';

const EMPTY_FORM = {
  slug: '',
  landing_slug: '',
  name: '',
  description: '',
  example_image_url: '',
  is_active: false,
  show_in_home: true,
};

export default function EstilosAdminPage() {
  const [styles, setStyles] = useState<DrawingStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function load() {
    const res = await fetch('/api/admin/styles');
    setStyles(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setImageMode('url');
    if (fileRef.current) fileRef.current.value = '';
    setShowForm(true);
  }

  function openEdit(s: DrawingStyle) {
    setEditId(s.id);
    setForm({
      slug: s.slug,
      landing_slug: s.landing_slug ?? '',
      name: s.name,
      description: s.description ?? '',
      example_image_url: s.example_image_url ?? '',
      is_active: s.is_active,
      show_in_home: s.show_in_home,
    });
    setImageMode('url');
    if (fileRef.current) fileRef.current.value = '';
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let imageUrl = form.example_image_url;

    if (imageMode === 'file') {
      const file = fileRef.current?.files?.[0];
      if (file) {
        try {
          imageUrl = await uploadAdminImage(file, 'styles');
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Error al subir imagen');
          setSaving(false);
          return;
        }
      }
    }

    const payload = {
      ...form,
      description: form.description || null,
      example_image_url: imageUrl || null,
      landing_slug: form.landing_slug || null,
    };

    if (editId) {
      const res = await fetch('/api/admin/styles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...payload }),
      });
      showToast(res.ok ? 'Estilo actualizado' : 'Error al actualizar');
    } else {
      const res = await fetch('/api/admin/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showToast(res.ok ? 'Estilo creado' : 'Error al crear');
    }

    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function move(s: DrawingStyle, dir: 'up' | 'down') {
    const idx = styles.findIndex(x => x.id === s.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= styles.length) return;

    setReordering(s.id);
    const swap = styles[swapIdx];
    const myOrder = (s as DrawingStyle & { sort_order?: number }).sort_order ?? idx;
    const swapOrder = (swap as DrawingStyle & { sort_order?: number }).sort_order ?? swapIdx;

    await Promise.all([
      fetch('/api/admin/styles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, sort_order: swapOrder }),
      }),
      fetch('/api/admin/styles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swap.id, sort_order: myOrder }),
      }),
    ]);
    await load();
    setReordering(null);
  }

  async function handleToggle(s: DrawingStyle) {
    await fetch('/api/admin/styles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
    });
    setStyles((prev) => prev.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
  }

  async function handleDelete(s: DrawingStyle) {
    if (!confirm(`Eliminar el estilo "${s.name}"?`)) return;
    await fetch('/api/admin/styles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id }),
    });
    setStyles((prev) => prev.filter((x) => x.id !== s.id));
    showToast('Estilo eliminado');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Estilos de dibujo</h1>
          <p className="text-sm text-secondary-lighter">Gestiona los estilos disponibles en el studio.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo estilo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5 space-y-4">
          <h2 className="font-black text-secondary text-base">{editId ? 'Editar estilo' : 'Nuevo estilo'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editId && (
              <div>
                <label className={labelCls}>Slug (identificador unico)</label>
                <input
                  required
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="rick-morty"
                  pattern="[a-z0-9\-]+"
                  title="Solo letras minusculas, numeros y guiones"
                />
                <p className="text-xs text-secondary-lighter mt-1">Ejemplo: rick-morty, gravity-falls</p>
              </div>
            )}
            <div className={!editId ? '' : 'sm:col-span-2'}>
              <label className={labelCls}>Nombre visible</label>
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cartoon sci-fi"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Slug de la landing SEO (/styles/…)</label>
              <input
                className={inputCls}
                value={form.landing_slug}
                onChange={(e) => setForm({ ...form, landing_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="rick-and-morty-style-portrait"
                pattern="[a-z0-9\-]*"
                title="Solo letras minusculas, numeros y guiones"
              />
              <p className="text-xs text-secondary-lighter mt-1">La URL de la landing. Vacio = se usa el slug.</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripcion</label>
              <textarea
                rows={2}
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripcion del estilo..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Imagen de ejemplo</label>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setImageMode('url')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${imageMode === 'url' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
                  URL o ruta
                </button>
                <button type="button" onClick={() => setImageMode('file')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${imageMode === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-lighter hover:bg-gray-200'}`}>
                  Subir archivo
                </button>
              </div>
              {imageMode === 'url' ? (
                <input
                  className={inputCls}
                  value={form.example_image_url}
                  onChange={(e) => setForm({ ...form, example_image_url: e.target.value })}
                  placeholder="/backgrounds/rm-1.jpg o https://..."
                />
              ) : (
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full text-sm text-secondary-lighter file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-lighter file:text-secondary file:font-bold file:text-xs file:cursor-pointer cursor-pointer"
                />
              )}
              {editId && form.example_image_url && imageMode === 'url' && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.example_image_url} alt={form.name ? `Imagen actual de ${form.name}` : 'Imagen actual del estilo'} loading="lazy" className="w-16 h-10 object-cover rounded border border-gray-100" />
                  <p className="text-xs text-secondary-lighter">Imagen actual</p>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Visibilidad</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-secondary">Disponible en /order (wizard)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={form.show_in_home}
                  onChange={(e) => setForm({ ...form, show_in_home: e.target.checked })}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-secondary">Visible en la home</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-secondary-lighter hover:text-secondary text-sm font-bold px-4 py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {styles.map((style) => (
            <div key={style.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {style.example_image_url && (
                <div className="h-36 bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={style.example_image_url}
                    alt={style.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-secondary">{style.name}</p>
                    <code className="text-xs bg-gray-100 text-secondary-lighter px-2 py-0.5 rounded mt-1 inline-block">{style.slug}</code>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${style.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {style.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {style.description && <p className="text-xs text-secondary-lighter leading-relaxed">{style.description}</p>}
                <div className="mt-auto pt-3 border-t border-gray-50 space-y-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => move(style, 'up')}
                      disabled={styles.indexOf(style) === 0 || reordering === style.id}
                      className="flex-1 text-xs font-black text-secondary-lighter hover:text-primary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(style, 'down')}
                      disabled={styles.indexOf(style) === styles.length - 1 || reordering === style.id}
                      className="flex-1 text-xs font-black text-secondary-lighter hover:text-primary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(style)}
                      className="flex-1 text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggle(style)}
                      className="flex-1 text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors"
                    >
                      {style.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(style)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 border border-gray-100 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {styles.length === 0 && (
            <p className="col-span-3 text-center py-10 text-secondary-lighter text-sm">
              No hay estilos. Ejecuta la migracion 008 o crea uno nuevo.
            </p>
          )}
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

const labelCls = 'block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide';
const inputCls = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white';
