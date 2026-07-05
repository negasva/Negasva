import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { getStyleBySlug } from '@/lib/content/styles';
import { getLandingByPath, type LandingContent } from '@/lib/content/landings';

// Server component: template compartido de las landings SEO por sujeto/ocasión.

export function landingMetadata(content: LandingContent): Metadata {
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    alternates: { canonical: content.path },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: `https://negasva.shop${content.path}`,
      images: [{ url: content.image, width: 819, height: 461, alt: content.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: [content.image],
    },
  };
}

export default function SeoLanding({ content }: { content: LandingContent }) {
  const orderHref = '/order';
  const relatedStyles = content.relatedStyles
    .map((slug) => getStyleBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const relatedLandings = content.relatedLandings
    .map((path) => getLandingByPath(path))
    .filter((l): l is LandingContent => Boolean(l));

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: content.h1,
    description: content.metaDescription,
    brand: { '@type': 'Brand', name: 'Negasva' },
    image: `https://negasva.shop${content.image}`,
    offers: {
      '@type': 'AggregateOffer',
      url: `https://negasva.shop${orderHref}`,
      priceCurrency: 'USD',
      lowPrice: '15',
      highPrice: '160',
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://negasva.shop' },
      { '@type': 'ListItem', position: 2, name: content.h1, item: `https://negasva.shop${content.path}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({
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
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
                {content.h1}
              </h1>
              <p className="text-lg text-secondary-lighter mb-8">{content.intro}</p>
              <Link
                href={orderHref}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
              >
                Order my portrait
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="mt-3 text-sm text-secondary-lighter">From $15 USD · Delivered in 48h · Revision included</p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary-lighter shadow-lg">
              <Image
                src={content.image}
                alt={content.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-12">
          {content.sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{s.title}</h2>
              <p className="text-secondary-lighter leading-relaxed">{s.body}</p>
            </div>
          ))}

          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">{content.bullets.title}</h2>
            <ul className="space-y-3">
              {content.bullets.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-secondary-lighter">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {content.faq.map((f) => (
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
            Your hand-drawn portrait is waiting
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

      {/* Related styles */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-8 text-center">
            Popular styles for this portrait
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedStyles.map((s) => (
              <Link
                key={s.slug}
                href={`/styles/${s.slug}`}
                className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-xl text-secondary group-hover:text-primary transition-colors">
                    {s.name} Portrait
                  </h3>
                  <p className="text-sm text-secondary-lighter mt-1 line-clamp-2">{s.intro}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Related landings */}
          {relatedLandings.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {relatedLandings.map((l) => (
                <Link
                  key={l.path}
                  href={l.path}
                  className="rounded-full border-2 border-primary-lighter px-5 py-2 font-bold text-secondary hover:border-primary hover:text-primary transition-all"
                >
                  {l.h1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
