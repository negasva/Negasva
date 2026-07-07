'use client';

import { useEffect, useState, useRef } from 'react';
import { uploadAdminImage } from '@/lib/admin/uploadImage';
import {
  DEFAULT_POD_PRODUCTS,
  mergePodProducts,
  type PodProductConfig,
} from '@/lib/content/podProducts';

// Editor de los productos POD ("Your drawing, on anything"). Guarda en
// landing_config ('pod_products'); la home lee de ahí (imagen, nombre, precio,
// visible) y el precio también alimenta el wizard/checkout vía loadPricingConfig.

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelCls = 'block text-xs font-bold text-gray-500 mb-1';
const saveCls = 'mt-6 px-6 py-2.5 rounded-lg bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-50';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<PodProductConfig[]>(DEFAULT_POD_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((data) => setProducts(mergePodProducts(data.pod_products)))
      .catch(() => setToast({ msg: 'Error cargando productos', ok: false }))
      .finally(() => setLoading(false));
  }, []);

  function update(key: string, patch: Partial<PodProductConfig>) {
    setProducts((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'pod_products', value: products }),
      });
      setToast(res.ok ? { msg: 'Guardado ✓ — visible ya en la web', ok: true } : { msg: 'Error al guardar', ok: false });
    } catch {
      setToast({ msg: 'Error de red', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-black text-3xl text-secondary mb-2">Productos físicos</h1>
      <p className="text-sm text-gray-500 mb-6">
        La sección &quot;Your drawing, on anything&quot; de la home. El precio se muestra como
        &quot;from $X&quot; y también se usa en el wizard y el checkout.
      </p>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-4">
        {products.map((p) => (
          <ProductRow key={p.key} item={p} onChange={(patch) => update(p.key, patch)} />
        ))}
      </div>

      <button className={saveCls} disabled={saving} onClick={save}>
        {saving ? 'Guardando…' : 'Guardar productos'}
      </button>
    </div>
  );
}

function ProductRow({ item, onChange }: { item: PodProductConfig; onChange: (patch: Partial<PodProductConfig>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, 'products');
      onChange({ image: url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir imagen');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 flex flex-wrap gap-4 items-end">
      <div className="w-16 h-16 rounded-lg bg-[#FFF1F7] border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs text-gray-400">sin img</span>
        )}
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className={labelCls}>Nombre</label>
        <input className={inputCls} value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="w-28">
        <label className={labelCls}>Precio desde (USD)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          className={inputCls}
          value={item.priceUsd}
          onChange={(e) => onChange({ priceUsd: Number(e.target.value) })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <button
          type="button"
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-secondary hover:bg-gray-200"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Subiendo…' : item.image ? 'Cambiar imagen' : 'Subir imagen'}
        </button>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-secondary">
          <input
            type="checkbox"
            checked={item.visible}
            onChange={(e) => onChange({ visible: e.target.checked })}
            className="accent-primary w-4 h-4"
          />
          Visible
        </label>
      </div>
    </div>
  );
}
