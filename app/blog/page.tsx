'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: '¿Cuál es el mejor estilo para ti?',
      excerpt: 'Descubre cuál de nuestros 4 estilos se adapta mejor a tu personalidad...',
      date: '15 de Abril, 2024',
      category: 'Guías',
    },
    {
      id: 2,
      title: 'Consejos para fotos perfectas',
      excerpt: 'Aprende cómo tomar la foto perfecta para tu retrato personalizado...',
      date: '10 de Abril, 2024',
      category: 'Tips',
    },
    {
      id: 3,
      title: 'Las mejores formas de regalar un retrato',
      excerpt: 'Ideas creativas para sorprender a tus seres queridos con un retrato...',
      date: '5 de Abril, 2024',
      category: 'Inspiración',
    },
    {
      id: 4,
      title: 'El proceso detrás de cada retrato',
      excerpt: 'Conoce cómo nuestro equipo crea cada obra maestra...',
      date: '1 de Abril, 2024',
      category: 'Behind the Scenes',
    },
    {
      id: 5,
      title: 'Retratos familiares personalizados',
      excerpt: 'Por qué un retrato familiar personalizado es el regalo perfecto...',
      date: '25 de Marzo, 2024',
      category: 'Historias',
    },
    {
      id: 6,
      title: 'Nuestros retratos en redes sociales',
      excerpt: 'Mira cómo nuestros clientes comparten sus retratos en Instagram y TikTok...',
      date: '20 de Marzo, 2024',
      category: 'Comunidad',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-primary-lighter">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" size="md" />
            <Link href="/studio" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
              Crear
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Nuestro Blog
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Consejos, guías e historias inspiradoras sobre retratos personalizados
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all p-8 bg-white"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="inline-block bg-primary-lighter px-3 py-1 rounded-full mb-3">
                      <span className="text-xs font-bold text-primary">{post.category}</span>
                    </div>
                    <h2 className="font-black text-2xl text-secondary mb-2 group-hover:text-primary transition-colors tracking-tighter">
                      {post.title}
                    </h2>
                    <p className="text-secondary-lighter mb-4">{post.excerpt}</p>
                    <p className="text-xs text-secondary-lighter">{post.date}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            ¿Listo para crear?
          </h2>
          <Link
            href="/studio"
            className="inline-block rounded-lg bg-primary px-10 py-4 font-bold text-white hover:bg-primary-dark transition-colors"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-light py-12 px-4 text-gray-400">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm">&copy; 2024 NEGASVA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
