'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function CookiesPage() {
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
            Política de Cookies
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8 text-secondary">
            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">1. ¿Qué son las Cookies?</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu navegador. Se utilizan para mejorar tu experiencia de navegación y recordar tus preferencias.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">2. Cookies que Utilizamos</h2>
              <p className="text-secondary-lighter leading-relaxed mb-4">
                Utilizamos los siguientes tipos de cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
                <li><strong>Esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                <li><strong>Analíticas:</strong> Para entender cómo usas nuestro sitio</li>
                <li><strong>Publicidad:</strong> Para personalizar anuncios relevantes</li>
              </ul>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">3. Control de Cookies</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Puedes controlar y eliminar cookies a través de la configuración de tu navegador. Ten en cuenta que desactivar cookies puede afectar el funcionamiento del sitio.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">4. Cookies de Terceros</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Nuestro sitio puede contener cookies de terceros para analíticas y publicidad. No controlamos estas cookies, pero puedes optar por no recibirlas.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">5. Cambios a esta Política</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Nos reservamos el derecho de actualizar esta política. Los cambios serán notificados a través de nuestro sitio web.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">6. Contacto</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Si tienes preguntas sobre nuestra política de cookies, contáctanos en contacto@negasva.com
              </p>
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
