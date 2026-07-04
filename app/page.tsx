'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Tag, Flame, Clock, RefreshCcw, ImageUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAutoTranslate } from '@/lib/i18n/useAutoTranslate';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { POD_PRODUCTS } from '@/lib/pricing/products';
import ProductIcon from '@/components/ProductIcon';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';
import { siteImg, type SiteImages } from '@/lib/siteImages';

// ── Types & defaults ──────────────────────────────────────────────────────────
interface HeroConfig {
  badge_es: string; badge_en: string; badge_fr?: string;
  headline_es: string; headline_en: string; headline_fr?: string;
  headline_highlight_es: string; headline_highlight_en: string; headline_highlight_fr?: string;
  subheadline_es: string; subheadline_en: string; subheadline_fr?: string;
  cta_primary_es: string; cta_primary_en: string; cta_primary_fr?: string;
  cta_secondary_es: string; cta_secondary_en: string; cta_secondary_fr?: string;
}
interface StepConfig {
  step: number; icon: string;
  title_es: string; title_en: string; title_fr?: string;
  desc_es: string; desc_en: string; desc_fr?: string;
}
interface GalleryImage { url: string; caption: string; }
interface StatConfig { value: string; label_es: string; label_en: string; label_fr?: string; }
interface ApiFaq { id: string; question: string; answer: string; }
interface LandingConfig {
  hero: HeroConfig; how_it_works: StepConfig[]; gallery_images: GalleryImage[];
  stats: StatConfig[]; site_images?: SiteImages;
}

const DEFAULT_CONFIG: LandingConfig = {
  hero: {
    badge_es: 'Ilustración digital personalizada', badge_en: 'Custom digital illustration',
    headline_es: 'Tu retrato,', headline_en: 'Your portrait,',
    headline_highlight_es: 'dibujado a mano', headline_highlight_en: 'hand drawn',
    subheadline_es: 'Convierte tu foto en un retrato estilo cartoon dibujado por un ilustrador real — nada de filtros, nada de IA. Entrega digital en 48 horas.',
    subheadline_en: 'Turn your photo into a hand-drawn cartoon portrait by a real illustrator — no filters, no AI. Digital delivery in 48 hours.',
    cta_primary_es: 'Pedir mi retrato', cta_primary_en: 'Order my portrait',
    cta_secondary_es: 'Ver cómo funciona', cta_secondary_en: 'See how it works',
  },
  how_it_works: [
    { step: 1, icon: 'palette', title_es: 'Elige', title_en: 'Choose', desc_es: 'Tu estilo cartoon favorito, cuántas personas o mascotas, y el fondo que quieras.', desc_en: 'Your favourite cartoon style, how many people or pets, and the background you want.' },
    { step: 2, icon: 'camera', title_es: 'Sube tus fotos', title_en: 'Upload your photos', desc_es: 'Una foto clara de cada persona + tus indicaciones de poses y detalles.', desc_en: 'A clear photo of each person + your pose and detail instructions.' },
    { step: 3, icon: 'sparkles', title_es: '¡Recíbelo!', title_en: 'Receive it!', desc_es: 'En 48 horas llega tu ilustración a tu correo, lista para imprimir y regalar.', desc_en: 'Your illustration arrives by email in 48 hours, ready to print and gift.' },
  ],
  gallery_images: [],
  stats: [
    { value: '1.8M', label_es: 'TikTok', label_en: 'TikTok' },
    { value: '50K', label_es: 'Instagram', label_en: 'Instagram' },
    { value: '+1000', label_es: 'clientes felices', label_en: 'happy clients' },
  ],
};

function mergeConfig(data: Partial<LandingConfig>): LandingConfig {
  return {
    hero: { ...DEFAULT_CONFIG.hero, ...data.hero },
    how_it_works: data.how_it_works?.length ? data.how_it_works : DEFAULT_CONFIG.how_it_works,
    gallery_images: data.gallery_images?.length ? data.gallery_images : DEFAULT_CONFIG.gallery_images,
    stats: data.stats?.length ? data.stats : DEFAULT_CONFIG.stats,
    site_images: data.site_images,
  };
}

