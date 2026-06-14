'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { usePageText } from '@/lib/i18n/pageContent';
import { faqContent } from '@/lib/i18n/pages/faq';

interface ApiFaq {
  id: string;
  question: string;
  answer: string;
}

// Render admin-written answers, supporting [texto](/ruta) links.
function renderAnswer(answer: string) {
  const parts = answer.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={i}>{part}</span>;
    const [, label, href] = match;
    if (href.startsWith('/')) {
      return (
        <Link key={i} href={href} className="text-primary font-bold underline">
          {label}
        </Link>
      );
    }
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
        {label}
      </a>
    );
  });
}

export default function FaqPage() {
  const tx = usePageText('faq', faqContent);
  const [open, setOpen] = useState<number | null>(0);
  const [apiFaqs, setApiFaqs] = useState<ApiFaq[] | null>(null);

  useEffect(() => {
    cachedFetchJSON<ApiFaq[]>('/api/faqs')
      .then((data) => { if (Array.isArray(data) && data.length > 0) setApiFaqs(data); })
      .catch(() => {});
  }, []);

  // Fallback if /api/faqs is unavailable — admin manages the real content
  const FALLBACK_FAQS: { q: string; a: React.ReactNode }[] = [
    { q: tx.faq1_q, a: tx.faq1_a },
    { q: tx.faq2_q, a: tx.faq2_a },
    { q: tx.faq3_q, a: tx.faq3_a },
    { q: tx.faq4_q, a: tx.faq4_a },
    { q: tx.faq5_q, a: tx.faq5_a },
    { q: tx.faq6_q, a: tx.faq6_a },
    { q: tx.faq7_q, a: tx.faq7_a },
    { q: tx.faq8_q, a: tx.faq8_a },
    { q: tx.faq9_q, a: tx.faq9_a },
    {
      q: tx.faq10_q,
      a: (
        <>
          {tx.faq10_a_before}{' '}
          <Link href="/seguimiento" className="text-primary font-bold underline">
            {tx.faq10_a_link_label}
          </Link>{' '}
          {tx.faq10_a_after}
        </>
      ),
    },
  ];

  const faqs: { q: string; a: React.ReactNode }[] = apiFaqs
    ? apiFaqs.map((f) => ({ q: f.question, a: renderAnswer(f.answer) }))
    : FALLBACK_FAQS;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter">
            {tx.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 transition-all ${
                  isOpen ? 'border-primary bg-primary-lighter shadow-md' : 'border-primary-lighter bg-white'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-secondary">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary-lighter flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-secondary-lighter leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-black text-3xl text-white tracking-tighter mb-4">
            {tx.cta_title}
          </h2>
          <p className="text-gray-300 mb-6">
            {tx.cta_subtitle}
          </p>
          <a
            href="https://instagram.com/negasva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            {tx.cta_button}
          </a>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
