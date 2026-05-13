'use client';

import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ContactoPage() {
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
            Contactanos
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Estamos aquí para responder tus preguntas y ayudarte
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 tracking-tighter">Email</h3>
              <p className="text-secondary-lighter mb-4">Para consultas generales y soporte</p>
              <a href="mailto:contacto@negasva.com" className="text-primary hover:text-primary-dark font-bold transition-colors">
                contacto@negasva.com
              </a>
            </div>

            <div className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 tracking-tighter">Redes Sociales</h3>
              <p className="text-secondary-lighter mb-4">Síguenos e interactúa con nosotros</p>
              <div className="space-y-2">
                <a href="https://instagram.com/negasva" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary-dark font-bold transition-colors">
                  Instagram @negasva
                </a>
                <a href="https://tiktok.com/@negasva" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary-dark font-bold transition-colors">
                  TikTok @negasva
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-primary-lighter p-8">
            <h3 className="font-black text-2xl text-secondary mb-6 tracking-tighter">Preguntas Frecuentes</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-secondary mb-2">¿Cuánto tarda mi retrato?</h4>
                <p className="text-secondary-lighter">Todos nuestros retratos se entregan en 48 horas o menos.</p>
              </div>
              <div>
                <h4 className="font-bold text-secondary mb-2">¿Puedo hacer cambios después de ordenar?</h4>
                <p className="text-secondary-lighter">Contáctanos dentro de las primeras 24 horas y haremos los ajustes necesarios.</p>
              </div>
              <div>
                <h4 className="font-bold text-secondary mb-2">¿Qué formatos de entrega tienen?</h4>
                <p className="text-secondary-lighter">Entregamos en alta resolución PNG, JPG y en resoluciones para redes sociales.</p>
              </div>
            </div>
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
