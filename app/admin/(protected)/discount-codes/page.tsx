'use client';

import { useEffect, useState } from 'react';
import type { DiscountCode } from '@/types/admin';

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  expires_at: '',
  max_uses: '',
  active: true,
};

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function loadCodes() {
    const res = await fetch('/api/admin/discount-codes');
    const data = await res.json();
    setCodes(data);
    setLoading(false);
  }

  useEffect(() => { loadCodes(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/discount-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        expires_at: form.expires_at || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        active: form.active,
      }),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadCodes();
      showToast('Código creado');
    } else {
      showToast('Error al crear');
    }
    setSaving(false);
  }

  async function handleToggle(code: DiscountCode) {
    await fetch('/api/admin/discount-codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: code.id, active: !code.active }),
    });
    setCodes((prev) => prev.map((c) => c.id === code.id ? { ...c, active: !c.active } : c));
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este código?')) return;
    await fetch('/api/admin/discount-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCodes((prev) => prev.filter((c) => c.id !== id));
    showToast('Código eliminado');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-1">Códigos de descuento</h1>
          <p className="text-sm text-secondary-lighter">Gestiona los cupones aplicables al checkout.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1"
        >
          <span>+</span>
          <span className="hidden sm:inline">Nuevo código</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5 space-y-4">
          <h2 className="font-black text-secondary text-base">Nuevo código</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Código">
              <input required className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="BIENVENIDO20" />
            </Field>
            <Field label="Tipo">
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Fijo (USD)</option>
              </select>
            </Field>
            <Field label="Valor">
              <input required type="number" min="0" step="0.01" className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? '20' : '5.00'} />
            </Field>
            <Field label="Máximo de usos (opcional)">
              <input type="number" min="1" className={inputCls} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Sin límite" />
            </Field>
            <Field label="Expira el (opcional)">
              <input type="datetime-local" className={inputCls} value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </Field>
            <Field label="Estado">
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm text-secondary">Activo</span>
              </label>
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear'}
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
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Código</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Tipo / Valor</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Usos</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Expira</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <code className="text-xs bg-primary-lighter text-secondary px-2 py-0.5 rounded font-bold">{code.code}</code>
                    </td>
                    <td className="px-5 py-4 text-secondary">
                      {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                    </td>
                    <td className="px-5 py-4 text-secondary-lighter">
                      {code.current_uses}{code.max_uses ? ` / ${code.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-4 text-secondary-lighter text-xs">
                      {code.expires_at ? new Date(code.expires_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(code)} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${code.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {code.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(code.id)} className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-secondary-lighter text-sm">No hay códigos de descuento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {codes.length === 0 ? (
              <p className="text-center py-10 text-secondary-lighter text-sm">No hay códigos de descuento.</p>
            ) : codes.map((code) => (
              <div key={code.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <code className="text-sm bg-primary-lighter text-secondary px-2 py-1 rounded font-bold">{code.code}</code>
                  <button
                    onClick={() => handleToggle(code)}
                    className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${code.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {code.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-secondary-lighter">
                  <div>
                    <p className="font-bold text-secondary">{code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}</p>
                    <p>descuento</p>
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{code.current_uses}{code.max_uses ? `/${code.max_uses}` : ''}</p>
                    <p>usos</p>
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{code.expires_at ? new Date(code.expires_at).toLocaleDateString('es-ES') : '∞'}</p>
                    <p>expira</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <button onClick={() => handleDelete(code.id)} className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors">
                    Eliminar código
                  </button>
                </div>
              </div>
            ))}
          </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white';
