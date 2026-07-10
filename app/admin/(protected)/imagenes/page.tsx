'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { uploadAdminImage } from '@/lib/admin/uploadImage';
import { SITE_IMAGE_SLOTS, type SiteImageSlot, type SiteImages } from '@/lib/siteImages';

/** Editor visual de todas las imágenes fijas del sitio (landing y /order). */
export default function SiteImagesPage() {
  const [siteImages, setSiteImages] = useState<SiteImages>({});
  const [slots, setSlots] = useState<SiteImageSlot[]>(SITE_IMAGE_SLOTS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [toast, setToast] = useState('');
  // Error de guardado: banner PERSISTENTE (no se va solo) con la causa real del
  // servidor, para que un fallo nunca se lea como éxito.
  const [saveError, setSaveError] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const [cfgRes, btRes] = await Promise.all([
      fetch('/api/landing-config').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/body-types').then((r) => r.json()).catch(() => []),
    ]);
    // Si el GET falló (env/migración), muéstralo explícito en vez de asumir {}.
    if (cfgRes && typeof cfgRes.error === 'string') setSaveError(cfgRes.error);
    setSiteImages(cfgRes.site_images ?? {});
    // Slots dinámicos: un slot por cada tipo de cuerpo creado en el admin
    // que no esté ya en el registro estático.
    if (Array.isArray(btRes)) {
      const extra: SiteImageSlot[] = btRes
        .filter((bt: { slug: string }) => !SITE_IMAGE_SLOTS.some((s) => s.key === `order_body_${bt.slug}`))
        .map((bt: { slug: string; name: string }) => ({
          key: `order_body_${bt.slug}`,
          page: 'Pedido (/order)',
          section: 'Tipo de cuerpo',
          label: `Tarjeta ${bt.name}`,
          def: `/body-types/${bt.slug}.webp`,
          recommended: '600 × 400 px',
        }));
      setSlots([...SITE_IMAGE_SLOTS, ...extra]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveSiteImages(next: SiteImages, key: string) {
    setSavingKey(key);
    setSaveError('');
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'site_images', value: next }),
      });
      if (res.ok) {
        setSiteImages(next);
        showToast('Imagen guardada');
      } else {
        // Muestra la causa real del servidor y NO actualiza la UI: así el admin
        // sabe que NO se guardó (antes: toast de 2.5s indistinguible de éxito).
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `No se pudo guardar (HTTP ${res.status})`);
      }
    } catch {
      setSaveError('No se pudo contactar el servidor al guardar.');
    }
    setSavingKey('');
  }

  // Agrupar slots por página → sección para mostrar el path de cada imagen.
  const groups: { page: string; section: string; slots: SiteImageSlot[] }[] = [];
  for (const slot of slots) {
    const g = groups.find((x) => x.page === slot.page && x.section === slot.section);
    if (g) g.slots.push(slot);
    else groups.push({ page: slot.page, section: slot.section, slots: [slot] });
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Imágenes del sitio</h1>
        <p className="text-sm text-secondary-lighter">
          Todas las fotos fijas de la web, con vista previa y su ubicación exacta. Sube un archivo o pega una URL y guarda.
        </p>
      </div>

      {saveError && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
          <div>
            <p className="font-black text-red-600 text-sm">No se guardó — la imagen NO quedó persistida</p>
            <p className="text-red-600 text-xs mt-0.5 break-all">{saveError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSaveError('')}
            className="shrink-0 text-red-600 font-black text-lg leading-none hover:opacity-70"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : (
        <>
          {groups.map((g) => (
            <section key={`${g.page}·${g.section}`} className="mb-8">
              <h2 className="font-black text-secondary text-base">
                {g.page} <span className="text-secondary-lighter font-bold">→ {g.section}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
                {g.slots.map((slot) => (
                  <SlotCard
                    key={slot.key}
                    slot={slot}
                    current={siteImages[slot.key] || ''}
                    saving={savingKey === slot.key}
                    onSave={(url) => {
                      const next = { ...siteImages };
                      if (url) next[slot.key] = url;
                      else delete next[slot.key];
                      saveSiteImages(next, slot.key);
                    }}
                  />
                ))}
              </div>
            </section>
          ))}

          <p className="text-xs text-secondary-lighter">
            Los estilos, fondos por estilo y obras de la galería antes/después se editan en sus propias secciones
            (Estilos, Fondos y Contenido del sitio → Galería).
          </p>
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

function SlotCard({
  slot, current, saving, onSave, allowClear = true,
}: {
  slot: SiteImageSlot;
  current: string;
  saving: boolean;
  onSave: (url: string) => void;
  allowClear?: boolean;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const effective = current || slot.def;
  const busy = saving || uploading;

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, 'site');
      onSave(url);
      setUrlInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir imagen');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {effective ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={effective} src={effective} alt={slot.label} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-secondary-lighter">
            Sin imagen — la web muestra un placeholder
          </div>
        )}
        {current && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
            Personalizada
          </span>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-bold text-secondary">{slot.label}</p>
        {slot.recommended && (
          <p className="text-[10px] font-bold text-primary bg-primary/10 rounded-md px-2 py-1 inline-block">
            Recomendado: {slot.recommended}
          </p>
        )}
        <p className="text-[10px] text-secondary-lighter break-all">
          {slot.page} → {slot.section} · <span className="font-mono">{effective}</span>
        </p>

        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden"
            id={`file_${slot.key}`}
          />
          <label
            htmlFor={`file_${slot.key}`}
            className={`flex-1 text-center text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors ${busy ? 'bg-gray-100 text-gray-400' : 'bg-primary text-white hover:bg-primary-dark'}`}
          >
            {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Subir imagen'}
          </label>
          {allowClear && current && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave('')}
              className="text-xs font-bold px-3 py-2 rounded-lg bg-gray-100 text-secondary-lighter hover:bg-gray-200 transition-colors"
            >
              Restaurar
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="URL o /ruta/imagen.webp"
            className="flex-1 min-w-0 border border-primary-lighter rounded-lg px-2 py-1.5 text-xs text-secondary focus:outline-none focus:border-primary bg-white"
          />
          <button
            type="button"
            disabled={busy || !urlInput.trim()}
            onClick={() => { onSave(urlInput.trim()); setUrlInput(''); }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary-light transition-colors disabled:opacity-40"
          >
            Usar
          </button>
        </div>
      </div>
    </div>
  );
}
