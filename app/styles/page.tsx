import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { STYLES_CONTENT } from '@/lib/content/styles';

// Server component estático: el catálogo canónico de 8 estilos (lib/content/styles.ts)
// llega en el HTML inicial (SEO). Sin fetch cliente — es el mismo contenido que
// alimenta las landings /styles/[slug].

export default function StylesPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="Styles" path="/styles" />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Custom Cartoon Portrait Styles
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            8 hand-drawn styles — Simpsons, Rick and Morty, Family Guy, South Park, anime,
            Disney-Pixar and more. Pick yours and get your portrait in 48h.
          </p>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12">
            {STYLES_CONTENT.map((style) => (
              <div key={style.slug} className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all flex flex-col">
                <Link href={`/styles/${style.slug}`} className="relative aspect-[16/9] block overflow-hidden">
                  <Image
                    src={style.image}
                    alt={style.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-8 bg-white flex flex-col flex-1">
                  <h2 className="font-black text-2xl text-secondary mb-3">{style.name}</h2>
                  <p className="text-secondary-lighter mb-6 flex-1">{style.intro}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/styles/${style.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3 font-black text-primary hover:bg-primary-lighter transition-all"
                    >
                      View style
                    </Link>
                    <Link
                      href="/order"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
                    >
                      Create with this style
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            Still don&apos;t know which to choose?
          </h2>
          <p className="text-gray-300 mb-8">
            Start your order and try each style — see how you look in different universes.
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Order my portrait
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
