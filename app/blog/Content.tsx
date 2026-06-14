'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePageText } from '@/lib/i18n/pageContent';
import { blogContent } from '@/lib/i18n/pages/blog';

// Chrome traducible de /blog. La lista de artículos se renderiza en el
// servidor (page.tsx) por SEO y llega aquí como children.
export default function Content({ children }: { children: React.ReactNode }) {
  const tx = usePageText('blog', blogContent);

  return (
    <>
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">{tx.badge}</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {tx.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {children}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            {tx.cta_title}
          </h2>
          <p className="text-white/70 mb-8">{tx.cta_subtitle}</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark transition-all hover:shadow-xl"
          >
            {tx.cta_button}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
