import Link from 'next/link';
import Image from 'next/image';
import { Clock, RefreshCcw, PenTool } from 'lucide-react';
import { getHomeContent } from '@/lib/content/homeContent.server';
import { getHomeStyles } from '@/lib/content/stylesDb';
import { getPodProductsConfig } from '@/lib/content/podProducts.server';
import { getSiteImages } from '@/lib/siteImages.server';
import { POD_PLACEHOLDER_IMG } from '@/lib/content/podProducts';
import { loadPricingConfig } from '@/lib/pricing/server';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';
import GalleryMarquee from '@/components/GalleryMarquee';
import MainCartAddButton from '@/components/MainCartAddButton';
import { HeroPortraits, StepsPortraits, WeeklyOrdersBadge, HomeFaq, StickyOrderCta } from './home-islands';

// Server component: la home llega como HTML estático en inglés (SEO).
// El contenido editable viene de landing_config ('home_content') vía
// getHomeContent(); los precios de las tablas prices/body_types. ISR + los
// endpoints del admin hacen revalidatePath('/') al guardar, así que los
// cambios se ven de inmediato sin redeploy. Lo interactivo (fetch de config,
// FAQ, sticky CTA) vive en ./home-islands.tsx.
export const revalidate = 300;

// Enlaces a las landings de sujeto/ocasión (lib/content/landings.ts) con
// etiquetas cortas para chips — el h1 completo de cada landing es muy largo.
// Se mantienen en código a propósito: son enlazado interno SEO acoplado a las
// rutas, no copy de marketing.
const GIFT_LINKS = [
  { href: '/custom-couple-portrait', label: 'Couples' },
  { href: '/custom-family-portrait', label: 'Families' },
  { href: '/custom-pet-portrait', label: 'Pet lovers' },
  { href: '/memorial-portrait', label: 'A memorial' },
  { href: '/gifts/christmas', label: 'Christmas' },
  { href: '/gifts/anniversary', label: 'Anniversaries' },
  { href: '/gifts/valentines-day', label: "Valentine's Day" },
  { href: '/gifts/birthday', label: 'Birthdays' },
  { href: '/gifts/mothers-day', label: "Mother's Day" },
  { href: '/gifts/fathers-day', label: "Father's Day" },
  { href: '/gifts/wedding', label: 'Weddings' },
  { href: '/hand-drawn-no-ai', label: 'No-AI believers' },
];

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

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

