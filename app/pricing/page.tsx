'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { cachedFetchJSON } from '@/lib/cache/clientCache';

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  final_price: number;
}

interface BodyTypeItem {
  slug: string;
  price_usd: number;
}

// Fallbacks if the APIs are unavailable — admin manages the real values.
// Must match the studio/checkout fallbacks so the displayed price is what gets charged.
const FALLBACK_BODY_PRICES: Record<string, number> = { torso_only: 25, full_body: 29.99 };
const FALLBACK_PRICES: Record<string, number> = { background_standard: 15, background_custom: 25 };

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export default function PreciosPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [bodyPrices, setBodyPrices] = useState<Record<string, number>>(FALLBACK_BODY_PRICES);
  const [priceMap, setPriceMap] = useState<Record<string, number>>(FALLBACK_PRICES);

  useEffect(() => {
    cachedFetchJSON<PackageItem[]>('/api/packages')
      .then((data) => { if (Array.isArray(data)) setPackages(data); })
      .catch(() => {});
    cachedFetchJSON<BodyTypeItem[]>('/api/body-types')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBodyPrices((prev) => {
            const next = { ...prev };
            for (const b of data) next[b.slug] = Number(b.price_usd);
            return next;
          });
        }
      })
      .catch(() => {});
    cachedFetchJSON<Array<{ key: string; amount: number }>>('/api/prices')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPriceMap((prev) => {
            const next = { ...prev };
            for (const p of data) next[p.key] = Number(p.amount);
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  const torso = bodyPrices.torso_only ?? 25;
  const full = bodyPrices.full_body ?? 29.99;
  const bgStandard = priceMap.background_standard ?? 15;
  const bgCustom = priceMap.background_custom ?? 25;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.pricing.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">{t.pricing.one_torso}</h3>
                  <p className="text-sm text-secondary-lighter mt-1">{t.pricing.one_torso_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">{usd(torso)}</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature1}
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature2}
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature3}
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">{t.pricing.one_full}</h3>
                  <p className="text-sm text-secondary-lighter mt-1">{t.pricing.one_full_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">{usd(full)}</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature4}
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature5}
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature6}
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">{t.pricing.bg}</h3>
                  <p className="text-sm text-secondary-lighter mt-1">{t.pricing.bg_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">+{usd(bgStandard)}</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature7}
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t.pricing.feature8}
                </li>
              </ul>
            </div>
          </div>

          {/* Packages / Promotions */}
          {packages.length > 0 && (
            <div className="mb-12">
              <h2 className="font-black text-2xl text-secondary mb-2 tracking-tighter">Paquetes y promociones</h2>
              <p className="text-sm text-secondary-lighter mb-6">Combina opciones y ahorra con nuestros paquetes.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-primary-lighter/40 rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-black text-lg text-secondary leading-tight">{pkg.name}</h3>
                      <span className="font-black text-2xl text-primary flex-shrink-0">${pkg.final_price}</span>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-secondary-lighter">{pkg.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-secondary rounded-2xl p-12 text-white mb-12">
            <h3 className="font-black text-3xl mb-6 tracking-tighter">{t.pricing.examples_title}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex1}</span>
                <span className="font-bold">{usd(full)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex2}</span>
                <span className="font-bold">{usd(2 * full)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex3}</span>
                <span className="font-bold">{usd(2 * full + bgCustom)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold">{t.pricing.ex4}</span>
                <span className="font-black text-2xl">{usd(4 * full * 0.85 + bgStandard)}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/order"
              className="inline-block rounded-lg bg-secondary px-10 py-5 font-bold text-white hover:bg-secondary-light transition-colors text-lg"
            >
              {t.pricing.cta}
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
