'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import Link from 'next/link';

export default function GaleriaPage() {
  const { t } = useLanguage();

  const portfolioItems = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `${t.gallery.portrait} ${i + 1}`,
    style: ['Rick & Morty', 'Gravity Falls', 'Simpsons', 'Padrinos'][i % 4],
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.gallery.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.gallery.subtitle}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-lighter to-primary flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-primary font-semibold">{item.style}</p>
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
            {t.gallery.cta_title}
          </h2>
          <p className="text-gray-300 mb-8">
            {t.gallery.cta_subtitle}
          </p>
          <Link
            href="/studio"
            className="inline-block rounded-lg bg-primary px-10 py-4 font-bold text-white hover:bg-primary-dark transition-colors"
          >
            {t.gallery.cta_btn}
          </Link>
        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
