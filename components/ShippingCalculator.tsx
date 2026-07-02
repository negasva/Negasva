'use client';

import { useState } from 'react';
import { Truck, Loader2 } from 'lucide-react';

/**
 * Calculador de envío (Printful) para el carrito: formulario de dirección
 * que consulta /api/shipping y lista las opciones (STANDARD, EXPRESS…) con
 * su precio y plazo. Informativo — la dirección definitiva se captura en el
 * checkout de Stripe y el envío final puede variar.
 */

type Lang = 'es' | 'en' | 'fr';
const pick3 = (lang: Lang, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;

interface ShippingOption {
  id: string;
  name: string;
  rateUsd: number;
  minDeliveryDays: number | null;
  maxDeliveryDays: number | null;
}

// Países a los que Printful envía con más frecuencia desde nuestra tienda.
// El valor es el ISO-2 que espera la API.
const COUNTRIES: Array<{ code: string; label: Record<Lang, string> }> = [
  { code: 'US', label: { es: 'Estados Unidos', en: 'United States', fr: 'États-Unis' } },
  { code: 'CO', label: { es: 'Colombia', en: 'Colombia', fr: 'Colombie' } },
  { code: 'MX', label: { es: 'México', en: 'Mexico', fr: 'Mexique' } },
  { code: 'ES', label: { es: 'España', en: 'Spain', fr: 'Espagne' } },
  { code: 'CA', label: { es: 'Canadá', en: 'Canada', fr: 'Canada' } },
  { code: 'GB', label: { es: 'Reino Unido', en: 'United Kingdom', fr: 'Royaume-Uni' } },
  { code: 'FR', label: { es: 'Francia', en: 'France', fr: 'France' } },
  { code: 'DE', label: { es: 'Alemania', en: 'Germany', fr: 'Allemagne' } },
  { code: 'IT', label: { es: 'Italia', en: 'Italy', fr: 'Italie' } },
  { code: 'AR', label: { es: 'Argentina', en: 'Argentina', fr: 'Argentine' } },
  { code: 'CL', label: { es: 'Chile', en: 'Chile', fr: 'Chili' } },
  { code: 'PE', label: { es: 'Perú', en: 'Peru', fr: 'Pérou' } },
  { code: 'EC', label: { es: 'Ecuador', en: 'Ecuador', fr: 'Équateur' } },
  { code: 'BR', label: { es: 'Brasil', en: 'Brazil', fr: 'Brésil' } },
  { code: 'PT', label: { es: 'Portugal', en: 'Portugal', fr: 'Portugal' } },
  { code: 'NL', label: { es: 'Países Bajos', en: 'Netherlands', fr: 'Pays-Bas' } },
  { code: 'AU', label: { es: 'Australia', en: 'Australia', fr: 'Australie' } },
];

// Estados de EE.UU. (código que espera Printful como state_code). Para US la
// tarifa depende solo del estado, así que ciudad y ZIP se ocultan y basta
// elegir de esta lista.
const US_STATES: Array<{ code: string; name: string }> = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export default function ShippingCalculator({
  productUnits,
  lang,
  fmt,
  defaultCountry = 'US',
  onSelect,
}: {
  /** Unidades de productos físicos seleccionadas (mismo shape que el checkout). */
  productUnits: Record<string, Array<Record<string, string>>>;
  lang: Lang;
  /** Formatea un monto USD en la moneda visible del sitio. */
  fmt: (usd: number) => string;
  defaultCountry?: string;
  /** Notifica la opción elegida (para reflejarla en el resumen si se desea). */
  onSelect?: (option: ShippingOption | null) => void;
}) {
  const [country, setCountry] = useState(defaultCountry);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  // Para EE.UU. la tarifa de Printful depende solo del estado: basta un
  // dropdown y se ocultan ciudad y ZIP.
  const isUS = country === 'US';

  const changeCountry = (code: string) => {
    setCountry(code);
    setState('');
  };
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setSelectedId(null);
    onSelect?.(null);
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          ...(state.trim() ? { state: state.trim() } : {}),
          ...(!isUS && city.trim() ? { city: city.trim() } : {}),
          ...(!isUS && zip.trim() ? { zip: zip.trim() } : {}),
          productUnits,
        }),
      });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      setOptions(data.available ? (data.options as ShippingOption[]) : []);
      setStatus('done');
    } catch {
      setOptions([]);
      setStatus('error');
    }
  };

  const pickOption = (o: ShippingOption) => {
    setSelectedId(o.id);
    onSelect?.(o);
  };

  const deliveryLabel = (o: ShippingOption) => {
    if (o.minDeliveryDays == null && o.maxDeliveryDays == null) return null;
    const min = o.minDeliveryDays ?? o.maxDeliveryDays;
    const max = o.maxDeliveryDays ?? o.minDeliveryDays;
    const range = min === max ? `${min}` : `${min}–${max}`;
    return pick3(lang, `${range} días hábiles`, `${range} business days`, `${range} jours ouvrés`);
  };

  const inputClass =
    'w-full rounded-lg border-2 border-primary-lighter px-3 py-2.5 text-sm font-bold text-secondary focus:border-primary focus:outline-none bg-white';

  return (
    <div className="rounded-2xl border-2 border-primary-lighter bg-white p-4">
      <p className="font-black text-secondary text-sm mb-1 flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" />
        {pick3(lang, 'Calcula tu envío', 'Calculate your shipping', 'Calcule ta livraison')}
      </p>
      <p className="text-xs text-secondary-lighter mb-3">
        {pick3(
          lang,
          'Estimado según tu dirección. La dirección definitiva se confirma al pagar.',
          'Estimate based on your address. The final address is confirmed at checkout.',
          'Estimation selon ton adresse. L’adresse définitive est confirmée au paiement.',
        )}
      </p>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block sm:col-span-2">
          <span className="block text-xs font-bold text-secondary-lighter mb-1">
            {pick3(lang, 'País', 'Country', 'Pays')}
          </span>
          <select value={country} onChange={(e) => changeCountry(e.target.value)} className={inputClass}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label[lang]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-secondary-lighter mb-1">
            {isUS
              ? pick3(lang, 'Estado', 'State', 'État')
              : pick3(lang, 'Estado / Provincia', 'State / Province', 'État / Province')}
          </span>
          {isUS ? (
            <select value={state} onChange={(e) => setState(e.target.value)} required className={inputClass}>
              <option value="" disabled>
                {pick3(lang, 'Elige tu estado', 'Choose your state', 'Choisis ton état')}
              </option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input value={state} onChange={(e) => setState(e.target.value)} maxLength={40} className={inputClass} />
          )}
        </label>
        {!isUS && (
          <label className="block">
            <span className="block text-xs font-bold text-secondary-lighter mb-1">
              {pick3(lang, 'Ciudad', 'City', 'Ville')}
            </span>
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className={inputClass} />
          </label>
        )}
        {!isUS && (
          <label className="block">
            <span className="block text-xs font-bold text-secondary-lighter mb-1">
              {pick3(lang, 'Código postal', 'ZIP / Postal code', 'Code postal')}
            </span>
            <input value={zip} onChange={(e) => setZip(e.target.value)} maxLength={16} className={inputClass} />
          </label>
        )}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-secondary-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {pick3(lang, 'Calcular envío', 'Calculate shipping', 'Calculer')}
          </button>
        </div>
      </form>

      {status === 'error' && (
        <p className="text-xs text-red-500 font-bold mt-3">
          {pick3(
            lang,
            'No pudimos calcular el envío. Inténtalo de nuevo.',
            'We could not calculate shipping. Please try again.',
            'Impossible de calculer la livraison. Réessaie.',
          )}
        </p>
      )}
      {status === 'done' && options.length === 0 && (
        <p className="text-xs text-secondary-lighter font-bold mt-3">
          {pick3(
            lang,
            'Envío calculado en el checkout para esta dirección.',
            'Shipping will be calculated at checkout for this address.',
            'Livraison calculée au paiement pour cette adresse.',
          )}
        </p>
      )}
      {options.length > 0 && (
        <div className="mt-4 space-y-2">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => pickOption(o)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                selectedId === o.id
                  ? 'border-primary bg-primary-lighter ring-2 ring-primary'
                  : 'border-primary-lighter hover:border-primary'
              }`}
            >
              <span className="min-w-0">
                <span className="block font-bold text-secondary text-sm truncate">{o.name}</span>
                {deliveryLabel(o) && (
                  <span className="block text-xs text-secondary-lighter">{deliveryLabel(o)}</span>
                )}
              </span>
              <span className="font-black text-secondary text-sm whitespace-nowrap">{fmt(o.rateUsd)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
