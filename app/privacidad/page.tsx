import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo NEGASVA recopila, usa y protege tu información personal al pedir tu retrato animado.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Política de Privacidad
          </h1>
          <p className="text-lg text-secondary-lighter">Última actualización: junio 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. Introducción</h2>
            <p className="text-secondary-lighter leading-relaxed">
              En NEGASVA respetamos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos
              y qué derechos tienes sobre ellos cuando utilizas nuestro servicio de retratos animados.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. Información que Recopilamos</h2>
            <p className="text-secondary-lighter leading-relaxed mb-4">Recopilamos únicamente la información necesaria para crear tu retrato:</p>
            <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
              <li>Nombre y correo electrónico</li>
              <li>Información de pago (procesada por Stripe — nunca almacenamos datos de tarjeta)</li>
              <li>Fotos de las personas a retratar</li>
              <li>Preferencias de estilo, fondo e indicaciones</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. Cómo Usamos tu Información</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Usamos tus datos exclusivamente para procesar y entregar tu pedido, enviarte actualizaciones de estado
              y mejorar nuestros servicios. <strong className="text-secondary">Nunca vendemos ni compartimos tu
              información con terceros para fines publicitarios.</strong>
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Almacenamiento y Seguridad</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Tus datos se almacenan en servidores seguros mediante Supabase (PostgreSQL cifrado). Las fotos
              se conservan solo durante el tiempo necesario para crear el retrato y son eliminadas automáticamente
              a los 30 días de la entrega.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Tus Derechos</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para
              ejercer estos derechos escríbenos a{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Cambios a esta Política</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Nos reservamos el derecho de actualizar esta política. Los cambios significativos serán notificados
              por correo electrónico a clientes registrados.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">7. Contacto</h2>
            <p className="text-secondary-lighter leading-relaxed">
              ¿Preguntas sobre privacidad? Escríbenos a{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
