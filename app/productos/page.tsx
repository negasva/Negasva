'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { usePageText } from '@/lib/i18n/pageContent';
import { productosContent } from '@/lib/i18n/pages/productos';

export default function ProductosPage() {
  const tx = usePageText('productos', productosContent);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const PRODUCTS = [
    { name: tx.p1_name, desc: tx.p1_desc },
    { name: tx.p2_name, desc: tx.p2_desc },
    { name: tx.p3_name, desc: tx.p3_desc },
    { name: tx.p4_name, desc: tx.p4_desc },
    { name: tx.p5_name, desc: tx.p5_desc },
    { name: tx.p6_name, desc: tx.p6_desc },
  ];

  const notify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'productos-waitlist' }),
      });
    } catch {}
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block mb-4 px-3 py-1 bg-secondary text-white text-xs font-black rounded-full tracking-widest">
            {tx.badge}
          </span>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl mx-auto">
            {tx.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="relative rounded-2xl border-2 border-primary-lighter bg-white p-8 text-center hover:shadow-lg hover:border-primary transition-all"
              >
                <span className="absolute top-3 right-3 bg-secondary text-white text-[10px] font-black px-2 py-1 rounded-full tracking-widest">
                  {tx.card_badge}
                </span>
                <h3 className="font-black text-secondary text-lg mb-2 tracking-tighter">{p.name}</h3>
                <p className="text-sm text-secondary-lighter">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-black text-3xl text-white tracking-tighter mb-3">
            {tx.cta_title}
          </h2>
          <p className="text-gray-300 mb-6 text-sm">
            {tx.cta_subtitle}
          </p>
          {done ? (
            <div className="bg-primary text-white font-bold rounded-xl py-4 px-6">
              {tx.cta_done}
            </div>
          ) : (
            <form onSubmit={notify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tx.cta_placeholder}
                required
                className="flex-1 rounded-lg px-4 py-3 text-sm text-secondary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all whitespace-nowrap"
              >
                {tx.cta_button}
              </button>
            </form>
          )}
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
