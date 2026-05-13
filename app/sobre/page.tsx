'use client';

import Link from 'next/link';
import { Heart, Zap, Star } from 'lucide-react';
import Logo from '@/components/Logo';

export default function SobrePage() {
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
            Sobre Nosotros
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Transformamos tus fotos en arte personalizados
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="prose max-w-none text-secondary-lighter">
            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter">Nuestra Historia</h2>
            <p className="mb-6 leading-relaxed">
              NEGASVA nació con una idea simple: transformar las fotos de las personas en retratos personalizados de sus caricaturas favoritas. Lo que comenzó como un proyecto personal se convirtió en una misión de crear arte único y de calidad para cada cliente.
            </p>
            <p className="mb-6 leading-relaxed">
              Cada retrato es cuidadosamente diseñado a mano por nuestro equipo de artistas dedicados, asegurando que capture no solo tu apariencia física, sino también tu personalidad y estilo.
            </p>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">Nuestros Valores</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8 mb-12">
              <div className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter">
                <Heart className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">Pasión</h3>
                <p className="text-sm text-secondary-lighter">Nos encanta lo que hacemos y lo demostramos en cada retrato</p>
              </div>
              <div className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">Velocidad</h3>
                <p className="text-sm text-secondary-lighter">Entrega rápida sin sacrificar la calidad</p>
              </div>
              <div className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter">
                <Star className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">Excelencia</h3>
                <p className="text-sm text-secondary-lighter">Buscamos la perfección en cada detalle</p>
              </div>
            </div>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">Únete a Nosotros</h2>
            <p className="mb-6 leading-relaxed">
              Si tienes una pasión por el arte digital y quieres ser parte de nuestro equipo, ¡nos encantaría saber de ti! Contáctanos en contacto@negasva.com
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            ¿Listo para tu transformación?
          </h2>
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
