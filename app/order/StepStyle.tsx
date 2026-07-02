'use client';

import { ImageUp } from 'lucide-react';
import type { CheckoutController } from './useCheckout';

const pick3 = (lang: string, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;

/** Step 1 — pick the cartoon style (and, optionally, upload photos already). */
export default function StepStyle({ c }: { c: CheckoutController }) {
  const { t, lang, styles, selected, selectStyle, handlePhotoUpload } = c;

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step1.title}</h1>
        <p className="text-lg text-secondary-lighter">{t.studio.step1.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {styles.map((s) => (
          <button
            key={s.id}
            onClick={() => selectStyle(s.id)}
            className={`rounded-2xl border-2 p-8 text-center transition-all focus:outline-none ${
              selected.style === s.id
                ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
            }`}
          >
            <p className="font-bold text-secondary">{s.name}</p>
          </button>
        ))}
      </div>

      {/* Fotos desde el paso 1 (opcional): viajan con el pedido igual que en el paso 4. */}
      <div className="mt-10 max-w-xl mx-auto">
        <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary-lighter bg-white px-5 py-4 cursor-pointer hover:border-primary hover:bg-primary-lighter transition-all">
          <ImageUp className="w-5 h-5 text-primary shrink-0" />
          <span className="font-bold text-secondary text-sm">
            {selected.photos.length > 0
              ? `${selected.photos.length} ${selected.photos.length > 1 ? t.studio.step5.selected_plural : t.studio.step5.selected}`
              : pick3(lang, 'Sube tus fotos ahora (opcional)', 'Upload your photos now (optional)', 'Téléverse tes photos maintenant (optionnel)')}
          </span>
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
        <p className="mt-3 text-center text-sm font-black text-green-600">
          ✏️ {pick3(lang, 'Empieza ya, sube las fotos luego si prefieres', 'Start now, upload photos later if you prefer', 'Commence maintenant, envoie les photos plus tard si tu préfères')}
        </p>
      </div>
    </div>
  );
}
