'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8 text-secondary">
            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">1. Introducción</h2>
              <p className="text-secondary-lighter leading-relaxed">
                En NEGASVA, respetamos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">2. Información que Recopilamos</h2>
              <p className="text-secondary-lighter leading-relaxed mb-4">
                Recopilamos información que voluntariamente nos proporcionas, tales como:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
                <li>Nombre y correo electrónico</li>
                <li>Información de pago</li>
                <li>Fotos para tus retratos</li>
                <li>Preferencias de diseño</li>
              </ul>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">3. Cómo Usamos tu Información</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Usamos tu información para procesar tu pedido, contactarte con actualizaciones y mejorar nuestros servicios. Nunca vendemos tu información a terceros.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">4. Seguridad de Datos</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Implementamos medidas de seguridad estándar para proteger tu información personal contra acceso no autorizado.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">5. Tus Derechos</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Tienes derecho a acceder, modificar o eliminar tu información personal. Contáctanos en contacto@negasva.com para cualquier solicitud.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">6. Cambios a esta Política</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Nos reservamos el derecho de actualizar esta política en cualquier momento. Notificaremos cambios significativos a través de nuestro sitio.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">7. Contacto</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Si tienes preguntas sobre nuestra política de privacidad, escribe a contacto@negasva.com
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
