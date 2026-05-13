'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function GaleriaPage() {
  const portfolioItems = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Retrato ${i + 1}`,
    style: ['Rick & Morty', 'Gravity Falls', 'Simpsons', 'Padrinos'][i % 4],
  }));

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
            Galería de Trabajos
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Descubre los retratos que nuestros clientes han creado
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-lighter to-primary flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-primary font-semibold">{item.style}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            ¿Tu retrato será el siguiente?
          </h2>
          <p className="text-gray-300 mb-8">
            Únete a nuestra comunidad de clientes satisfechos
          </p>
          <Link
            href="/studio"
            className="inline-block rounded-lg bg-primary px-10 py-4 font-bold text-white hover:bg-primary-dark transition-colors"
          >
            Crear mi Retrato
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
