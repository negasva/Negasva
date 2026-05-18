'use client';

import { useEffect, useState } from 'react';

interface BodyType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_usd: number;
  original_price_usd: number | null;
  is_best_value: boolean;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM = {
  slug: '',
  name: '',
  description: '',
  price_usd: '',
  original_price_usd: '',
  is_best_value: false,
  is_active: true,
};

export default function BodyTypesPage() {
  const [types, setTypes] = useState<BodyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function load() {
    const res = await fetch('/api/admin/body-types');
    setTypes(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(bt: BodyType) {
    setEditId(bt.id);
    setForm({
      slug: bt.slug,
      name: bt.name,
      description: bt.description ?? '',
      price_usd: String(bt.price_usd),
      original_price_usd: bt.original_price_usd != null ? String(bt.original_price_usd) : '',
      is_best_value: bt.is_best_value,
      is_active: bt.is_active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description || null,
      price_usd: parseFloat(form.price_usd),
      original_price_usd: form.original_price_usd ? parseFloat(form.original_price_usd) : null,
      is_best_value: form.is_best_value,
      is_active: form.is_active,
    };

    if (editId) {
      const res = await fetch('/api/admin/body-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...payload }),
      });
      showToast(res.ok ? 'Tipo actualizado' : 'Error al actualizar');
    } else {
      const res = await fetch('/api/admin/body-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sort_order: types.length + 1 }),
      });
      showToast(res.ok ? 'Tipo creado' : 'Error al crear');
    }

    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function move(bt: BodyType, dir: 'up' | 'down') {
    const sorted = [...types];
    const idx = sorted.findIndex(t => t.id === bt.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    setReordering(bt.id);
    const swap = sorted[swapIdx];

    await Promise.all([
      fetch('/api/admin/body-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bt.id, sort_order: swap.sort_order }),
      }),
      fetch('/api/admin/body-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swap.id, sort_order: bt.sort_order }),
      }),
    ]);

    await load();
    setReordering(null);
  }

  async function handleToggle(bt: BodyType) {
    await fetch('/api/admin/body-types', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bt.id, is_active: !bt.is_active }),
    });
    setTypes(prev => prev.map(t => t.id === bt.id ? { ...t, is_active: !t.is_active } : t));
  }

  async function handleDelete(bt: BodyType) {
    if (!confirm(`Eliminar "${bt.name}"?`)) return;
    await fetch('/api/admin/body-types', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bt.id }),
    });
    setTypes(prev => prev.filter(t => t.id !== bt.id));
    showToast('Tipo eliminado');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Tipos de cuerpo</h1>
          <p className="text-sm text-secondary-lighter">Gestiona las opciones de tipo de cuerpo del studio.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo tipo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5 space-y-4">
          <h2 className="font-black text-secondary text-base">{editId ? 'Editar tipo' : 'Nuevo tipo'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editId && (
              <div>
                <label className={labelCls}>Slug (identificador)</label>
                <input
                  required
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="torso-only"
                  pattern="[a-z0-9-]+"
                />
              </div>
            )}
            <div className={!editId ? '' : 'sm:col-span-2'}>
              <label className={labelCls}>Nombre visible</label>
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Torso Only"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripcion</label>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Busto hasta la cintura"
              />
            </div>
            <div>
              <label className={labelCls}>Precio (USD)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.price_usd}
                onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
                placeholder="25.00"
              />
            </div>
            <div>
              <label className={labelCls}>Precio original (USD, tachado)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.original_price_usd}
                onChange={(e) => setForm({ ...form, original_price_usd: e.target.value })}
                placeholder="Sin precio tachado"
              />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm text-secondary">Activo (visible en el studio)</span>
              </label>
            </div>
            <div>
              <label className={labelCls}>Mejor valor</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_best_value} onChange={(e) => setForm({ ...form, is_best_value: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm text-secondary">Mostrar badge "Best Value"</span>
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
        <div className="space-y-3">
          {types.map((bt, idx) => (
            <div key={bt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => move(bt, 'up')}
                  disabled={idx === 0 || reordering === bt.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-primary-lighter text-secondary-lighter hover:text-primary transition-colors disabled:opacity-30 text-xs font-black"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(bt, 'down')}
                  disabled={idx === types.length - 1 || reordering === bt.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-primary-lighter text-secondary-lighter hover:text-primary transition-colors disabled:opacity-30 text-xs font-black"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-secondary">{bt.name}</p>
                  <code className="text-xs bg-gray-100 text-secondary-lighter px-2 py-0.5 rounded">{bt.slug}</code>
                  {bt.is_best_value && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">Best Value</span>}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bt.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {bt.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {bt.description && <p className="text-xs text-secondary-lighter mt-0.5">{bt.description}</p>}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-black text-primary">${bt.price_usd}</p>
                  {bt.original_price_usd != null && (
                    <p className="text-xs text-secondary-lighter line-through">${bt.original_price_usd}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(bt)} className="text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg px-3 py-1.5 transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleToggle(bt)} className="text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg px-3 py-1.5 transition-colors">
                    {bt.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(bt)} className="text-xs font-bold text-red-400 hover:text-red-600 border border-gray-100 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {types.length === 0 && (
            <p className="text-center py-10 text-secondary-lighter text-sm">No hay tipos. Ejecuta la migracion 010 o crea uno.</p>
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
