'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function EstilosPage() {
  const styles = [
    {
      name: 'Rick & Morty',
      emoji: '🛸',
      desc: 'Explora el universo con este estilo sci-fi icónico',
      features: ['Personajes futuristas', 'Tecnología avanzada', 'Aventuras galácticas'],
    },
    {
      name: 'Gravity Falls',
      emoji: '🌲',
      desc: 'Misterio y magia en cada retrato',
      features: ['Atmósfera misteriosa', 'Detalles únicos', 'Fondos sobrenaturales'],
    },
    {
      name: 'The Simpsons',
      emoji: '🍩',
      desc: 'El clásico que todos conocen y aman',
      features: ['Estilo simplificado', 'Colores vibrantes', 'Atmósfera familiar'],
    },
    {
      name: 'The Fairly OddParents',
      emoji: '⭐',
      desc: 'Fantasía y magia sin límites',
      features: ['Efectos mágicos', 'Colores pasteles', 'Poder sobrenatural'],
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
            Nuestros Estilos
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Elige entre cuatro universos icónicos y crea tu retrato personalizado
          </p>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12">
            {styles.map((style) => (
              <div key={style.name} className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-primary-light to-primary p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                  <div className="relative">
                    <div className="text-8xl mb-4">{style.emoji}</div>
                    <h3 className="font-black text-3xl text-white mb-2">{style.name}</h3>
                  </div>
                </div>
                <div className="p-8 bg-white">
                  <p className="text-secondary-lighter mb-6">{style.desc}</p>
                  <div className="mb-8">
                    <h4 className="font-bold text-secondary mb-3">Características:</h4>
                    <ul className="space-y-2">
                      {style.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-secondary-lighter">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/studio"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark transition-colors"
                  >
                    Crear con este estilo
                    <ChevronRight className="w-5 h-5" />
                  </Link>
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
            ¿Aún no sabes cuál elegir?
          </h2>
          <p className="text-gray-300 mb-8">
            Prueba cada estilo en nuestro editor interactivo y ve cómo te ves en diferentes universos.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-4 font-bold text-white hover:bg-primary-dark transition-colors"
          >
            Explorar Editor
            <ChevronRight className="w-5 h-5" />
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
