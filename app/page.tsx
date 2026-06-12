'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Palette, Upload, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';

// ── Tipos y defaults (fallback si /api/landing-config no responde) ──────────

interface HeroConfig {
  badge_es: string; badge_en: string;
  headline_es: string; headline_en: string;
  headline_highlight_es: string; headline_highlight_en: string;
  subheadline_es: string; subheadline_en: string;
  cta_primary_es: string; cta_primary_en: string;
  cta_secondary_es: string; cta_secondary_en: string;
}
interface StepConfig { step: number; icon: string; title_es: string; title_en: string; desc_es: string; desc_en: string; }
interface GalleryImage { url: string; caption: string; }
interface StatConfig { value: string; label_es: string; label_en: string; }
interface LandingConfig { hero: HeroConfig; how_it_works: StepConfig[]; gallery_images: GalleryImage[]; stats: StatConfig[]; }

const DEFAULT_CONFIG: LandingConfig = {
  hero: {
    badge_es: '✦ Ilustración digital personalizada', badge_en: '✦ Custom digital illustration',
    headline_es: 'Tu Retrato', headline_en: 'Your Portrait,',
    headline_highlight_es: 'Animado', headline_highlight_en: 'Animated',
    subheadline_es: 'Transforma tu foto en un personaje de caricatura icónico. Rick y Morty, Gravity Falls, Los Simpsons y más.',
    subheadline_en: 'Turn your photo into an iconic cartoon character. Rick and Morty, Gravity Falls, The Simpsons and more.',
    cta_primary_es: 'Crear mi retrato', cta_primary_en: 'Create my portrait',
    cta_secondary_es: 'Ver cómo funciona', cta_secondary_en: 'See how it works',
  },
  how_it_works: [
    { step: 1, icon: 'palette', title_es: 'Elige tu estilo', title_en: 'Choose your style', desc_es: 'Rick y Morty, Simpsons, Gravity Falls y más', desc_en: 'Rick and Morty, Simpsons, Gravity Falls and more' },
    { step: 2, icon: 'upload', title_es: 'Sube tu foto', title_en: 'Upload your photo', desc_es: 'Una foto clara de frente es todo lo que necesitas', desc_en: 'A clear front-facing photo is all you need' },
    { step: 3, icon: 'sparkles', title_es: 'Recibe tu retrato', title_en: 'Receive your portrait', desc_es: 'En 48 horas en tu correo, listo para imprimir', desc_en: 'In 48 hours to your email, print-ready' },
  ],
  gallery_images: [
    { url: '/backgrounds/rm-1.jpg', caption: 'Rick & Morty' },
    { url: '/backgrounds/rm-3.jpg', caption: 'Rick & Morty — Garage' },
    { url: '/backgrounds/rm-4.jpg', caption: 'Rick & Morty — Espacio' },
    { url: '/backgrounds/rm-5.jpg', caption: 'Rick & Morty — Planeta C-137' },
    { url: '/backgrounds/rm-6.jpg', caption: 'Rick & Morty — Nave' },
  ],
  stats: [
    { value: '1000+', label_es: 'clientes felices', label_en: 'happy clients' },
    { value: '48h', label_es: 'entrega', label_en: 'delivery' },
    { value: '100%', label_es: 'satisfacción', label_en: 'satisfaction' },
    { value: '4+', label_es: 'estilos', label_en: 'styles' },
  ],
};

const STYLE_CHIPS = [
  { id: 'rick-morty', name: 'Rick & Morty' },
  { id: 'simpsons', name: 'Los Simpsons' },
  { id: 'gravity-falls', name: 'Gravity Falls' },
  { id: 'fairly-odd', name: 'Padrinos Mágicos' },
  { id: 'negasva', name: 'NEGASVA' },
];

const STEP_ICONS: Record<string, typeof Palette> = { palette: Palette, upload: Upload, sparkles: Sparkles };

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
};