export default async function Home() {
  const [content, pricing, homeStyles, podProducts, siteImages] = await Promise.all([
    getHomeContent(),
    loadPricingConfig(),
    getHomeStyles(),
    getPodProductsConfig(),
    getSiteImages(),
  ]);
  const t = content.texts;
  const visibleProducts = podProducts.filter((p) => p.visible);
  const torsoUsd = pricing.perPersonUsd.torso_only ?? 15;
  const fullUsd = pricing.perPersonUsd.full_body ?? 25;
  const trustIcons = [
    <Clock key="c" className="w-5 h-5 text-primary" />,
    <RefreshCcw key="r" className="w-5 h-5 text-primary" />,
    <PenTool key="p" className="w-5 h-5 text-primary" />,
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative bg-white pt-6 pb-16 md:py-[72px] px-6 overflow-hidden">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-primary text-white font-black text-sm sm:text-lg px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-[0_10px_30px_rgba(252,144,182,0.45)] pulso-badge mb-5 sm:mb-7">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M3 11 L11 3 L20 3 L20 12 L12 20 Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="15.5" cy="7.5" r="1.6" fill="#fff" />
              </svg>
              {t.hero_badge}
            </div>

            {/* H1 with animated sketch underline */}
            <h1 className="font-black text-[30px] sm:text-[46px] md:text-[62px] leading-[1.08] md:leading-[1.02] mb-2 tracking-tight break-words">
              {t.hero_headline}
              <span className="relative inline-block text-primary-dark ml-2">
                {t.hero_highlight}
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
              <span className="block mt-3">{t.hero_tail}</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-secondary-lighter max-w-[480px] mt-6 sm:mt-9 mb-7 sm:mb-8">
              {t.hero_subheadline}
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-7">
              <Link
                href={t.hero_cta_href}
                className="inline-flex items-center gap-2.5 bg-primary text-white font-black text-lg sm:text-xl px-8 sm:px-11 py-4 sm:py-5 rounded-[14px] shadow-[0_14px_34px_rgba(252,144,182,0.5)] hover:bg-primary-dark hover:scale-[1.03] transition-all"
              >
                {t.hero_cta_label}
              </Link>
              <a
                href={t.hero_cta2_href}
                className="font-bold text-sm text-secondary underline underline-offset-4 decoration-primary decoration-2"
              >
                {t.hero_cta2_label}
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 items-baseline flex-wrap">
              {content.stats.map((s) => (
                <span key={`${s.value}-${s.label}`}>
                  <span className="font-black text-[22px]">{s.value}</span>{' '}
                  <span className="text-[13px] text-secondary-lighter">{s.label}</span>
                </span>
              ))}
            </div>
            <WeeklyOrdersBadge />
          </div>

          {/* Right (desktop) / Above H1 (mobile): floating portrait photos */}
          <div className="relative pt-4 md:pt-2 md:pb-10 order-first md:order-none flex justify-center md:block">
            <HeroPortraits initialImages={siteImages} />
            <span className="font-caveat font-bold text-[30px] text-green-600 rotate-[-4deg] hidden md:inline-block absolute bottom-0 left-1">
              {t.hero_note}
            </span>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto max-w-[900px] mt-10 sm:mt-14 flex justify-center gap-x-6 gap-y-3 sm:gap-11 flex-wrap">
          {content.trust.map((text, i) => (
            <span key={text} className="inline-flex items-center gap-2 font-bold text-[15px]">
              {trustIcons[i % trustIcons.length]} {text}
            </span>
          ))}
        </div>
      </section>

      {/* ══ BRUSH DIVIDER (below hero only) ══ */}
      <BrushDividerDown />

      {/* ══ 3 SIMPLE STEPS ══ */}
      <section id="pasos" className="bg-[#FFF1F7] pt-10 pb-14 sm:py-16 md:py-20 px-6">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-center">
          <StepsPortraits initialImages={siteImages} />

          {/* Right: headline + steps */}
          <div>
            <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] leading-[1.1] md:leading-[1.08] mb-10">
              {t.steps_heading}{' '}
              <span className="relative inline-block px-2 py-1">
                {t.steps_highlight}
                <svg viewBox="0 0 320 90" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: '-8px -12px', width: 'calc(100% + 24px)', height: 'calc(100% + 16px)', overflow: 'visible' }}>
                  <path d="M20 45 C 10 12, 150 2, 250 14 C 320 24, 316 66, 220 78 C 120 88, 18 80, 20 48" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" opacity={0.85} />
                </svg>
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-x-10">
              {content.steps.map((step, i) => (
                <div key={i}>
                  <h3 className="flex items-center gap-2.5 font-black text-[19px] mb-2">
                    <span
                      className="w-[34px] h-[34px] rounded-full bg-primary text-white flex items-center justify-center text-base font-black"
                      style={{ transform: `rotate(${[-4, 3, -2][i] ?? 0}deg)` }}
                    >
                      {i + 1}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-secondary-lighter">{step.desc}</p>
                </div>
              ))}
              <div className="flex items-center">
                <Link
                  href={t.steps_cta_href}
                  className="inline-flex items-center gap-2 bg-secondary text-white font-black text-[15px] px-7 py-4 rounded-xl hover:bg-secondary-light transition-colors"
                >
                  {t.steps_cta_label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GALLERY MARQUEE (below the fold, lazy) ══ */}
      <GalleryMarquee />

      {/* ══ STYLES + GIFT LANDINGS (server-rendered internal links, SEO) ══ */}
      <section className="bg-white py-16 md:py-20 px-6">
        <div className="mx-auto max-w-[1150px]">
          <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] text-center mb-2">
            {t.styles_heading}
          </h2>
          <p className="text-center text-[17px] text-secondary-lighter mb-10">
            {t.styles_subtitle}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {homeStyles.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="group rounded-2xl border-2 border-primary-lighter bg-white overflow-hidden hover:border-primary hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-[#FFF1F7]">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform"
                  />
                </div>
                <p className="font-black text-secondary text-sm sm:text-base p-4 text-center group-hover:text-primary-dark transition-colors">
                  {s.name}
                </p>
              </Link>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link href="/styles" className="font-black text-[15px] underline underline-offset-4 decoration-primary decoration-2">
              {t.styles_see_all}
            </Link>
          </p>

          {/* Perfect gift for… — internal links to subject/occasion landings */}
          <div className="mt-14 text-center">
            <h3 className="font-black text-[22px] sm:text-[26px] mb-6">{t.gifts_heading}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {GIFT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border-2 border-primary-lighter px-5 py-2.5 text-sm font-bold text-secondary hover:border-primary hover:text-primary-dark transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ YOUR DRAWING ON ANYTHING (POD) ══ */}
      <section className="bg-white py-20 md:py-24 px-6">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1fr_1.15fr] gap-16 items-start">
          {/* Left: sticky info */}
          <div className="md:sticky md:top-24">
            <span className="font-caveat font-bold text-[28px] text-primary-dark inline-block rotate-[-2deg] mb-2">
              {t.pod_badge}
            </span>
            <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] leading-[1.1] md:leading-[1.08] mb-5">
              {t.pod_heading}{' '}
              <span className="relative inline-block text-primary-dark">
                {t.pod_highlight}
                <svg className="sketch-anim" viewBox="0 0 300 24" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: '-14px', width: '100%', height: '24px', overflow: 'visible' }}>
                  <path d="M4 10 C 70 4, 180 2, 296 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-[17px] leading-relaxed text-secondary-lighter max-w-[420px] mt-8 mb-6">
              {t.pod_body}
            </p>
            <div className="flex flex-col gap-2.5 mb-7">
              {content.pod_bullets.map((text) => (
                <span key={text} className="inline-flex items-center gap-2.5 font-bold text-[15px]">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M4 13 L10 19 L20 5" fill="none" stroke="#1FA971" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
            <Link
              href={t.pod_cta_href}
              className="inline-flex items-center gap-2 bg-primary text-white font-black text-[17px] px-8 py-4 rounded-xl shadow-[0_10px_26px_rgba(252,144,182,0.4)] hover:bg-primary-dark transition-all"
            >
              {t.pod_cta_label}
            </Link>
          </div>

          {/* Right: product grid — editable image cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {visibleProducts.map((p, i) => (
              <div
                key={p.key}
                className="rounded-2xl border-2 border-primary-lighter bg-white p-5 text-center hover:border-primary hover:shadow-md transition-all"
                style={{ transform: `rotate(${[0, -1.2, 1, -0.8, 1.4, -0.6][i % 6] ?? 0}deg)` }}
              >
                <div className="flex justify-center items-center mb-3 h-16">
                  <Image
                    src={p.image || POD_PLACEHOLDER_IMG}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                </div>
                <p className="font-black text-secondary text-sm leading-tight">{p.name}</p>
                <p className="text-xs text-primary-dark font-bold mt-1">
                  {t.pod_from_label} {usd(pricing.podProductsUsd[p.key] ?? p.priceUsd)}
                </p>
                <MainCartAddButton
                  id={p.key}
                  name={p.name}
                  price={usd(pricing.podProductsUsd[p.key] ?? p.priceUsd)}
                  image={p.image || POD_PLACEHOLDER_IMG}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="bg-white pb-24 px-6">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] text-center mb-2">{t.pricing_heading}</h2>
          <p className="text-center text-[17px] text-secondary-lighter mb-12">{t.pricing_subtitle}</p>

          <div className="grid md:grid-cols-2 gap-9">
            {/* Torso */}
            <div className="caja-flotante">
              <div className="forma-cuadro1 bg-[#FFF1F7] px-9 pt-12 pb-10 text-center">
                <h4 className="font-black text-[21px] mb-1">{t.pricing_torso_title}</h4>
                <p className="text-sm text-secondary-lighter mb-4">{t.pricing_torso_sub}</p>
                <p className="font-black text-[52px] text-primary-dark mb-6">{usd(torsoUsd)}</p>
                <Link href={t.hero_cta_href} className="block bg-secondary text-white font-black py-4 rounded-xl hover:bg-secondary-light transition-colors">
                  {t.pricing_cta_label}
                </Link>
              </div>
            </div>

            {/* Full body — popular */}
            <div className="relative flota-suave">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                {t.pricing_popular_badge}
              </span>
              <div className="caja-flotante-glow">
                <div className="forma-cuadro2 forma-varia bg-white px-9 pt-12 pb-10 text-center">
                  <h4 className="font-black text-[21px] mb-1">{t.pricing_full_title}</h4>
                  <p className="text-sm text-secondary-lighter mb-4">{t.pricing_full_sub}</p>
                  <p className="font-black text-[52px] text-primary-dark mb-6">{usd(fullUsd)}</p>
                  <Link href={t.hero_cta_href} className="block bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-colors">
                    {t.pricing_cta_label}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-secondary-lighter mt-7">
            {t.pricing_bg_label}: +{usd(pricing.backgroundCustomUsd)} · {t.pricing_bg_desc}
          </p>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <TestimonialsScroll reviews={content.testimonials} />

      {/* ══ FAQ ══ */}
      <HomeFaq heading={t.faq_heading} seeAllLabel={t.faq_see_all} />

      {/* ══ BRUSH DIVIDER (above CTA/footer) ══ */}
      <BrushDividerUp />

      {/* ══ FINAL CTA ══ */}
      <section className="bg-[#FFF1F7] py-20 px-6 text-center">
        <div className="mx-auto max-w-[680px]">
          <h2 className="font-black text-[32px] sm:text-[40px] md:text-[48px] leading-[1.1] md:leading-[1.08] mb-5">
            {t.final_heading}{' '}
            <span className="relative inline-block text-primary-dark">
              {t.final_highlight}
              <svg className="sketch-anim" viewBox="0 0 120 22" aria-hidden="true" style={{ position: 'absolute', left: '-2px', bottom: '-12px', width: '104%', height: '22px', overflow: 'visible' }}>
                <path d="M4 10 C 30 4, 80 2, 116 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>?
          </h2>
          <p className="text-[17px] leading-relaxed text-secondary-lighter mb-8">
            {t.final_body}
          </p>
          <div className="inline-flex items-center bg-white rounded-[14px] p-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.08)]">
            <Link href={t.final_cta_href} className="bg-primary text-white font-black text-[17px] px-8 py-4 rounded-[10px] hover:bg-primary-dark transition-colors">
              {t.final_cta_label}
            </Link>
            <span className="text-[13px] text-secondary-lighter px-3">{t.final_or}</span>
            <Link href={t.final_secondary_href} className="font-black text-[15px] px-5 py-4 underline underline-offset-4 decoration-primary">
              {t.final_secondary_label}
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />

      {/* ══ STICKY CTA (mobile only) ══ */}
      <StickyOrderCta label={t.sticky_cta_label} href={t.hero_cta_href} />
    </div>
  );
}
