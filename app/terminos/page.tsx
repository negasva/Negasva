import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Condiciones de uso del servicio de retratos animados personalizados de NEGASVA.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Términos de Servicio
          </h1>
          <p className="text-lg text-secondary-lighter">Última actualización: junio 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. Aceptación de Términos</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Al acceder y usar negasva.shop aceptas cumplir con estos términos. Si no estás de acuerdo, por favor
              no uses nuestros servicios.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. El Servicio</h2>
            <p className="text-secondary-lighter leading-relaxed">
              NEGASVA ofrece retratos digitales personalizados en estilos de caricatura (Rick & Morty, Simpsons,
              Gravity Falls, Padrinos Mágicos y más). Los retratos se entregan como archivos PNG/JPG en alta
              resolución en un plazo de <strong className="text-secondary">48 horas</strong> (o 24h con entrega exprés).
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. Pagos y Reembolsos</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Los pagos se procesan de forma segura a través de Stripe (tarjeta, Apple Pay, Google Pay) o Wompi
              (Colombia, COP). Los reembolsos están disponibles dentro de 7 días si no has recibido tu retrato
              o si el resultado no corresponde a las indicaciones proporcionadas. Los ajustes menores están
              incluidos sin costo adicional durante las primeras 24 horas tras la entrega.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Derechos de Autor y Uso</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Una vez entregado, el retrato es tuyo para uso personal: redes sociales, impresión, regalos y
              decoración. El uso comercial (venta, licencias, publicidad) requiere un acuerdo previo por escrito.
              Los estilos de caricatura (Rick & Morty, Simpsons, etc.) son marcas registradas de sus respectivos
              propietarios.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Fotos y Contenido</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Al subir fotos confirmas que tienes el derecho de uso de esas imágenes. No aceptamos fotos de
              menores sin consentimiento parental explícito, ni contenido inapropiado o ilegal.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Limitación de Responsabilidad</h2>
            <p className="text-secondary-lighter leading-relaxed">
              NEGASVA no es responsable por daños indirectos o consecuentes. Nuestra responsabilidad máxima está
              limitada al monto pagado por el pedido en cuestión.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">7. Cambios a los Términos</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Podemos actualizar estos términos en cualquier momento. Publicaremos los cambios en esta página
              con la fecha de actualización.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">8. Contacto</h2>
            <p className="text-secondary-lighter leading-relaxed">
              ¿Preguntas sobre estos términos? Escríbenos a{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
