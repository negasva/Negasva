'use client';

import { useEffect, useState } from 'react';
import type { Faq } from '@/types/admin';

const EMPTY_FORM = { question: '', answer: '', sort_order: '0', is_active: true };

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
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

  async function loadFaqs() {
    const res = await fetch('/api/admin/faqs');
    setFaqs(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadFaqs(); }, []);

  function openCreate() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, sort_order: String(faqs.length + 1) });
    setShowForm(true);
  }

  function openEdit(faq: Faq) {
    setEditId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, sort_order: String(faq.sort_order), is_active: faq.is_active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, sort_order: parseInt(form.sort_order, 10) || 0 };

    if (editId) {
      await fetch('/api/admin/faqs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...payload }) });
      showToast('FAQ actualizada');
    } else {
      await fetch('/api/admin/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      showToast('FAQ creada');
    }

    setShowForm(false);
    await loadFaqs();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await fetch('/api/admin/faqs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    showToast('FAQ eliminada');
  }

  async function toggleActive(faq: Faq) {
    await fetch('/api/admin/faqs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: faq.id, is_active: !faq.is_active }) });
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f)));
    showToast(faq.is_active ? 'FAQ ocultada' : 'FAQ visible');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-1">Preguntas frecuentes</h1>
          <p className="text-sm text-secondary-lighter">Gestiona las preguntas y respuestas que se muestran en /faq.</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1">
          <span>+</span>
          <span className="hidden sm:inline">Nueva pregunta</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-black text-secondary text-base">{editId ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Pregunta</label>
              <input required className={inputCls} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="¿Cuánto tarda mi retrato?" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Respuesta</label>
              <textarea required rows={4} className={inputCls} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Escribe la respuesta. Puedes enlazar con [texto](/ruta)." />
            </div>
            <div>
              <label className={labelCls}>Orden</label>
              <input type="number" min="0" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm text-secondary">Activa (visible en el sitio)</span>
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
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-black text-secondary">{faq.question}</p>
                  <p className="text-xs text-secondary-lighter mt-1 whitespace-pre-line">{faq.answer}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {faq.is_active ? 'Activa' : 'Oculta'}
                  </span>
                  <span className="text-xs text-secondary-lighter">Orden: {faq.sort_order}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button onClick={() => openEdit(faq)} className="flex-1 text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors">
                  Editar
                </button>
                <button onClick={() => toggleActive(faq)} className="flex-1 text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter rounded-lg py-1.5 transition-colors">
                  {faq.is_active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onClick={() => handleDelete(faq.id)} className="flex-1 text-xs font-bold text-red-400 hover:text-red-600 border border-gray-100 hover:border-red-200 rounded-lg py-1.5 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-center py-10 text-secondary-lighter text-sm">No hay preguntas. Crea la primera.</p>
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