// ── Brush-stroke SVG dividers ─────────────────────────────────────────────────
function BrushDividerDown() {
  return (
    <div style={{ lineHeight: 0, marginTop: '24px' }} aria-hidden="true">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '56px' }}>
        <path d="M0 40 C 120 12, 260 58, 420 34 C 580 10, 700 52, 880 30 C 1050 10, 1180 54, 1440 26 L1440 70 L0 70 Z" fill="#FFF1F7" />
        <path d="M60 30 C 150 20, 230 40, 330 28" stroke="#FFD0E5" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M900 22 C 1000 14, 1090 34, 1200 20" stroke="#FFD0E5" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function BrushDividerUp() {
  return (
    <div style={{ lineHeight: 0 }} aria-hidden="true">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '56px' }}>
        <path d="M0 34 C 160 60, 300 8, 480 36 C 660 62, 800 14, 990 38 C 1160 58, 1300 16, 1440 40 L1440 70 L0 70 Z" fill="#FFF1F7" />
        <path d="M200 26 C 300 18, 380 36, 480 24" stroke="#FFD0E5" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M1000 30 C 1100 22, 1180 40, 1290 26" stroke="#FFD0E5" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

// ── Image placeholder (shown when real photo not yet uploaded) ────────────────
function ImgSlot({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex items-center justify-center bg-primary-lighter/40 border-2 border-dashed border-primary-lighter text-primary-dark ${className ?? ''}`}
      style={style}
    >
      <div className="flex flex-col items-center gap-2 text-xs font-bold p-3 text-center">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 7 L10 4 L14 4 L16 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="13.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        Foto aquí
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const } }),
};

export default function Home() {
  const { t, lang } = useLanguage();
  const { fmt } = useCurrency();

  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);
  const [faqs, setFaqs] = useState<ApiFaq[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    cachedFetchJSON<Partial<LandingConfig>>('/api/landing-config', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((data) => { if (data) setConfig(mergeConfig(data)); })
      .catch(() => null);
    cachedFetchJSON<ApiFaq[]>('/api/faqs')
      .then((data) => { if (Array.isArray(data)) setFaqs(data.slice(0, 5)); })
      .catch(() => null);
    cachedFetchJSON<{ weekly_orders: number }>('/api/public-stats')
      .then((data) => { if (data) setWeeklyOrders(data.weekly_orders); })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pick = (esVal: string, enVal: string, frVal?: string) =>
    lang === 'fr' ? (frVal ?? enVal ?? esVal) : lang === 'en' ? enVal : esVal;
  const tr = (es: string, en: string, fr: string) =>
    lang === 'fr' ? fr : lang === 'en' ? en : es;

  const orderHref = '/order';
  const hero = config.hero;
  const si = config.site_images;

  // Hero images: use admin-configured photos when set, otherwise placeholders.
  const heroImg1 = siteImg(si, 'landing_hero_img1', undefined);
  const heroImg2 = siteImg(si, 'landing_hero_img2', undefined);
  // "Pasos" images
  const pasosImg1 = siteImg(si, 'landing_paso_img1', undefined);
  const pasosImg2 = siteImg(si, 'landing_paso_img2', undefined);

  const faqFlatSrc = faqs.flatMap((f) => [f.question, f.answer]);
  const { translated: faqFlatTr } = useAutoTranslate(faqFlatSrc);
  const faqsT = faqs.map((f, i) => ({
    ...f,
    question: faqFlatTr[i * 2] ?? f.question,
    answer: faqFlatTr[i * 2 + 1] ?? f.answer,
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative bg-white py-16 md:py-[72px] px-6 overflow-hidden">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-primary text-white font-black text-lg px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(252,144,182,0.45)] pulso-badge mb-7">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M3 11 L11 3 L20 3 L20 12 L12 20 Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="15.5" cy="7.5" r="1.6" fill="#fff" />
              </svg>
              {tr('Retratos desde', 'Portraits from', 'Portraits dès')} {fmt(15)}
            </div>

            {/* H1 with animated sketch underline */}
            <h1 className="font-black text-[58px] md:text-[62px] leading-[1.02] mb-2 tracking-tight">
              {pick(hero.headline_es, hero.headline_en, hero.headline_fr)}
              <span className="relative inline-block text-primary-dark ml-2">
                {pick(hero.headline_highlight_es, hero.headline_highlight_en, hero.headline_highlight_fr)}
                <svg
                  className="sketch-anim"
                  viewBox="0 0 420 36"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-4px', bottom: '-20px', width: '104%', height: '36px', overflow: 'visible' }}
                >
                  <path d="M6 12 C 80 4, 200 2, 412 9" fill="none" stroke="#FC90B6" strokeWidth="6" strokeLinecap="round" />
                  <path d="M20 24 C 120 17, 260 15, 380 21" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" opacity={0.7} />
                </svg>
              </span>
              <span className="block mt-3">
                {tr('trazo a trazo.', 'stroke by stroke.', 'trait par trait.')}
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-secondary-lighter max-w-[480px] mt-9 mb-8">
              {pick(hero.subheadline_es, hero.subheadline_en, hero.subheadline_fr)}
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-7">
              <Link
                href={orderHref}
                className="inline-flex items-center gap-2.5 bg-primary text-white font-black text-xl px-11 py-5 rounded-[14px] shadow-[0_14px_34px_rgba(252,144,182,0.5)] hover:bg-primary-dark hover:scale-[1.03] transition-all"
              >
                {pick(hero.cta_primary_es, hero.cta_primary_en, hero.cta_primary_fr)} →
              </Link>
              <a
                href="#pasos"
                className="font-bold text-sm text-secondary underline underline-offset-4 decoration-primary decoration-2"
              >
                {pick(hero.cta_secondary_es, hero.cta_secondary_en, hero.cta_secondary_fr)}
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 items-baseline flex-wrap">
              <span><span className="font-black text-[22px]">1.8M</span> <span className="text-[13px] text-secondary-lighter">TikTok</span></span>
              <span><span className="font-black text-[22px]">50K</span> <span className="text-[13px] text-secondary-lighter">Instagram</span></span>
              <span><span className="font-black text-[22px]">+1000</span> <span className="text-[13px] text-secondary-lighter">{tr('clientes felices', 'happy clients', 'clients satisfaits')}</span></span>
            </div>
            {weeklyOrders >= 3 && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-secondary-lighter bg-primary-lighter/40 rounded-full px-4 py-1.5">
                <Flame className="w-4 h-4 shrink-0 text-primary" />
                {weeklyOrders} {tr('retratos pedidos esta semana', 'portraits ordered this week', 'portraits commandés cette semaine')}
              </div>
            )}
          </div>

          {/* Right: floating portrait photos */}
          <div className="relative pt-2 pb-10 hidden md:block">
            <div className="flex items-end">
              {/* Portrait 1 */}
              <div className="relative z-10 flota-retrato-a">
                {heroImg1 ? (
                  <div className="w-[250px] h-[330px] rounded-[130px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                    <Image src={heroImg1} alt="Retrato cartoon" fill className="object-cover" sizes="250px" />
                  </div>
                ) : (
                  <ImgSlot style={{ width: 250, height: 330, borderRadius: 130, boxShadow: '0 18px 40px rgba(0,0,0,0.14)' }} />
                )}
                <span className="absolute top-[-8px] right-[-10px] z-20 bg-primary text-white font-black text-xs px-3 py-1.5 rounded-full rotate-6">
                  NEGASVA
                </span>
              </div>
              {/* Portrait 2 */}
              <div className="relative z-0 -ml-9 mt-[70px] flota-retrato-b">
                {heroImg2 ? (
                  <div className="w-[220px] h-[290px] rounded-[115px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                    <Image src={heroImg2} alt="Retrato cartoon ejemplo" fill className="object-cover" sizes="220px" />
                  </div>
                ) : (
                  <ImgSlot style={{ width: 220, height: 290, borderRadius: 115, boxShadow: '0 18px 40px rgba(0,0,0,0.14)' }} />
                )}
              </div>
            </div>
            <span className="font-caveat font-bold text-[30px] text-green-600 rotate-[-4deg] inline-block absolute bottom-0 left-1">
              {tr('¡hazlos reír!', 'make them laugh!', 'faites-les rire !')}
            </span>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto max-w-[900px] mt-14 flex justify-center gap-11 flex-wrap">
          {[
            { icon: <Clock className="w-5 h-5 text-primary" />, text: tr('Preview en 2–3 días', 'Preview in 2–3 days', 'Aperçu en 2–3 jours') },
            { icon: <RefreshCcw className="w-5 h-5 text-primary" />, text: tr('Revisiones ilimitadas', 'Unlimited revisions', 'Révisions illimitées') },
            { icon: <ImageUp className="w-5 h-5 text-primary" />, text: tr('Sube cualquier foto', 'Upload any photo', 'Téléverse n\'importe quelle photo') },
          ].map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 font-bold text-[15px]">
              {icon} {text}
            </span>
          ))}
        </div>
      </section>

      {/* ══ BRUSH DIVIDER (below hero only) ══ */}
      <BrushDividerDown />

      {/* ══ 3 SIMPLES PASOS ══ */}
      <section id="pasos" className="bg-[#FFF1F7] py-16 md:py-20 px-6">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* Left: overlapping portrait images */}
          <div className="relative min-h-[360px] hidden md:block">
            <div className="absolute top-0 left-[4%] rotate-[-3deg] z-10">
              {pasosImg1 ? (
                <div className="w-[240px] h-[320px] rounded-[120px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
                  <Image src={pasosImg1} alt="Ejemplo de retrato" fill className="object-cover" sizes="240px" />
                </div>
              ) : (
                <ImgSlot style={{ width: 240, height: 320, borderRadius: 120, boxShadow: '0 16px 36px rgba(0,0,0,0.13)' }} />
              )}
            </div>
            <div className="absolute top-[110px] left-[46%] rotate-[2deg] z-0">
              {pasosImg2 ? (
                <div className="w-[220px] h-[300px] rounded-[110px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
                  <Image src={pasosImg2} alt="Retrato en pareja" fill className="object-cover" sizes="220px" />
                </div>
              ) : (
                <ImgSlot style={{ width: 220, height: 300, borderRadius: 110, boxShadow: '0 16px 36px rgba(0,0,0,0.13)' }} />
              )}
            </div>
          </div>

          {/* Right: headline + steps */}
          <div>
            <h2 className="font-black text-[40px] md:text-[46px] leading-[1.08] mb-10">
              {tr('Crea tu regalo personalizado en', 'Create your personalised gift in', 'Crée ton cadeau personnalisé en')}
              {' '}
              <span className="relative inline-block px-2 py-1">
                {tr('3 simples pasos', '3 simple steps', '3 étapes simples')}
                <svg viewBox="0 0 320 90" aria-hidden="true" style={{ position: 'absolute', inset: '-8px -12px', width: 'calc(100% + 24px)', height: 'calc(100% + 16px)', overflow: 'visible' }}>
                  <path d="M20 45 C 10 12, 150 2, 250 14 C 320 24, 316 66, 220 78 C 120 88, 18 80, 20 48" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" opacity={0.85} />
                </svg>
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-x-10">
              {(config.how_it_works.length > 0 ? config.how_it_works.slice(0, 3) : DEFAULT_CONFIG.how_it_works).map((step, i) => (
                <motion.div
                  key={step.step}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <h3 className="flex items-center gap-2.5 font-black text-[19px] mb-2">
                    <span
                      className="w-[34px] h-[34px] rounded-full bg-primary text-white flex items-center justify-center text-base font-black"
                      style={{ transform: `rotate(${[-4, 3, -2][i] ?? 0}deg)` }}
                    >
                      {step.step}
                    </span>
                    {pick(step.title_es, step.title_en, step.title_fr)}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-secondary-lighter">{pick(step.desc_es, step.desc_en, step.desc_fr)}</p>
                </motion.div>
              ))}
              <div className="flex items-center">
                <Link
                  href={orderHref}
                  className="inline-flex items-center gap-2 bg-secondary text-white font-black text-[15px] px-7 py-4 rounded-xl hover:bg-secondary-light transition-colors"
                >
                  {tr('Empezar ahora', 'Start now', 'Commencer maintenant')} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TU DIBUJO EN LO QUE QUIERAS (POD) ══ */}
      <section className="bg-white py-20 md:py-24 px-6">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1fr_1.15fr] gap-16 items-start">
          {/* Left: sticky info */}
          <div className="md:sticky md:top-24">
            <span className="font-caveat font-bold text-[28px] text-primary-dark inline-block rotate-[-2deg] mb-2">
              {tr('nuevo', 'new', 'nouveau')}
            </span>
            <h2 className="font-black text-[40px] md:text-[46px] leading-[1.08] mb-5">
              {tr('Tu dibujo, en lo que', 'Your drawing, on anything', 'Ton dessin, sur ce que')}{' '}
              <span className="relative inline-block text-primary-dark">
                {tr('tú quieras', 'you want', 'tu veux')}
                <svg className="sketch-anim" viewBox="0 0 300 24" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: '-14px', width: '100%', height: '24px', overflow: 'visible' }}>
                  <path d="M4 10 C 70 4, 180 2, 296 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-[17px] leading-relaxed text-secondary-lighter max-w-[420px] mt-8 mb-6">
              {tr(
                'Además del archivo digital, lleva tu retrato a productos reales impresos bajo demanda y enviados a tu casa.',
                'Beyond the digital file, put your portrait on real printed products, shipped to your door.',
                'Au-delà du fichier numérique, mets ton portrait sur des produits imprimés à la demande, livrés chez toi.',
              )}
            </p>
            <div className="flex flex-col gap-2.5 mb-7">
              {[
                tr('Archivo digital siempre incluido', 'Digital file always included', 'Fichier numérique toujours inclus'),
                tr('Impresión bajo demanda', 'Print on demand', 'Impression à la demande'),
                tr('Envío a tu puerta', 'Shipped to your door', 'Livraison chez toi'),
              ].map((text) => (
                <span key={text} className="inline-flex items-center gap-2.5 font-bold text-[15px]">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M4 13 L10 19 L20 5" fill="none" stroke="#1FA971" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
            <Link
              href={orderHref}
              className="inline-flex items-center gap-2 bg-primary text-white font-black text-[17px] px-8 py-4 rounded-xl shadow-[0_10px_26px_rgba(252,144,182,0.4)] hover:bg-primary-dark transition-all"
            >
              {tr('Ver productos', 'See products', 'Voir les produits')}
            </Link>
          </div>

          {/* Right: product grid — icon cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {POD_PRODUCTS.map((p, i) => (
              <div
                key={p.key}
                className="rounded-2xl border-2 border-primary-lighter bg-white p-5 text-center hover:border-primary hover:shadow-md transition-all"
                style={{ transform: `rotate(${[0, -1.2, 1, -0.8, 1.4, -0.6][i % 6] ?? 0}deg)` }}
              >
                <div className="flex justify-center mb-3">
                  <ProductIcon productKey={p.key} className="w-9 h-9 text-primary" />
                </div>
                <p className="font-black text-secondary text-sm leading-tight">{p.name[lang]}</p>
                <p className="text-xs text-primary-dark font-bold mt-1">{tr('desde', 'from', 'dès')} {fmt(p.priceUsd)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRECIOS ══ */}
      <section className="bg-white pb-24 px-6">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-black text-[40px] md:text-[46px] text-center mb-2">{t.home.pricing.title}</h2>
          <p className="text-center text-[17px] text-secondary-lighter mb-12">{t.home.pricing.subtitle}</p>

          <div className="grid md:grid-cols-2 gap-9">
            {/* Torso */}
            <div className="caja-flotante">
              <div className="forma-cuadro1 bg-[#FFF1F7] px-9 pt-12 pb-10 text-center">
                <h4 className="font-black text-[21px] mb-1">{t.home.pricing.one_torso}</h4>
                <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_torso_desc}</p>
                <p className="font-black text-[52px] text-primary-dark mb-6">{fmt(15)}</p>
                <Link href={orderHref} className="block bg-secondary text-white font-black py-4 rounded-xl hover:bg-secondary-light transition-colors">
                  {t.home.pricing.cta}
                </Link>
              </div>
            </div>

            {/* Full body — popular */}
            <div className="relative flota-suave">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                ★ {tr('Más popular', 'Most popular', 'Le plus populaire')}
              </span>
              <div className="caja-flotante-glow">
                <div className="forma-cuadro2 forma-varia bg-white px-9 pt-12 pb-10 text-center">
                  <h4 className="font-black text-[21px] mb-1">{t.home.pricing.one_full}</h4>
                  <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_full_desc}</p>
                  <p className="font-black text-[52px] text-primary-dark mb-6">{fmt(25)}</p>
                  <Link href={orderHref} className="block bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-colors">
                    {t.home.pricing.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-secondary-lighter mt-7">
            {t.home.pricing.background}: +{fmt(15)} · {t.home.pricing.background_desc}
          </p>
        </div>
      </section>

      {/* ══ TESTIMONIOS ══ */}
      <TestimonialsScroll />

      {/* ══ FAQ ══ */}
      {faqsT.length > 0 && (
        <section className="bg-white pb-20 px-6">
          <div className="mx-auto max-w-[720px]">
            <h2 className="font-black text-[40px] text-center mb-9">
              {tr('Preguntas frecuentes', 'Frequently asked questions', 'Questions fréquentes')}
            </h2>
            <div className="flex flex-col gap-3">
              {faqsT.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 transition-all duration-200 ${isOpen ? 'border-primary bg-[#FFF1F7] shadow-[0_8px_20px_rgba(252,144,182,0.18)]' : 'border-primary-lighter bg-white hover:border-primary hover:scale-[1.01] hover:rotate-[-0.4deg] hover:shadow-[0_8px_20px_rgba(252,144,182,0.18)]'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className={`font-bold text-base ${isOpen ? 'text-primary-dark' : 'text-secondary'}`}>{item.question}</span>
                      <ChevronDown
                        className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-primary'}`}
                        style={{ width: 20, height: 20, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-[15px] leading-relaxed text-secondary-lighter" style={{ animation: 'faq-abre 0.35s ease-out' }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq" className="font-bold text-primary hover:text-primary-dark underline underline-offset-4">
                {tr('Ver todas las preguntas', 'See all questions', 'Voir toutes les questions')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ BRUSH DIVIDER (above CTA/footer) ══ */}
      <BrushDividerUp />

      {/* ══ CTA FINAL ══ */}
      <section className="bg-[#FFF1F7] py-20 px-6 text-center">
        <div className="mx-auto max-w-[680px]">
          <h2 className="font-black text-[42px] md:text-[48px] leading-[1.08] mb-5">
            {tr('¿Listo para convertir tu foto en', 'Ready to turn your photo into', 'Prêt à transformer ta photo en')}{' '}
            <span className="relative inline-block text-primary-dark">
              {tr('arte', 'art', 'art')}
              <svg className="sketch-anim" viewBox="0 0 120 22" aria-hidden="true" style={{ position: 'absolute', left: '-2px', bottom: '-12px', width: '104%', height: '22px', overflow: 'visible' }}>
                <path d="M4 10 C 30 4, 80 2, 116 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>?
          </h2>
          <p className="text-[17px] leading-relaxed text-secondary-lighter mb-8">
            {tr(
              'Más de 1000 retratos entregados. Si tienes una idea especial que no está en la tienda, escríbenos: estamos para dibujarla.',
              'Over 1,000 portraits delivered. Have a special idea not in the shop? Write to us — we are here to draw it.',
              'Plus de 1 000 portraits livrés. Une idée spéciale hors catalogue ? Écris-nous — nous sommes là pour la dessiner.',
            )}
          </p>
          <div className="inline-flex items-center bg-white rounded-[14px] p-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.08)]">
            <Link href={orderHref} className="bg-primary text-white font-black text-[17px] px-8 py-4 rounded-[10px] hover:bg-primary-dark transition-colors">
              {pick(hero.cta_primary_es, hero.cta_primary_en, hero.cta_primary_fr)}
            </Link>
            <span className="text-[13px] text-secondary-lighter px-3">{tr('o', 'or', 'ou')}</span>
            <Link href="/contacto" className="font-black text-[15px] px-5 py-4 underline underline-offset-4 decoration-primary">
              {tr('¡Pregúntame!', 'Ask me!', 'Pose ta question !')}
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />

      {/* ══ STICKY CTA (mobile only) ══ */}
      <motion.div
        initial={false}
        animate={{ y: showStickyCta ? 0 : 96, opacity: showStickyCta ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-primary-lighter shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
        style={{ pointerEvents: showStickyCta ? 'auto' : 'none' }}
      >
        <Link
          href={orderHref}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-white text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          {pick(hero.cta_primary_es, hero.cta_primary_en, hero.cta_primary_fr)} · {tr('desde', 'from', 'dès')} {fmt(15)}
          <ChevronRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