export default function Home() {
  const { t, lang } = useLanguage();
  const { fmt } = useCurrency();
  const es = lang !== 'en';

  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    cachedFetchJSON<Partial<LandingConfig>>('/api/landing-config')
      .then((data) => { if (data) setConfig({ ...DEFAULT_CONFIG, ...data }); })
      .catch(() => null);
  }, []);

  const selectStyle = (id: string) => {
    setSelectedStyle(id);
    try { sessionStorage.setItem('preselected_style', id); } catch { /* sessionStorage no disponible */ }
  };

  const orderHref = selectedStyle ? `/order?style=${selectedStyle}` : '/order';
  const hero = config.hero;
  const heroImage = config.gallery_images[0]?.url ?? '/backgrounds/rm-1.jpg';
  const pick = (esVal: string, enVal: string) => (es ? esVal : enVal);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* A — HERO full viewport */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        <Image src={heroImage} alt={config.gallery_images[0]?.caption ?? 'Negasva'} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="inline-block px-4 py-2 bg-primary-lighter rounded-full text-xs font-black text-secondary tracking-widest mb-6">
            {pick(hero.badge_es, hero.badge_en)}
          </span>
          <h1 className="font-black text-5xl sm:text-7xl lg:text-8xl tracking-tighter leading-none mb-6">
            <span className="text-white block">{pick(hero.headline_es, hero.headline_en)}</span>
            <span className="text-primary block">{pick(hero.headline_highlight_es, hero.headline_highlight_en)}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-xl mx-auto mb-8">
            {pick(hero.subheadline_es, hero.subheadline_en)}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href={orderHref} className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark transition-all hover:shadow-2xl text-lg">
              {pick(hero.cta_primary_es, hero.cta_primary_en)}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-4 font-bold text-white hover:bg-white hover:text-secondary transition-colors text-lg">
              {pick(hero.cta_secondary_es, hero.cta_secondary_en)}
            </a>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-white">
            <span><span className="font-black text-xl">1.8M</span> <span className="text-sm text-gray-300">TikTok</span></span>
            <span><span className="font-black text-xl">50K</span> <span className="text-sm text-gray-300">Instagram</span></span>
            <span><span className="font-black text-xl">+1000</span> <span className="text-sm text-gray-300">{es ? 'clientes' : 'clients'}</span></span>
          </div>
        </div>

        <motion.div
          className="absolute bottom-6 z-10 text-white"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* B — HOW IT WORKS funcional */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {es ? 'Así de fácil' : 'This easy'}
            </h2>
            <p className="text-lg text-secondary-lighter">
              {es ? 'Empieza tu pedido aquí mismo' : 'Start your order right here'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {config.how_it_works.map((s, i) => {
              const Icon = STEP_ICONS[s.icon] ?? Sparkles;
              return (
                <motion.div
                  key={s.step}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fadeUp}
                  className="p-6 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      {s.step}
                    </div>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-black text-2xl text-secondary mb-2">{pick(s.title_es, s.title_en)}</h3>
                  <p className="text-secondary-lighter mb-5">{pick(s.desc_es, s.desc_en)}</p>

                  {/* Paso 1: selector de estilo en vivo */}
                  {s.step === 1 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {STYLE_CHIPS.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => selectStyle(style.id)}
                          className={`px-3 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                            selectedStyle === style.id
                              ? 'border-primary bg-primary text-white'
                              : 'border-primary-lighter text-secondary hover:border-primary'
                          }`}
                        >
                          {selectedStyle === style.id && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                          {style.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Paso 2: zona de subida → lleva al wizard */}
                  {s.step === 2 && (
                    <Link
                      href={orderHref}
                      className="mt-auto flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary rounded-xl py-8 px-4 text-center hover:bg-primary-lighter/40 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-primary" />
                      <span className="font-bold text-secondary text-sm">
                        {es ? 'Arrastra tu foto aquí' : 'Drag your photo here'}
                      </span>
                      <span className="text-xs text-secondary-lighter">
                        {es ? 'o haz clic para empezar' : 'or click to start'}
                      </span>
                    </Link>
                  )}

                  {/* Paso 3: ejemplo de resultado */}
                  {s.step === 3 && (
                    <div className="mt-auto relative rounded-xl overflow-hidden h-40">
                      <Image src={heroImage} alt={pick(s.title_es, s.title_en)} fill className="object-cover" />
                      <span className="absolute bottom-2 left-2 bg-primary text-white text-xs font-black px-3 py-1.5 rounded-full">
                        48h · {es ? 'Listo para imprimir' : 'Print-ready'}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href={orderHref} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-10 py-5 font-black text-white hover:bg-secondary-light transition-all hover:shadow-xl text-lg">
              {es ? 'Empezar ahora' : 'Start now'}
              <ChevronRight className="w-5 h-5" />
            </Link>
            {selectedStyle && (
              <p className="text-sm text-secondary-lighter mt-3">
                {es ? 'Estilo seleccionado: ' : 'Selected style: '}
                <span className="font-bold text-primary">{STYLE_CHIPS.find(c => c.id === selectedStyle)?.name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {config.stats.map((stat, i) => (
              <div key={i}>
                <p className="font-black text-4xl text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-secondary-lighter">{pick(stat.label_es, stat.label_en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C — GALLERY marquee */}
      <section className="py-16 overflow-hidden bg-primary-lighter/30">
        <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary text-center mb-10">
          {es ? 'Estilos que enamoran' : 'Styles you’ll love'}
        </h2>
        <div className="flex animate-marquee-left hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {[...config.gallery_images, ...config.gallery_images].map((img, i) => (
            <div key={i} className="relative h-[280px] w-[420px] mx-3 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={img.url} alt={img.caption} fill className="object-cover" sizes="420px" />
              <span className="absolute bottom-3 left-3 text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-full">
                {img.caption}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* D — Testimonios */}
      <TestimonialsScroll />

      {/* E — Precios */}
      <section className="bg-primary-lighter py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.pricing.title}
            </h2>
            <p className="text-lg text-secondary font-semibold">{t.home.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all text-center">
              <h4 className="font-black text-secondary text-xl mb-1">{t.home.pricing.one_torso}</h4>
              <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_torso_desc}</p>
              <p className="font-black text-5xl text-primary mb-6">{fmt(15)}</p>
              <Link href={orderHref} className="block rounded-xl bg-secondary px-6 py-4 font-black text-white hover:bg-secondary-light transition-colors">
                {t.home.pricing.cta}
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-primary hover:shadow-lg transition-all text-center relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full">
                {es ? 'Más popular' : 'Most popular'}
              </span>
              <h4 className="font-black text-secondary text-xl mb-1">{t.home.pricing.one_full}</h4>
              <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_full_desc}</p>
              <p className="font-black text-5xl text-primary mb-6">{fmt(25)}</p>
              <Link href={orderHref} className="block rounded-xl bg-primary px-6 py-4 font-black text-white hover:bg-primary-dark transition-colors">
                {t.home.pricing.cta}
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-secondary-lighter">
            {t.home.pricing.background}: +{fmt(15)} · {t.home.pricing.background_desc}
          </p>
        </div>
      </section>

      {/* F — CTA final */}
      <section className="relative bg-secondary overflow-hidden py-20 px-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full -mr-40"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-6">
            {t.home.cta_final.title}
          </h2>
          <p className="text-lg text-secondary-lighter mb-8">{t.home.cta_final.subtitle}</p>
          <Link
            href={orderHref}
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
