import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { STYLES_CONTENT, getStyleBySlug } from '@/lib/content/styles';

// Server component estático: el HTML llega con todo el contenido para SEO.

export function generateStaticParams() {
  return STYLES_CONTENT.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const style = getStyleBySlug(params.slug);
  if (!style) return {};
  return {
    title: style.metaTitle,
    description: style.metaDescription,
    keywords: style.keywords,
    alternates: { canonical: `/styles/${style.slug}` },
    openGraph: {
      title: style.metaTitle,
      description: style.metaDescription,
      url: `https://negasva.shop/styles/${style.slug}`,
      images: [{ url: style.image, width: 819, height: 461, alt: style.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: style.metaTitle,
      description: style.metaDescription,
      images: [style.image],
    },
  };
}

export default function StylePage({ params }: { params: { slug: string } }) {
  const style = getStyleBySlug(params.slug);
  if (!style) notFound();

  const others = STYLES_CONTENT.filter((s) => s.slug !== style.slug);
  const orderHref = `/order?style=${style.dbSlug}`;
  const bestForMap: Record<string, string> = {
    'rick-and-morty-style-portrait': 'Perfect for couples, friends and portraits with irreverent humor and spectacular sci-fi backgrounds.',
    'simpsons-style-portrait': 'Perfect for families, cross-generational gifts and anyone who wants an instantly universal reference.',
    'gravity-falls-style-portrait': 'Perfect for avatars, siblings, sweet couples and portraits with a cozy, mysterious vibe.',
    'fairly-oddparents-style-portrait': 'Perfect for vibrant colors, magical energy and eye-catching couple portraits.',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${style.name} Custom Portrait`,
    description: style.metaDescription,
    brand: { '@type': 'Brand', name: 'NEGASVA' },
    image: `https://negasva.shop${style.image}`,
    offers: {
      '@type': 'AggregateOffer',
      url: `https://negasva.shop${orderHref}`,
      priceCurrency: 'USD',
      lowPrice: '15',
      highPrice: '160',
      offerCount: '4',
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://negasva.shop' },
      { '@type': 'ListItem', position: 2, name: 'Styles', item: 'https://negasva.shop/styles' },
      { '@type': 'ListItem', position: 3, name: style.name, item: `https://negasva.shop/styles/${style.slug}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: style.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-16 md:py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="breadcrumb" className="mb-4 text-sm text-secondary-lighter">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/styles" className="hover:text-primary">Styles</Link>
            <span className="mx-2">/</span>
            <span className="text-secondary font-bold">{style.name}</span>
          </nav>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
                {style.h1}
              </h1>
          <p className="text-lg text-secondary-lighter mb-8">{style.intro}</p>
          <div className="mb-8 rounded-2xl border-2 border-primary bg-primary-lighter/50 p-5">
            <p className="font-black text-secondary tracking-tighter mb-1">Best for</p>
            <p className="text-secondary-lighter">{bestForMap[style.slug] ?? style.intro}</p>
          </div>
          <Link
            href={orderHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
                Order my {style.name} portrait
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="mt-3 text-sm text-secondary-lighter">From $15 USD · Delivered in 48h · Revision included</p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary-lighter shadow-lg">
              <Image
                src={style.image}
                alt={style.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido SEO */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{style.whatIs.title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{style.whatIs.body}</p>
          </div>

          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{style.forWho.title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{style.forWho.body}</p>
          </div>

          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{style.includes.title}</h2>
            <ul className="space-y-3">
              {style.includes.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-secondary-lighter">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{style.process.title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{style.process.body}</p>
          </div>

          {/* FAQ del estilo */}
          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {style.faq.map((f) => (
                <div key={f.q} className="rounded-2xl border-2 border-primary-lighter p-6">
                  <h3 className="font-bold text-secondary mb-2">{f.q}</h3>
                  <p className="text-secondary-lighter">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            Your {style.name} portrait is waiting
          </h2>
          <p className="text-white/70 mb-8">From $15 USD · Delivered in 48h · +1000 happy clients</p>
          <Link
            href={orderHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Start my order
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Otros estilos — enlaces internos */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-8 text-center">
            Other styles you might like
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/styles/${o.slug}`}
                className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={o.image}
                    alt={o.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-xl text-secondary group-hover:text-primary transition-colors">
                    {o.name} Portrait
                  </h3>
                  <p className="text-sm text-secondary-lighter mt-1 line-clamp-2">{o.intro}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
