'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Zap, Heart, Share2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';

export default function Home() {
  const { t } = useLanguage();
  const { fmt } = useCurrency();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-white h-[calc(100vh-64px)] overflow-hidden flex">
        {/* Left: Text — distributed top to bottom */}
        <div className="flex flex-col justify-between px-8 sm:px-12 lg:px-20 xl:px-28 w-full md:w-1/2 flex-shrink-0 py-12 lg:py-16">
          {/* Top: badge */}
          <div>
            <div className="inline-block px-4 py-2 bg-primary-lighter rounded-full">
              <span className="text-xs font-black text-secondary tracking-widest">{t.home.hero_badge}</span>
            </div>
          </div>

          {/* Middle: heading + description */}
          <div>
            <h1 className="font-black text-6xl sm:text-7xl lg:text-8xl xl:text-9xl tracking-tighter mb-6 leading-none">
              <span className="text-secondary block">{t.home.title_part1}</span>
              <span className="text-primary block">{t.home.title_part2}</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-secondary-lighter leading-relaxed max-w-md">
              {t.home.subtitle}
            </p>
          </div>

          {/* Bottom: buttons + social proof */}
          <div>
            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-8 py-4 font-black text-white hover:bg-secondary-light transition-all hover:shadow-lg text-lg">
                {t.home.cta_primary}
              </Link>
              <Link href="/galeria" className="inline-flex items-center gap-2 rounded-lg border-2 border-secondary px-8 py-4 font-bold text-secondary hover:bg-secondary hover:text-white transition-colors text-lg">
                {t.home.cta_secondary}
              </Link>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <span className="font-black text-secondary text-2xl">1.8M</span>
                <span className="text-secondary-lighter text-sm ml-2">{t.home.social_tiktok.replace('1.8M ', '').replace('1,8M ', '')}</span>
              </div>
              <div>
                <span className="font-black text-secondary text-2xl">50K</span>
                <span className="text-secondary-lighter text-sm ml-2">{t.home.social_instagram.replace('50K ', '')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: full-bleed image */}
        <div className="hidden md:block flex-1 relative">
          {/* Pig icon floating top-left */}
          <div className="absolute top-8 left-8 z-10 w-14 h-14 bg-primary-lighter rounded-2xl shadow-lg overflow-hidden">
            <Image
              src="/pig-icon.png"
              alt="Negasva"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Full-height image */}
          <Image
            src="/backgrounds/rm-1.jpg"
            alt="Rick & Morty Style"
            fill
            className="object-cover"
            priority
          />

          {/* Label overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-black/40 z-10">
            <span className="text-white font-bold text-base">Rick &amp; Morty Style</span>
          </div>

          {/* +1000 clientes badge */}
          <div className="absolute bottom-10 right-10 z-10 bg-primary rounded-2xl px-6 py-5 shadow-xl">
            <p className="font-black text-3xl text-secondary leading-none">+1000</p>
            <p className="text-sm text-secondary font-bold mt-1">clientes</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-black text-4xl text-primary mb-2">1000+</p>
              <p className="text-sm text-secondary-lighter">{t.home.stats.clients}</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">48h</p>
              <p className="text-sm text-secondary-lighter">{t.home.stats.delivery}</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">100%</p>
              <p className="text-sm text-secondary-lighter">{t.home.stats.satisfaction}</p>
              <p className="text-xs text-secondary-lighter mt-1">{t.home.stats.satisfaction_note}</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">4+</p>
              <p className="text-sm text-secondary-lighter">{t.home.stats.styles}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.why.title}
            </h2>
            <p className="text-lg text-secondary-lighter max-w-2xl mx-auto">
              {t.home.why.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">{t.home.why.fast_title}</h3>
              <p className="text-secondary-lighter">{t.home.why.fast_desc}</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">{t.home.why.quality_title}</h3>
              <p className="text-secondary-lighter">{t.home.why.quality_desc}</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">{t.home.why.personal_title}</h3>
              <p className="text-secondary-lighter">{t.home.why.personal_desc}</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">{t.home.why.social_title}</h3>
              <p className="text-secondary-lighter">
                {t.home.why.social_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Showcase */}
      <section className="bg-secondary-lighter py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-4">
              {t.home.styles.title}
            </h2>
            <p className="text-lg text-secondary-lighter">{t.home.styles.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { name: 'Rick & Morty', desc: 'Sci-fi y aventuras' },
              { name: 'Gravity Falls', desc: 'Misterio y magia' },
              { name: 'Simpsons', desc: 'Clásico y divertido' },
              { name: 'Padrinos Mágicos', desc: 'Fantasía y poder' },
            ].map((style) => (
              <Link
                key={style.name}
                href="/studio"
                className="group relative rounded-2xl overflow-hidden bg-primary p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                <div className="relative">
                  <h4 className="font-black text-white text-lg mb-1">{style.name}</h4>
                  <p className="text-sm text-white font-semibold">{style.desc}</p>
                </div>
              </Link>
            ))}
            <Link
              href="/studio"
              className="group relative rounded-2xl overflow-hidden bg-primary p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-primary border-dashed"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity"></div>
              <div className="relative">
                <Sparkles className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-black text-white text-lg mb-1">{t.home.styles.custom_name}</h4>
                <p className="text-sm text-white font-semibold">{t.home.styles.custom_desc}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.steps.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 bg-primary -z-10"></div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">1</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">{t.home.steps.step1_title}</h3>
              <p className="text-secondary-lighter text-center">{t.home.steps.step1_desc}</p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">2</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">{t.home.steps.step2_title}</h3>
              <p className="text-secondary-lighter text-center">{t.home.steps.step2_desc}</p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">3</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">{t.home.steps.step3_title}</h3>
              <p className="text-secondary-lighter text-center">{t.home.steps.step3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-primary-lighter py-20 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.pricing.title}
            </h2>
            <p className="text-lg text-secondary font-semibold">{t.home.pricing.subtitle}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">{t.home.pricing.one_torso}</h4>
                  <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.one_torso_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">{fmt(15)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">{t.home.pricing.one_full}</h4>
                  <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.one_full_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">{fmt(25)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">{t.home.pricing.background}</h4>
                  <p className="text-sm text-secondary-lighter mt-1">{t.home.pricing.background_desc}</p>
                </div>
                <span className="font-black text-3xl text-primary">+{fmt(15)}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-2xl p-8 text-white mb-8">
            <p className="text-lg font-bold mb-2">{t.home.pricing.example}</p>
            <p className="text-sm text-primary-lighter mb-4">{t.home.pricing.example_calc}</p>
            <p className="font-black text-5xl tracking-tighter">{fmt(65)}</p>
          </div>

          <Link
            href="/studio"
            className="w-full block text-center rounded-xl bg-secondary px-8 py-5 font-black text-white text-lg hover:bg-secondary-light transition-colors shadow-lg hover:shadow-xl"
          >
            {t.home.pricing.cta}
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsScroll />

      {/* CTA Final */}
      <section className="relative bg-secondary overflow-hidden py-20 px-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full -mr-40"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-6">
            {t.home.cta_final.title}
          </h2>
          <p className="text-lg text-secondary-lighter mb-8">
            {t.home.cta_final.subtitle}
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-5 font-black text-white hover:bg-primary-dark transition-all hover:shadow-2xl text-lg"
          >
            {t.home.cta_final.cta}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
