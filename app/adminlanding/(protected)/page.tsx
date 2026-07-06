import Link from 'next/link';

const SECTIONS = [
  { href: '/adminlanding/landing',        label: 'Footer',       desc: 'Tagline, redes y columnas de enlaces del pie' },
  { href: '/adminlanding/galeria',        label: 'Galería',      desc: 'Portafolio que se muestra en /gallery' },
  { href: '/adminlanding/faqs',           label: 'FAQ',          desc: 'Preguntas frecuentes (home y /faq)' },
  { href: '/adminlanding/discount-codes', label: 'Descuentos',   desc: 'Códigos y reglas generales' },
  { href: '/adminlanding/packages',       label: 'Paquetes',     desc: 'Combos que se muestran en /pricing' },
  { href: '/adminlanding/contenido',      label: 'Contenido',    desc: 'Textos de páginas: FAQ, blog, legales…' },
];

export default function AdminLandingHome() {
  return (
    <div>
      <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Contenido del sitio</h1>
      <p className="text-sm text-secondary-lighter mb-6">Edita la landing y el contenido público. Misma contraseña que el panel de operación.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {SECTIONS.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-lighter transition-all group"
          >
            <p className="font-black text-secondary group-hover:text-primary transition-colors">{label}</p>
            <p className="text-xs text-secondary-lighter mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
