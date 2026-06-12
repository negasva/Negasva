import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre las cookies que utiliza NEGASVA y cómo puedes controlarlas.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Política de Cookies
          </h1>
          <p className="text-lg text-secondary-lighter">Última actualización: junio 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. ¿Qué son las Cookies?</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web.
              Se utilizan para mejorar tu experiencia de navegación, recordar preferencias y analizar el tráfico.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. Cookies que Utilizamos</h2>
            <p className="text-secondary-lighter leading-relaxed mb-4">Utilizamos los siguientes tipos de cookies:</p>
            <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
              <li><strong className="text-secondary">Esenciales:</strong> Necesarias para el funcionamiento básico del sitio (sesión, carrito).</li>
              <li><strong className="text-secondary">Analíticas:</strong> Google Analytics, para entender cómo se usa el sitio de forma anónima.</li>
              <li><strong className="text-secondary">Funcionales:</strong> Recuerdan tu idioma y moneda seleccionados.</li>
              <li><strong className="text-secondary">Publicidad:</strong> Para personalizar anuncios relevantes en redes sociales.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. Control de Cookies</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Puedes controlar y eliminar cookies desde la configuración de tu navegador. Ten en cuenta que deshabilitar
              cookies esenciales puede afectar el funcionamiento del sitio (por ejemplo, el carrito o el idioma).
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Cookies de Terceros</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Algunos servicios externos como Google Analytics, Stripe o Meta Pixel pueden instalar sus propias cookies.
              No controlamos esas cookies; consulta la política de privacidad de cada proveedor para más información.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Cambios a esta Política</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Nos reservamos el derecho de actualizar esta política. Los cambios serán publicados en esta misma página.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Contacto</h2>
            <p className="text-secondary-lighter leading-relaxed">
              ¿Preguntas sobre nuestras cookies? Escríbenos a{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
