'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { usePageText } from '@/lib/i18n/pageContent';
import { useAutoTranslate } from '@/lib/i18n/useAutoTranslate';
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

  // Las FAQ del admin se escriben en español y se traducen solas al idioma activo.
  const flatSrc = (apiFaqs ?? []).flatMap((f) => [f.question, f.answer]);
  const { translated: flatTr } = useAutoTranslate(flatSrc);

  const faqs: { q: string; a: React.ReactNode }[] = apiFaqs
    ? apiFaqs.map((f, i) => ({
        q: flatTr[i * 2] ?? f.question,
        a: renderAnswer(flatTr[i * 2 + 1] ?? f.answer),
      }))
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
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-primary-lighter bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-secondary">{item.q}</h2>
              <div className="mt-3 text-secondary-lighter leading-relaxed">
                {item.a}
              </div>
            </div>
          ))}
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
