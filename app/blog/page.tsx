'use client';

import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const POSTS = [
  { id: 1, title: '¿Cuál es el mejor estilo para ti?', excerpt: 'Descubre cuál de nuestros 4 estilos se adapta mejor a tu personalidad y el uso que le darás a tu retrato.', date: '15 de Abril, 2026', category: 'Guías' },
  { id: 2, title: 'Consejos para fotos perfectas', excerpt: 'Aprende cómo tomar la foto perfecta para que tu retrato quede igual de bien que en los ejemplos.', date: '10 de Abril, 2026', category: 'Tips' },
  { id: 3, title: 'Las mejores formas de regalar un retrato', excerpt: 'Ideas creativas para sorprender a tus seres queridos con un retrato animado personalizado.', date: '5 de Abril, 2026', category: 'Inspiración' },
  { id: 4, title: 'El proceso detrás de cada retrato', excerpt: 'Conoce cómo nuestro equipo crea cada ilustración, desde la foto hasta el archivo final.', date: '1 de Abril, 2026', category: 'Behind the Scenes' },
  { id: 5, title: 'Retratos familiares personalizados', excerpt: 'Por qué un retrato familiar es el regalo perfecto para cualquier ocasión especial.', date: '25 de Marzo, 2026', category: 'Historias' },
  { id: 6, title: 'Nuestros retratos en redes sociales', excerpt: 'Mira cómo nuestros clientes comparten sus retratos en Instagram y TikTok con miles de reacciones.', date: '20 de Marzo, 2026', category: 'Comunidad' },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Blog</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Guías e Inspiración
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Consejos, historias y novedades del mundo de los retratos animados personalizados.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {POSTS.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all p-8 bg-white flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <span className="inline-block bg-primary-lighter px-3 py-1 rounded-full text-xs font-bold text-primary mb-3">
                  {post.category}
                </span>
                <h2 className="font-black text-2xl text-secondary mb-2 group-hover:text-primary transition-colors tracking-tighter">
                  {post.title}
                </h2>
                <p className="text-secondary-lighter mb-3 leading-relaxed">{post.excerpt}</p>
                <p className="text-xs text-secondary-lighter">{post.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-lighter group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            ¿Listo para tu retrato?
          </h2>
          <p className="text-white/70 mb-8">Desde $20 · Entrega en 48h · +1000 clientes felices</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark transition-all hover:shadow-xl"
          >
            Pedir mi retrato
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
