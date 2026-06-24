'use client';

import { useEffect, useState } from 'react';
import type { AdminOrder, OrderStatus } from '@/types/admin';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:     'Pendiente',
  in_progress: 'En proceso',
  delivered:   'Entregado',
  cancelled:   'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
};

const EMPTY_FORM = {
  client_name: '',
  client_email: '',
  client_instagram: '',
  style: '',
  body_type: '' as '' | 'torso_only' | 'full_body',
  background_name: '',
  people_count: '1',
  status: 'pending' as OrderStatus,
  price: '',
  currency: 'USD',
  notes: '',
  reference: '',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function load() {
    const res = await fetch('/api/admin/orders');
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(o: AdminOrder) {
    setEditId(o.id);
    setForm({
      client_name: o.client_name,
      client_email: o.client_email ?? '',
      client_instagram: o.client_instagram ?? '',
      style: o.style ?? '',
      body_type: o.body_type ?? '',
      background_name: o.background_name ?? '',
      people_count: String(o.people_count),
      status: o.status,
      price: o.price != null ? String(o.price) : '',
      currency: o.currency,
      notes: o.notes ?? '',
      reference: o.reference ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      client_name: form.client_name,
      client_email: form.client_email || null,
      client_instagram: form.client_instagram || null,
      style: form.style || null,
      body_type: form.body_type || null,
      background_name: form.background_name || null,
      people_count: parseInt(form.people_count) || 1,
      status: form.status,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency || 'USD',
      notes: form.notes || null,
      reference: form.reference || null,
    };

    if (editId) {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...payload }),
      });
      showToast(res.ok ? 'Pedido actualizado' : 'Error al actualizar');
    } else {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showToast(res.ok ? 'Pedido creado' : 'Error al crear');
    }

    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function quickStatus(o: AdminOrder, status: OrderStatus) {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: o.id,
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      }),
    });
    setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status, delivered_at: status === 'delivered' ? new Date().toISOString() : x.delivered_at } : x));
    showToast(status === 'delivered' ? 'Marcado como entregado' : 'Estado actualizado');
  }

  async function handleDelete(o: AdminOrder) {
    if (!confirm(`Eliminar pedido de ${o.client_name}?`)) return;
    await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: o.id }),
    });
    setOrders((prev) => prev.filter((x) => x.id !== o.id));
    showToast('Pedido eliminado');
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all:         orders.length,
    pending:     orders.filter((o) => o.status === 'pending').length,
    in_progress: orders.filter((o) => o.status === 'in_progress').length,
    delivered:   orders.filter((o) => o.status === 'delivered').length,
    cancelled:   orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Pedidos</h1>
          <p className="text-sm text-secondary-lighter">Registra y gestiona los pedidos de clientes.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-lighter shadow-sm p-4 lg:p-6 mb-5 space-y-4">
          <h2 className="font-black text-secondary text-base">{editId ? 'Editar pedido' : 'Nuevo pedido'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nombre del cliente *</label>
              <input required className={inp} value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Maria Garcia" />
            </div>
            <div>
              <label className={lbl}>Instagram</label>
              <input className={inp} value={form.client_instagram} onChange={(e) => setForm({ ...form, client_instagram: e.target.value })} placeholder="@cliente" />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input type="email" className={inp} value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} placeholder="cliente@email.com" />
            </div>
            <div>
              <label className={lbl}>Referencia / N. pedido</label>
              <input className={inp} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="PED-001" />
            </div>
            <div>
              <label className={lbl}>Estilo</label>
              <select className={inp} value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="rick-morty">Cartoon sci-fi</option>
                <option value="gravity-falls">Misterio del bosque</option>
                <option value="simpsons">Familia amarilla clasica</option>
                <option value="fairly-odd">Fantasia brillante</option>
                <option value="negasva">Estilo NEGASVA</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Tipo de retrato</label>
              <select className={inp} value={form.body_type} onChange={(e) => setForm({ ...form, body_type: e.target.value as typeof form.body_type })}>
                <option value="">Seleccionar...</option>
                <option value="torso_only">Torso unicamente</option>
                <option value="full_body">Cuerpo completo</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Numero de personas</label>
              <input type="number" min="1" max="20" className={inp} value={form.people_count} onChange={(e) => setForm({ ...form, people_count: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Fondo elegido</label>
              <input className={inp} value={form.background_name} onChange={(e) => setForm({ ...form, background_name: e.target.value })} placeholder="Cartoon sci-fi - Portal" />
            </div>
            <div>
              <label className={lbl}>Precio</label>
              <input type="number" min="0" step="0.01" className={inp} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="45.00" />
            </div>
            <div>
              <label className={lbl}>Divisa</label>
              <select className={inp} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="COP">COP</option>
                <option value="MXN">MXN</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Estado</label>
              <select className={inp} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}>
                {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Notas internas</label>
              <textarea rows={3} className={inp} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referencias, detalles especiales..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear pedido'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-secondary-lighter hover:text-secondary text-sm font-bold px-4 py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {[['all', 'Todos'] as const, ...Object.entries(STATUS_LABELS) as [OrderStatus, string][]].map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === k ? 'bg-primary text-white' : 'bg-white text-secondary-lighter border border-gray-100 hover:border-primary-lighter'
            }`}
          >
            {v} ({counts[k]})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">
          <p>No hay pedidos{filter !== 'all' ? ` con estado "${STATUS_LABELS[filter as OrderStatus]}"` : ''}.</p>
          <button onClick={openCreate} className="mt-3 text-primary font-bold text-sm hover:underline">Registrar el primero</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-black text-secondary">{order.client_name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    {order.reference && (
                      <code className="text-xs bg-gray-100 text-secondary-lighter px-2 py-0.5 rounded">{order.reference}</code>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-lighter">
                    {order.client_instagram && <span>{order.client_instagram}</span>}
                    {order.client_email && <span>{order.client_email}</span>}
                    {order.style && <span>Estilo: {order.style}</span>}
                    {order.body_type && <span>{order.body_type === 'full_body' ? 'Cuerpo completo' : 'Torso'}</span>}
                    {order.people_count > 0 && <span>{order.people_count} persona{order.people_count > 1 ? 's' : ''}</span>}
                    {order.background_name && <span>Fondo: {order.background_name}</span>}
                    <span>{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-secondary-lighter mt-2 bg-gray-50 rounded px-2 py-1 italic">{order.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {order.price != null && (
                    <p className="font-black text-lg text-primary">${order.price} <span className="text-xs font-normal text-secondary-lighter">{order.currency}</span></p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                {order.status !== 'delivered' && (
                  <button
                    onClick={() => quickStatus(order, 'delivered')}
                    className="text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Marcar entregado
                  </button>
                )}
                {order.status === 'pending' && (
                  <button
                    onClick={() => quickStatus(order, 'in_progress')}
                    className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    En proceso
                  </button>
                )}
                <button
                  onClick={() => openEdit(order)}
                  className="text-xs font-bold text-secondary-lighter hover:text-secondary border border-gray-100 hover:border-primary-lighter px-3 py-1.5 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(order)}
                  className="text-xs font-bold text-red-400 hover:text-red-600 border border-gray-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
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

const lbl = 'block text-xs font-bold text-secondary-lighter mb-1.5 uppercase tracking-wide';
const inp = 'w-full border border-primary-lighter rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white';
