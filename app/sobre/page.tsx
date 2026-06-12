'use client';

import Link from 'next/link';
import { Heart, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

export default function SobrePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.about.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="prose max-w-none text-secondary-lighter">
            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter">{t.about.story_title}</h2>
            <p className="mb-6 leading-relaxed">
              {t.about.story_p1}
            </p>
            <p className="mb-6 leading-relaxed">
              {t.about.story_p2}
            </p>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">{t.about.values_title}</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8 mb-12">
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Heart className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">{t.about.passion}</h3>
                <p className="text-sm text-secondary-lighter">{t.about.passion_desc}</p>
              </div>
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">{t.about.speed}</h3>
                <p className="text-sm text-secondary-lighter">{t.about.speed_desc}</p>
              </div>
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Star className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">{t.about.excellence}</h3>
                <p className="text-sm text-secondary-lighter">{t.about.excellence_desc}</p>
              </div>
            </div>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">{t.about.join_title}</h2>
            <p className="mb-6 leading-relaxed">
              {t.about.join_desc}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            {t.about.cta_title}
          </h2>
          <Link
            href="/order"
            className="inline-block rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            {t.about.cta_btn}
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
