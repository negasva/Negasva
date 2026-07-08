'use client';

// Islas cliente de la home: todo lo que necesita fetch, scroll o estado vive
// aquí; el resto de la página es un server component estático (SEO).

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Flame } from 'lucide-react';
import { useAutoTranslate } from '@/lib/i18n/useAutoTranslate';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { siteImg, type SiteImages } from '@/lib/siteImages';

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
        Photo here
      </div>
    </div>
  );
}

function useSiteImages(): SiteImages | undefined {
  const [images, setImages] = useState<SiteImages | undefined>();
  useEffect(() => {
    cachedFetchJSON<{ site_images?: SiteImages }>('/api/landing-config', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((data) => setImages(data?.site_images))
      .catch(() => null);
  }, []);
  return images;
}

// ── Hero: fotos antes/después configurables desde el admin ──────────────────
export function HeroPortraits() {
  const si = useSiteImages();
  const img1 = siteImg(si, 'landing_hero_img1', undefined);
  const img2 = siteImg(si, 'landing_hero_img2', undefined);
  return (
    <div className="flex items-end">
      <div className="relative z-10 flota-retrato-a">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 bg-primary text-white font-black text-xs px-4 py-1.5 rounded-full rotate-[-3deg] shadow-md whitespace-nowrap">
          Before
        </span>
        {img1 ? (
          <div className="w-[240px] h-[317px] rounded-[120px] sm:w-[360px] sm:h-[475px] sm:rounded-[180px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img1} alt="Original photo before being turned into a custom cartoon portrait" className="w-full h-full object-cover" fetchPriority="high" />
          </div>
        ) : (
          <ImgSlot className="w-[240px] h-[317px] rounded-[120px] sm:w-[360px] sm:h-[475px] sm:rounded-[180px] shadow-[0_18px_40px_rgba(0,0,0,0.14)]" />
        )}
      </div>
      <div className="relative z-0 -ml-6 sm:-ml-9 mt-[48px] sm:mt-[70px] flota-retrato-b">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 bg-secondary text-white font-black text-xs px-4 py-1.5 rounded-full rotate-[3deg] shadow-md whitespace-nowrap">
          After
        </span>
        {img2 ? (
          <div className="w-[214px] h-[283px] rounded-[107px] sm:w-[317px] sm:h-[418px] sm:rounded-[159px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img2} alt="Custom cartoon portrait hand drawn from photo by a real artist" className="w-full h-full object-cover" fetchPriority="high" />
          </div>
        ) : (
          <ImgSlot className="w-[214px] h-[283px] rounded-[107px] sm:w-[317px] sm:h-[418px] sm:rounded-[159px] shadow-[0_18px_40px_rgba(0,0,0,0.14)]" />
        )}
      </div>
    </div>
  );
}

// ── Sección pasos: fotos configurables ───────────────────────────────────────
export function StepsPortraits() {
  const si = useSiteImages();
  const img1 = siteImg(si, 'landing_paso_img1', undefined);
  const img2 = siteImg(si, 'landing_paso_img2', undefined);
  return (
    <>
      {/* Mobile */}
      <div className="flex md:hidden justify-center items-end">
        <div className="relative z-10 rotate-[-3deg]">
          {img1 ? (
            <div className="w-[188px] h-[250px] rounded-[94px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img1} alt="Custom cartoon style portrait hand drawn from photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <ImgSlot className="w-[188px] h-[250px] rounded-[94px] shadow-[0_16px_36px_rgba(0,0,0,0.13)]" />
          )}
        </div>
        <div className="relative z-0 -ml-5 mt-8 rotate-[2deg]">
          {img2 ? (
            <div className="w-[169px] h-[225px] rounded-[85px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img2} alt="Custom cartoon couple portrait hand drawn from photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <ImgSlot className="w-[169px] h-[225px] rounded-[85px] shadow-[0_16px_36px_rgba(0,0,0,0.13)]" />
          )}
        </div>
      </div>
      {/* Desktop */}
      <div className="relative min-h-[450px] hidden md:block">
        <div className="absolute top-0 left-[4%] rotate-[-3deg] z-10">
          {img1 ? (
            <div className="w-[300px] h-[400px] rounded-[150px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img1} alt="Custom cartoon style portrait hand drawn from photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <ImgSlot style={{ width: 300, height: 400, borderRadius: 150, boxShadow: '0 16px 36px rgba(0,0,0,0.13)' }} />
          )}
        </div>
        <div className="absolute top-[138px] left-[46%] rotate-[2deg] z-0">
          {img2 ? (
            <div className="w-[275px] h-[375px] rounded-[137px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.13)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img2} alt="Custom cartoon couple portrait hand drawn from photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <ImgSlot style={{ width: 275, height: 375, borderRadius: 137, boxShadow: '0 16px 36px rgba(0,0,0,0.13)' }} />
          )}
        </div>
      </div>
    </>
  );
}

// ── Badge "N portraits ordered this week" ────────────────────────────────────
export function WeeklyOrdersBadge() {
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  useEffect(() => {
    cachedFetchJSON<{ weekly_orders: number }>('/api/public-stats')
      .then((data) => { if (data) setWeeklyOrders(data.weekly_orders); })
      .catch(() => null);
  }, []);
  if (weeklyOrders < 3) return null;
  return (
    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-secondary-lighter bg-primary-lighter/40 rounded-full px-4 py-1.5">
      <Flame className="w-4 h-4 shrink-0 text-primary" />
      {weeklyOrders} portraits ordered this week
    </div>
  );
}

// ── FAQ acordeón (contenido del admin, traducido client-side) ────────────────
interface ApiFaq { id: string; question: string; answer: string; }

export function HomeFaq({ heading, seeAllLabel }: { heading: string; seeAllLabel: string }) {
  const [faqs, setFaqs] = useState<ApiFaq[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Sin caché: las FAQs las edita el admin y deben verse al instante.
    cachedFetchJSON<ApiFaq[]>('/api/faqs', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((data) => { if (Array.isArray(data)) setFaqs(data.slice(0, 5)); })
      .catch(() => null);
  }, []);

  const faqFlatSrc = faqs.flatMap((f) => [f.question, f.answer]);
  const { translated: faqFlatTr } = useAutoTranslate(faqFlatSrc);
  const faqsT = faqs.map((f, i) => ({
    ...f,
    question: faqFlatTr[i * 2] ?? f.question,
    answer: faqFlatTr[i * 2 + 1] ?? f.answer,
  }));

  if (faqsT.length === 0) return null;
  return (
    <section className="bg-white pb-20 px-6">
      <div className="mx-auto max-w-[720px]">
        <h2 className="font-black text-[30px] sm:text-[40px] text-center mb-9">
          {heading}
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
            {seeAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── CTA fija en móvil al hacer scroll ────────────────────────────────────────
// ponytail: CSS transition en vez de framer-motion; mismo efecto, menos JS.
export function StickyOrderCta({ label, href }: { label: string; href: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-primary-lighter shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out ${show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
      style={{ pointerEvents: show ? 'auto' : 'none' }}
    >
      <Link
        href={href}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-white text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
      >
        {label}
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
