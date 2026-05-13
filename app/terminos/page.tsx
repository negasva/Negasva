'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function TerminosPage() {
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
            Términos de Servicio
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8 text-secondary">
            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">1. Aceptación de Términos</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Al usar nuestro sitio web y servicios, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo, no uses nuestros servicios.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">2. Servicios</h2>
              <p className="text-secondary-lighter leading-relaxed">
                NEGASVA proporciona servicios de retratos personalizados basados en fotos que proporcionas. Los retratos se entregan en un plazo de 48 horas.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">3. Pagos y Reembolsos</h2>
              <p className="text-secondary-lighter leading-relaxed mb-4">
                Los pagos se procesan a través de Stripe. Los reembolsos están disponibles dentro de 7 días de la compra si no has recibido tu retrato. Los reembolsos parciales no están disponibles.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">4. Derechos de Autor</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Los retratos creados son tuyos para usar personalmente. No puedes venderlos o usarlos con fines comerciales sin permiso. Los diseños de los estilos de caricatura están protegidos.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">5. Limitación de Responsabilidad</h2>
              <p className="text-secondary-lighter leading-relaxed">
                NEGASVA no es responsable por daños indirectos, incidentales o consecuentes. Nuestra responsabilidad está limitada al monto pagado.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">6. Cambios a los Términos</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Nos reservamos el derecho de cambiar estos términos en cualquier momento. Continuarás vinculado por los cambios.
              </p>
            </div>

            <div>
              <h2 className="font-black text-2xl text-secondary mb-4 tracking-tighter">7. Contacto</h2>
              <p className="text-secondary-lighter leading-relaxed">
                Para preguntas sobre estos términos, contáctanos en contacto@negasva.com
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
