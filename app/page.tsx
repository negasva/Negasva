import Link from 'next/link';
import { Clock, RefreshCcw, PenTool } from 'lucide-react';
import { POD_PRODUCTS } from '@/lib/pricing/products';
import ProductIcon from '@/components/ProductIcon';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';
import { HeroPortraits, StepsPortraits, WeeklyOrdersBadge, HomeFaq, StickyOrderCta } from './home-islands';

// Server component: la home llega como HTML estático en inglés (SEO).
// Lo interactivo (fetch de config, FAQ, sticky CTA) vive en ./home-islands.tsx.

const STEPS = [
  { step: 1, title: 'Choose your style', desc: 'Pick your favourite cartoon style, how many people or pets, and the background you want.' },
  { step: 2, title: 'Upload your photos', desc: 'A clear photo of each person + your pose and detail instructions.' },
  { step: 3, title: 'Receive it in 48h', desc: 'Your hand-drawn illustration arrives by email within 48 hours, ready to print and gift.' },
];

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

export default function Home() {
  const orderHref = '/order';

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
              Portraits from $15
            </div>

            {/* H1 with animated sketch underline */}
            <h1 className="font-black text-[30px] sm:text-[46px] md:text-[62px] leading-[1.08] md:leading-[1.02] mb-2 tracking-tight break-words">
              Custom Cartoon Portrait,
              <span className="relative inline-block text-primary-dark ml-2">
                Hand-Drawn
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
              <span className="block mt-3">from your photo — no AI.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-secondary-lighter max-w-[480px] mt-6 sm:mt-9 mb-7 sm:mb-8">
              Turn your photo into an iconic cartoon character — Simpsons style, Rick and Morty style and more.
              100% hand-drawn by a real artist and delivered in 48 hours, from $15.
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-7">
              <Link
                href={orderHref}
                className="inline-flex items-center gap-2.5 bg-primary text-white font-black text-lg sm:text-xl px-8 sm:px-11 py-4 sm:py-5 rounded-[14px] shadow-[0_14px_34px_rgba(252,144,182,0.5)] hover:bg-primary-dark hover:scale-[1.03] transition-all"
              >
                Order my portrait →
              </Link>
              <a
                href="#pasos"
                className="font-bold text-sm text-secondary underline underline-offset-4 decoration-primary decoration-2"
              >
                See how it works
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 items-baseline flex-wrap">
              <span><span className="font-black text-[22px]">1.8M</span> <span className="text-[13px] text-secondary-lighter">TikTok</span></span>
              <span><span className="font-black text-[22px]">50K</span> <span className="text-[13px] text-secondary-lighter">Instagram</span></span>
              <span><span className="font-black text-[22px]">+1000</span> <span className="text-[13px] text-secondary-lighter">happy clients</span></span>
            </div>
            <WeeklyOrdersBadge />
          </div>

          {/* Right (desktop) / Above H1 (mobile): floating portrait photos */}
          <div className="relative pt-4 md:pt-2 md:pb-10 order-first md:order-none flex justify-center md:block">
            <HeroPortraits />
            <span className="font-caveat font-bold text-[30px] text-green-600 rotate-[-4deg] hidden md:inline-block absolute bottom-0 left-1">
              make them laugh!
            </span>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto max-w-[900px] mt-10 sm:mt-14 flex justify-center gap-x-6 gap-y-3 sm:gap-11 flex-wrap">
          {[
            { icon: <Clock className="w-5 h-5 text-primary" />, text: 'Delivered in 48 hours' },
            { icon: <RefreshCcw className="w-5 h-5 text-primary" />, text: 'Unlimited revisions' },
            { icon: <PenTool className="w-5 h-5 text-primary" />, text: '100% hand-drawn — no AI' },
          ].map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 font-bold text-[15px]">
              {icon} {text}
            </span>
          ))}
        </div>
      </section>

      {/* ══ BRUSH DIVIDER (below hero only) ══ */}
      <BrushDividerDown />

      {/* ══ 3 SIMPLE STEPS ══ */}
      <section id="pasos" className="bg-[#FFF1F7] pt-10 pb-14 sm:py-16 md:py-20 px-6">
        <div className="mx-auto max-w-[1150px] grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-center">
          <StepsPortraits />

          {/* Right: headline + steps */}
          <div>
            <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] leading-[1.1] md:leading-[1.08] mb-10">
              Create your personalized gift portrait in{' '}
              <span className="relative inline-block px-2 py-1">
                3 simple steps
                <svg viewBox="0 0 320 90" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: '-8px -12px', width: 'calc(100% + 24px)', height: 'calc(100% + 16px)', overflow: 'visible' }}>
                  <path d="M20 45 C 10 12, 150 2, 250 14 C 320 24, 316 66, 220 78 C 120 88, 18 80, 20 48" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" opacity={0.85} />
                </svg>
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-x-10">
              {STEPS.map((step, i) => (
                <div key={step.step}>
                  <h3 className="flex items-center gap-2.5 font-black text-[19px] mb-2">
                    <span
                      className="w-[34px] h-[34px] rounded-full bg-primary text-white flex items-center justify-center text-base font-black"
                      style={{ transform: `rotate(${[-4, 3, -2][i] ?? 0}deg)` }}
                    >
                      {step.step}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-secondary-lighter">{step.desc}</p>
                </div>
              ))}
              <div className="flex items-center">
                <Link
                  href={orderHref}
                  className="inline-flex items-center gap-2 bg-secondary text-white font-black text-[15px] px-7 py-4 rounded-xl hover:bg-secondary-light transition-colors"
                >
                  Start now →
                </Link>
              </div>
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
              new
            </span>
            <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] leading-[1.1] md:leading-[1.08] mb-5">
              Your drawing, on anything{' '}
              <span className="relative inline-block text-primary-dark">
                you want
                <svg className="sketch-anim" viewBox="0 0 300 24" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: '-14px', width: '100%', height: '24px', overflow: 'visible' }}>
                  <path d="M4 10 C 70 4, 180 2, 296 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-[17px] leading-relaxed text-secondary-lighter max-w-[420px] mt-8 mb-6">
              Beyond the digital file, put your custom portrait on real printed products — mugs, t-shirts, canvas and more — shipped to your door.
            </p>
            <div className="flex flex-col gap-2.5 mb-7">
              {['Digital file always included', 'Print on demand', 'Shipped to your door'].map((text) => (
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
              See products
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
                <p className="font-black text-secondary text-sm leading-tight">{p.name.en}</p>
                <p className="text-xs text-primary-dark font-bold mt-1">from ${p.priceUsd}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="bg-white pb-24 px-6">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-black text-[30px] sm:text-[38px] md:text-[46px] text-center mb-2">Transparent Pricing</h2>
          <p className="text-center text-[17px] text-secondary-lighter mb-12">No surprises, no hidden fees</p>

          <div className="grid md:grid-cols-2 gap-9">
            {/* Torso */}
            <div className="caja-flotante">
              <div className="forma-cuadro1 bg-[#FFF1F7] px-9 pt-12 pb-10 text-center">
                <h4 className="font-black text-[21px] mb-1">One Person — Torso</h4>
                <p className="text-sm text-secondary-lighter mb-4">Bust up to the waist</p>
                <p className="font-black text-[52px] text-primary-dark mb-6">$15</p>
                <Link href={orderHref} className="block bg-secondary text-white font-black py-4 rounded-xl hover:bg-secondary-light transition-colors">
                  Create My Portrait Now →
                </Link>
              </div>
            </div>

            {/* Full body — popular */}
            <div className="relative flota-suave">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                ★ Most popular
              </span>
              <div className="caja-flotante-glow">
                <div className="forma-cuadro2 forma-varia bg-white px-9 pt-12 pb-10 text-center">
                  <h4 className="font-black text-[21px] mb-1">One Person — Full Body</h4>
                  <p className="text-sm text-secondary-lighter mb-4">Full body character</p>
                  <p className="font-black text-[52px] text-primary-dark mb-6">$25</p>
                  <Link href={orderHref} className="block bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-colors">
                    Create My Portrait Now →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-secondary-lighter mt-7">
            Custom Background: +$15 · Custom scene or background
          </p>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <TestimonialsScroll />

      {/* ══ FAQ ══ */}
      <HomeFaq />

      {/* ══ BRUSH DIVIDER (above CTA/footer) ══ */}
      <BrushDividerUp />

      {/* ══ FINAL CTA ══ */}
      <section className="bg-[#FFF1F7] py-20 px-6 text-center">
        <div className="mx-auto max-w-[680px]">
          <h2 className="font-black text-[32px] sm:text-[40px] md:text-[48px] leading-[1.1] md:leading-[1.08] mb-5">
            Ready to turn your photo into{' '}
            <span className="relative inline-block text-primary-dark">
              cartoon art
              <svg className="sketch-anim" viewBox="0 0 120 22" aria-hidden="true" style={{ position: 'absolute', left: '-2px', bottom: '-12px', width: '104%', height: '22px', overflow: 'visible' }}>
                <path d="M4 10 C 30 4, 80 2, 116 8" fill="none" stroke="#FC90B6" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>?
          </h2>
          <p className="text-[17px] leading-relaxed text-secondary-lighter mb-8">
            Over 1,000 hand-drawn portraits delivered. Have a special idea not in the shop? Write to us — we are here to draw it.
          </p>
          <div className="inline-flex items-center bg-white rounded-[14px] p-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.08)]">
            <Link href={orderHref} className="bg-primary text-white font-black text-[17px] px-8 py-4 rounded-[10px] hover:bg-primary-dark transition-colors">
              Order my portrait
            </Link>
            <span className="text-[13px] text-secondary-lighter px-3">or</span>
            <Link href="/contacto" className="font-black text-[15px] px-5 py-4 underline underline-offset-4 decoration-primary">
              Ask me!
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />

      {/* ══ STICKY CTA (mobile only) ══ */}
      <StickyOrderCta />
    </div>
  );
}
