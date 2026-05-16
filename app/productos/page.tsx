'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

const PRODUCTS = [
  { name: 'Taza cerámica', emoji: '☕', desc: 'Tu retrato en una taza de 11oz' },
  { name: 'Camiseta', emoji: '👕', desc: 'Estampado vibrante en algodón premium' },
  { name: 'Póster', emoji: '🖼️', desc: 'Papel mate 30×40 cm, listo para enmarcar' },
  { name: 'Lienzo', emoji: '🎨', desc: 'Canvas montado en bastidor de madera' },
  { name: 'Cojín', emoji: '🛋️', desc: 'Funda de 40×40 cm con retrato a doble cara' },
  { name: 'Funda de móvil', emoji: '📱', desc: 'Para iPhone y Android, varios modelos' },
];

export default function ProductosPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

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

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block mb-4 px-3 py-1 bg-secondary text-white text-xs font-black rounded-full tracking-widest">
            PRÓXIMAMENTE
          </span>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Tu retrato en productos físicos
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl mx-auto">
            Pronto podrás llevar tu personaje de NEGASVA a tazas, camisetas, pósters y más.
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
                  PRONTO
                </span>
                <div className="text-6xl mb-4">{p.emoji}</div>
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
            Avísame cuando esté listo
          </h2>
          <p className="text-gray-300 mb-6 text-sm">
            Acceso anticipado y descuento de lanzamiento.
          </p>
          {done ? (
            <div className="bg-primary text-white font-bold rounded-xl py-4 px-6">
              ¡Listo! Te avisamos en cuanto abramos. 🎉
            </div>
          ) : (
            <form onSubmit={notify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="flex-1 rounded-lg px-4 py-3 text-sm text-secondary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                Avísame
              </button>
            </form>
          )}
        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
