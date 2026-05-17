'use client';

import { useEffect, useState } from 'react';
import type { Package } from '@/types/admin';

const EMPTY_FORM = { name: '', description: '', final_price: '', active: true };

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function loadPackages() {
    const res = await fetch('/api/admin/packages');
    setPackages(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadPackages(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(pkg: Package) {
    setEditId(pkg.id);
    setForm({ name: pkg.name, description: pkg.description ?? '', final_price: String(pkg.final_price), active: pkg.active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, final_price: parseFloat(form.final_price) };

    if (editId) {
      await fetch('/api/admin/packages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...payload }) });
      showToast('Paquete actualizado');
    } else {
      await fetch('/api/admin/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      showToast('Paquete creado');
    }

    setShowForm(false);
    await loadPackages();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este paquete?')) return;
    await fetch('/api/admin/packages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast('Paquete eliminado');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-secondary mb-1">Paquetes</h1>
          <p className="text-sm text-secondary-lighter">Crea y gestiona los paquetes de productos.</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Nuevo paquete
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-black text-secondary text-base">{editId ? 'Editar paquete' : 'Nuevo paquete'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nombre</label>
              <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pack Pareja" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción</label>
              <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe el paquete..." />
            </div>
            <div>
              <label className={labelCls}>Precio final (USD)</label>
              <input required type="number" min="0" step="0.01" className={inputCls} value={form.final_price} onChange={(e) => setForm({ ...form, final_price: e.target.value })} placeholder="29.99" />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm text-secondary">Activo (visible en el sitio)</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-secondary">{pkg.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pkg.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xl font-black text-primary">${pkg.final_price}</p>
              </div>
              {pkg.description && <p className="text-xs text-secondary-lighter">{pkg.description}</p>}
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                <button onClick={() => openEdit(pkg)} className="flex-1 text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="flex-1 text-xs font-bold text-red-400 hover:text-red-600 border border-gray-100 hover:border-red-200 rounded-lg py-1.5 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <p className="col-span-3 text-center py-10 text-secondary-lighter text-sm">No hay paquetes.</p>
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
