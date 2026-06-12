'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { cachedFetchJSON } from '@/lib/cache/clientCache';

interface ApiStyle {
  slug: string;
  name: string;
  description: string | null;
}

export default function EstilosPage() {
  const { t } = useLanguage();
  const [apiStyles, setApiStyles] = useState<ApiStyle[] | null>(null);

  useEffect(() => {
    cachedFetchJSON<ApiStyle[]>('/api/styles')
      .then((data) => { if (Array.isArray(data) && data.length > 0) setApiStyles(data); })
      .catch(() => {});
  }, []);

  // Translated copy for the known styles; admin-created styles fall back to
  // their DB description.
  const translated: Record<string, { desc: string; features: string[] }> = {
    'rick-morty':    { desc: t.styles.rm_desc, features: [t.styles.rm_f1, t.styles.rm_f2, t.styles.rm_f3] },
    'gravity-falls': { desc: t.styles.gf_desc, features: [t.styles.gf_f1, t.styles.gf_f2, t.styles.gf_f3] },
    'simpsons':      { desc: t.styles.sp_desc, features: [t.styles.sp_f1, t.styles.sp_f2, t.styles.sp_f3] },
    'fairly-odd':    { desc: t.styles.fo_desc, features: [t.styles.fo_f1, t.styles.fo_f2, t.styles.fo_f3] },
  };

  // Fallback list if the API is unavailable — admin manages the real catalog
  const fallbackStyles = [
    { name: 'Rick & Morty', ...translated['rick-morty'] },
    { name: 'Gravity Falls', ...translated['gravity-falls'] },
    { name: 'The Simpsons', ...translated['simpsons'] },
    { name: 'The Fairly OddParents', ...translated['fairly-odd'] },
  ];

  const styles = apiStyles
    ? apiStyles.map((s) => ({
        name: s.name,
        desc: translated[s.slug]?.desc ?? s.description ?? '',
        features: translated[s.slug]?.features ?? [],
      }))
    : fallbackStyles;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.styles.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.styles.subtitle}
          </p>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12">
            {styles.map((style) => (
              <div key={style.name} className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all">
                <div className="bg-primary p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                  <div className="relative">
                    <h3 className="font-black text-3xl text-white mb-2">{style.name}</h3>
                  </div>
                </div>
                <div className="p-8 bg-white">
                  <p className="text-secondary-lighter mb-6">{style.desc}</p>
                  {style.features.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-bold text-secondary mb-3">{t.styles.features}</h4>
                      <ul className="space-y-2">
                        {style.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-secondary-lighter">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href="/order"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
                  >
                    {t.styles.cta_btn}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            {t.styles.not_sure_title}
          </h2>
          <p className="text-gray-300 mb-8">
            {t.styles.not_sure_desc}
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            {t.styles.explore}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
