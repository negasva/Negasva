'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import Logo from '@/components/Logo';

export default function PreciosPage() {
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
            Nuestros Precios
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Transparentes, simples y sin sorpresas
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">Una Persona — Torso</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Busto hasta la cintura</p>
                </div>
                <span className="font-black text-3xl text-primary">$15</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Retrato de calidad profesional
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Personalización completa
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Entrega en 48 horas
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">Una Persona — Cuerpo Completo</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Personaje de cuerpo entero</p>
                </div>
                <span className="font-black text-3xl text-primary">$25</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Retrato completo de cuerpo entero
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Múltiples opciones de poses
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Accesorios personalizados
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">Fondo Personalizado</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Escena o fondo personalizado</p>
                </div>
                <span className="font-black text-3xl text-primary">+$15</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Fondos de los shows o personalizados
                </li>
                <li className="flex items-center gap-2 text-secondary-lighter text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Diseño profesional del fondo
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-12 text-white mb-12">
            <h3 className="font-black text-3xl mb-6 tracking-tighter">Ejemplos de Presupuesto</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>1 persona, cuerpo completo</span>
                <span className="font-bold">$25</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>2 personas, cuerpo completo</span>
                <span className="font-bold">$50</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>2 personas + fondo personalizado</span>
                <span className="font-bold">$65</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold">Familia completa (4 personas) + fondo</span>
                <span className="font-black text-2xl">$115</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/studio"
              className="inline-block rounded-lg bg-secondary px-10 py-5 font-bold text-white hover:bg-secondary-light transition-colors text-lg"
            >
              Comenzar Ahora
            </Link>
          </div>
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
