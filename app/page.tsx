'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';

export default function Home() {
  const { t } = useLanguage();
  const { fmt } = useCurrency();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="bg-cream pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <p className="text-primary font-bold text-xs tracking-widest mb-6 uppercase">
                {t.home.hero_badge}
              </p>
              <h1 className="font-black text-6xl md:text-7xl tracking-tighter mb-6 leading-[0.95]">
                <span className="text-secondary block">{t.home.title_part1}</span>
                <span className="text-primary block">{t.home.title_part2}</span>
              </h1>
              <p className="text-base text-secondary-lighter mb-10 leading-relaxed max-w-md">
                {t.home.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 bg-secondary px-8 py-4 font-bold text-white hover:bg-secondary-light transition-colors"
                >
                  {t.home.cta_primary}
                </Link>
                <Link
                  href="/galeria"
                  className="inline-flex items-center gap-2 border-2 border-secondary px-8 py-4 font-bold text-secondary hover:bg-secondary hover:text-white transition-colors"
                >
                  {t.home.cta_secondary}
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-secondary-lighter">
                <span>
                  <strong className="text-secondary font-black">1.8M</strong>{' '}
                  {t.home.social_tiktok.replace('1.8M ', '').replace('1,8M ', '')}
                </span>
                <span className="text-secondary/20">|</span>
                <span>
                  <strong className="text-secondary font-black">50K</strong>{' '}
                  {t.home.social_instagram.replace('50K ', '')}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="relative mt-8 md:mt-0">
              <div className="border-2 border-secondary overflow-hidden">
                <Image
                  src="/backgrounds/rm-1.jpg"
                  alt="Rick & Morty Style"
                  width={600}
                  height={420}
                  className="w-full object-cover"
                  priority
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-secondary-lighter uppercase tracking-widest">Rick &amp; Morty Style</span>
                <div className="bg-primary px-4 py-2">
                  <p className="font-black text-xl text-secondary leading-none">+1000</p>
                  <p className="text-xs text-secondary font-medium">pedidos</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-black text-5xl text-primary mb-2 tracking-tighter">1000+</p>
              <p className="text-sm text-cream/60 uppercase tracking-widest">{t.home.stats.clients}</p>
            </div>
            <div>
              <p className="font-black text-5xl text-primary mb-2 tracking-tighter">24h</p>
              <p className="text-sm text-cream/60 uppercase tracking-widest">{t.home.stats.delivery}</p>
            </div>
            <div>
              <p className="font-black text-5xl text-primary mb-2 tracking-tighter">0%</p>
              <p className="text-sm text-cream/60 uppercase tracking-widest">{t.home.stats.satisfaction}</p>
              <p className="text-xs text-cream/30 mt-1">{t.home.stats.satisfaction_note}</p>
            </div>
            <div>
              <p className="font-black text-5xl text-primary mb-2 tracking-tighter">4+</p>
              <p className="text-sm text-cream/60 uppercase tracking-widest">{t.home.stats.styles}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-cream py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.why.title}
            </h2>
            <p className="text-lg text-secondary-lighter max-w-xl">
              {t.home.why.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-0 border-t-2 border-l-2 border-secondary/10">
            {[
              { num: '01', title: t.home.why.fast_title, desc: t.home.why.fast_desc },
              { num: '02', title: t.home.why.quality_title, desc: t.home.why.quality_desc },
              { num: '03', title: t.home.why.personal_title, desc: t.home.why.personal_desc },
              { num: '04', title: t.home.why.social_title, desc: t.home.why.social_desc },
            ].map((item) => (
              <div
                key={item.num}
                className="border-b-2 border-r-2 border-secondary/10 p-10 hover:bg-secondary/[0.02] transition-colors"
              >
                <p className="font-black text-5xl text-primary tracking-tighter mb-4 leading-none">{item.num}</p>
                <h3 className="font-black text-xl text-secondary mb-3">{item.title}</h3>
                <p className="text-secondary-lighter leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styles */}
      <section className="bg-secondary py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-cream mb-4">
              {t.home.styles.title}
            </h2>
            <p className="text-lg text-cream/50">{t.home.styles.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            {[
              { name: 'Rick & Morty', desc: 'Sci-fi' },
              { name: 'Gravity Falls', desc: 'Misterio' },
              { name: 'Simpsons', desc: 'Clásico' },
              { name: 'Padrinos', desc: 'Fantasía' },
            ].map((style) => (
              <Link
                key={style.name}
                href="/studio"
                className="group border-2 border-cream/10 hover:border-primary p-8 text-center transition-colors hover:bg-secondary-light"
              >
                <h4 className="font-black text-cream text-base mb-1 group-hover:text-primary transition-colors">{style.name}</h4>
                <p className="text-xs text-cream/40 uppercase tracking-widest">{style.desc}</p>
              </Link>
            ))}
            <Link
              href="/studio"
              className="group border-2 border-primary/40 hover:border-primary p-8 text-center transition-colors hover:bg-secondary-light"
            >
              <h4 className="font-black text-primary text-base mb-1">{t.home.styles.custom_name}</h4>
              <p className="text-xs text-cream/40 uppercase tracking-widest">{t.home.styles.custom_desc}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary">
              {t.home.steps.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-t-2 border-l-2 border-secondary/10">
            {[
              { num: '01', title: t.home.steps.step1_title, desc: t.home.steps.step1_desc },
              { num: '02', title: t.home.steps.step2_title, desc: t.home.steps.step2_desc },
              { num: '03', title: t.home.steps.step3_title, desc: t.home.steps.step3_desc },
            ].map((step) => (
              <div key={step.num} className="border-b-2 border-r-2 border-secondary/10 p-10">
                <p className="font-black text-8xl text-primary/20 tracking-tighter leading-none mb-6">{step.num}</p>
                <h3 className="font-black text-2xl text-secondary mb-3">{step.title}</h3>
                <p className="text-secondary-lighter leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-cream py-20 px-4 border-t-2 border-secondary/10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.pricing.title}
            </h2>
            <p className="text-lg text-secondary-lighter">{t.home.pricing.subtitle}</p>
          </div>

          <div className="border-t-2 border-secondary mb-8">
            <div className="flex items-center justify-between border-b-2 border-secondary/10 py-6 px-4 hover:bg-secondary/[0.03] transition-colors">
              <div>
                <h4 className="font-bold text-secondary text-lg">{t.home.pricing.one_torso}</h4>
                <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.one_torso_desc}</p>
              </div>
              <span className="font-black text-4xl text-secondary tracking-tighter">{fmt(15)}</span>
            </div>

            <div className="flex items-center justify-between border-b-2 border-secondary/10 py-6 px-4 hover:bg-secondary/[0.03] transition-colors">
              <div>
                <h4 className="font-bold text-secondary text-lg">{t.home.pricing.one_full}</h4>
                <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.one_full_desc}</p>
              </div>
              <span className="font-black text-4xl text-secondary tracking-tighter">{fmt(25)}</span>
            </div>

            <div className="flex items-center justify-between border-b-2 border-secondary/10 py-6 px-4 hover:bg-secondary/[0.03] transition-colors">
              <div>
                <h4 className="font-bold text-secondary text-lg">{t.home.pricing.background}</h4>
                <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.background_desc}</p>
              </div>
              <span className="font-black text-4xl text-secondary tracking-tighter">+{fmt(15)}</span>
            </div>
          </div>

          <div className="bg-secondary p-8 mb-8">
            <p className="text-cream/60 text-sm uppercase tracking-widest mb-2">{t.home.pricing.example}</p>
            <p className="text-cream/40 text-sm mb-4">{t.home.pricing.example_calc}</p>
            <p className="font-black text-6xl text-primary tracking-tighter">{fmt(65)}</p>
          </div>

          <Link
            href="/studio"
            className="w-full block text-center bg-secondary px-8 py-5 font-black text-white text-lg hover:bg-secondary-light transition-colors"
          >
            {t.home.pricing.cta}
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsScroll />

      {/* CTA Final */}
      <section className="bg-secondary py-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-black text-5xl md:text-6xl tracking-tighter text-cream mb-6 leading-[0.95]">
            {t.home.cta_final.title}
          </h2>
          <p className="text-lg text-cream/50 mb-10 max-w-lg">
            {t.home.cta_final.subtitle}
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 bg-primary px-10 py-5 font-black text-secondary hover:bg-primary-dark transition-colors text-lg"
          >
            {t.home.cta_final.cta}
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
