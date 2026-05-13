'use client';

import Link from 'next/link';
import { ChevronRight, Star, Zap, Heart, Package, Share2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-primary-lighter">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" size="md" />
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-secondary-lighter hover:text-primary transition-colors">
                Explorar
              </Link>
              <Link href="/login" className="text-sm text-secondary-lighter hover:text-primary transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/studio" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                Crear
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-primary-lighter to-white pt-20 pb-32">
        <div className="absolute top-10 right-0 w-96 h-96 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-lighter rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-primary-lighter rounded-full">
                <span className="text-sm font-bold text-secondary">Convierte tu foto en arte</span>
              </div>
              <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-6 leading-tight">
                Tu Retrato Animado
              </h1>
              <p className="text-lg text-secondary-lighter mb-8 leading-relaxed">
                Transforma tu foto en un personaje de caricatura icónico. Rick y Morty, Gravity Falls, Los Simpsons y más.
              </p>
              <div className="flex gap-4">
                <Link href="/studio" className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-bold text-white hover:bg-primary-dark transition-all hover:shadow-lg">
                  Comenzar Ahora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#" className="inline-flex items-center gap-2 rounded-lg border-2 border-secondary px-8 py-4 font-bold text-secondary hover:bg-secondary hover:text-white transition-colors">
                  Ver Galería
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-light to-primary rounded-3xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-lighter opacity-40"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center font-bold text-lg text-secondary border-4 border-primary">
                +120%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-black text-4xl text-primary mb-2">2500+</p>
              <p className="text-sm text-gray-300">Clientes Felices</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">4</p>
              <p className="text-sm text-gray-300">Estilos Únicos</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">48h</p>
              <p className="text-sm text-gray-300">Entrega Rápida</p>
            </div>
            <div>
              <p className="font-black text-4xl text-primary mb-2">100%</p>
              <p className="text-sm text-gray-300">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              ¿Por qué Elegirnos?
            </h2>
            <p className="text-lg text-secondary-lighter max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia en retratos personalizados con estilos únicos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-primary-lighter to-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">Súper Rápido</h3>
              <p className="text-secondary-lighter">Obtén tu retrato personalizado en 48 horas o menos. Proceso simplificado y eficiente.</p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-primary-lighter to-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">Alta Calidad</h3>
              <p className="text-secondary-lighter">Cada retrato es diseñado manualmente con atención al detalle y colores vibrantes.</p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-primary-lighter to-white rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary mb-3">Personalizado</h3>
              <p className="text-secondary-lighter">Controla cada aspecto: poses, fondos, accesorios y estilos de caricatura.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Showcase */}
      <section className="bg-secondary-lighter py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-4">
              Elige tu Estilo Favorito
            </h2>
            <p className="text-lg text-gray-300">Cuatro universos icónicos para elegir</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Rick & Morty', desc: 'Sci-fi y aventuras' },
              { name: 'Gravity Falls', desc: 'Misterio y magia' },
              { name: 'Simpsons', desc: 'Clásico y divertido' },
              { name: 'Padrinos Mágicos', desc: 'Fantasía y poder' },
            ].map((style) => (
              <Link
                key={style.name}
                href="/studio"
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-primary p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                <div className="relative">
                  <h4 className="font-bold text-white text-lg mb-1">{style.name}</h4>
                  <p className="text-sm text-primary-lighter">{style.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              Simple en 3 Pasos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary-light to-primary -z-10"></div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">1</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">Elige Estilo</h3>
              <p className="text-secondary-lighter text-center">Selecciona tu caricatura favorita entre nuestros 4 estilos únicos y personalizables.</p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">2</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">Personaliza</h3>
              <p className="text-secondary-lighter text-center">Ajusta cuerpo, fondo, accesorios y detalles especiales a tu gusto único.</p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg">3</div>
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 text-center">Recibe</h3>
              <p className="text-secondary-lighter text-center">¡Listo! Tu retrato personalizado llega en 48 horas en alta resolución.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-br from-primary-lighter via-white to-primary-lighter py-20 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              Precios Transparentes
            </h2>
            <p className="text-lg text-secondary-lighter">Sin sorpresas, sin cargos ocultos</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">Una Persona — Torso</h4>
                  <p className="text-sm text-secondary-lighter mt-1">Busto hasta la cintura</p>
                </div>
                <span className="font-black text-3xl text-primary">$15</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">Una Persona — Cuerpo Completo</h4>
                  <p className="text-sm text-secondary-lighter mt-1">Personaje de cuerpo entero</p>
                </div>
                <span className="font-black text-3xl text-primary">$25</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-lg">Fondo Personalizado</h4>
                  <p className="text-sm text-secondary-lighter mt-1">Escena o fondo personalizado</p>
                </div>
                <span className="font-black text-3xl text-primary">+$15</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
            <p className="text-lg font-bold mb-2">Ejemplo: 2 personas cuerpo completo + fondo</p>
            <p className="text-sm text-primary-lighter mb-4">$25 × 2 + $15 = </p>
            <p className="font-black text-5xl tracking-tighter">$65</p>
          </div>

          <Link
            href="/studio"
            className="w-full block text-center rounded-xl bg-secondary px-8 py-5 font-black text-white text-lg hover:bg-secondary-light transition-colors shadow-lg hover:shadow-xl"
          >
            Crear mi Retrato Ahora →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              Amado por Nuestros Clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'María', comment: 'Mi retrato de Rick & Morty quedó increíble. La calidad es sorprendente.', rating: 5 },
              { name: 'Carlos', comment: 'Perfecto para regalo. Mi hermano no podía creer que era su foto como Gravity Falls.', rating: 5 },
              { name: 'Sofia', comment: 'Proceso muy fácil. Entrega rápida y exactamente como lo pedí. ¡Muy recomendado!', rating: 5 },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-gradient-to-br from-primary-lighter to-white rounded-2xl p-8 border-2 border-primary-lighter hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-secondary-lighter mb-6">"{testimonial.comment}"</p>
                <p className="font-bold text-secondary">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-secondary overflow-hidden py-20 px-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full -mr-40"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-6">
            ¿Listo para tu Transformación?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de clientes felices y crea tu retrato personalizado hoy.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-5 font-black text-white hover:bg-primary-dark transition-all hover:shadow-2xl text-lg"
          >
            Comenzar Ahora
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-light py-16 px-4 text-gray-400">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size="lg" className="mb-4 block" />
              <p className="text-sm mb-6">Retratos personalizados de calidad profesional</p>
              <div className="flex gap-4">
                <a href="https://instagram.com/negasva" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm font-bold">
                  Instagram
                </a>
                <a href="https://tiktok.com/@negasva" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm font-bold">
                  TikTok
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/estilos" className="hover:text-primary transition-colors">Estilos</Link></li>
                <li><Link href="/precios" className="hover:text-primary transition-colors">Precios</Link></li>
                <li><Link href="/galeria" className="hover:text-primary transition-colors">Galería</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-lighter pt-8">
            <p className="text-center text-sm">&copy; 2024 NEGASVA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
