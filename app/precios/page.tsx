'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  final_price: number;
}

export default function PreciosPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<PackageItem[]>([]);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPackages(data); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
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
                <span className="font-black text-3xl text-primary">$15</span>
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
                <span className="font-black text-3xl text-primary">$25</span>
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
                <span className="font-black text-3xl text-primary">+$15</span>
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
                  <div key={pkg.id} className="bg-gradient-to-br from-primary-lighter to-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
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

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-12 text-white mb-12">
            <h3 className="font-black text-3xl mb-6 tracking-tighter">{t.pricing.examples_title}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex1}</span>
                <span className="font-bold">$25</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex2}</span>
                <span className="font-bold">$50</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>{t.pricing.ex3}</span>
                <span className="font-bold">$65</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold">{t.pricing.ex4}</span>
                <span className="font-black text-2xl">$115</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/studio"
              className="inline-block rounded-lg bg-secondary px-10 py-5 font-bold text-white hover:bg-secondary-light transition-colors text-lg"
            >
              {t.pricing.cta}
            </Link>
          </div>
        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
