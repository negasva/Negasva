import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { STYLES_CONTENT } from '@/lib/content/styles';

// Landing transaccional para la keyword "cartoon yourself" (server component
// estático). El post de blog /blog/cartoon-yourself-guide cubre la intención
// informacional; esta página captura la transaccional y enlaza al wizard.

export const metadata: Metadata = {
  title: 'Cartoon Yourself — Hand-Drawn by a Real Artist, No AI • From $15',
  description:
    'Cartoon yourself from a photo: a real artist hand-draws you in Simpsons, anime, Disney-Pixar and more styles — no AI filters. Delivered in 48 hours, from $15.',
  keywords: ['cartoon yourself', 'cartoon yourself from photo', 'turn yourself into a cartoon', 'cartoonize photo hand drawn', 'cartoon me no AI'],
  alternates: { canonical: '/cartoon-yourself' },
  openGraph: {
    title: 'Cartoon Yourself — Hand-Drawn by a Real Artist, No AI',
    description: 'A real artist hand-draws you in the cartoon style you love — no AI filters. In 48 hours, from $15.',
    url: 'https://negasva.shop/cartoon-yourself',
    images: [{ url: '/backgrounds/rm-1.webp', width: 819, height: 461, alt: 'Cartoon yourself: photo hand drawn as cartoon character' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cartoon Yourself — Hand-Drawn by a Real Artist, No AI',
    description: 'A real artist hand-draws you in the cartoon style you love — no AI filters. In 48 hours, from $15.',
    images: ['/backgrounds/rm-1.webp'],
  },
};

const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Cartoon Yourself — Custom Hand-Drawn Portrait',
  description:
    'Cartoon yourself from a photo: a real artist hand-draws you in the cartoon style you love — no AI filters. Delivered in 48 hours, from $15.',
  brand: { '@type': 'Brand', name: 'Negasva' },
  image: 'https://negasva.shop/backgrounds/rm-1.webp',
  offers: {
    '@type': 'AggregateOffer',
    url: 'https://negasva.shop/order',
    priceCurrency: 'USD',
    lowPrice: '15',
    highPrice: '160',
    availability: 'https://schema.org/InStock',
  },
};

export default function CartoonYourselfPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="Cartoon Yourself" path="/cartoon-yourself" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-16 md:py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
                Cartoon Yourself
              </h1>
              <p className="text-lg text-secondary-lighter mb-8">
                Not with a filter — with an artist. Upload your photo, pick a cartoon style, and a
                real human draws you stroke by stroke. No AI, no generic cartoon face: you, but
                animated. Delivered in 48 hours, from $15.
              </p>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
              >
                Cartoon me now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="mt-3 text-sm text-secondary-lighter">From $15 USD · Delivered in 48h · Revision included</p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary-lighter shadow-lg">
              <Image
                src="/backgrounds/rm-1.webp"
                alt="Cartoon yourself: photo hand drawn as cartoon character by a real artist"
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
          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">
              How to cartoon yourself (the right way)
            </h2>
            <p className="text-secondary-lighter leading-relaxed">
              Apps that cartoon your photo in seconds all share one flaw: they average your face
              into everyone else&apos;s. The eyes get generic, the smile goes plastic, the details
              that make you <em>you</em> disappear. Our process is the opposite — you upload a
              clear photo, choose one of 13 hand-drawn styles, and a real artist studies your face
              and rebuilds it line by line in that style. The result is a cartoon version of you
              that friends recognize instantly, ready in 48 hours.
            </p>
          </div>
          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">
              Pick the universe you belong in
            </h2>
            <p className="text-secondary-lighter leading-relaxed mb-6">
              Yellow-skinned in Simpsons style, chaotic in Rick and Morty style, soft and painterly
              in Ghibli-inspired style, storybook-warm in Disney-Pixar style — every style works
              solo, as a couple or with the whole group and your pets, up to 8 characters in one
              scene with a custom background.
            </p>
            <div className="flex flex-wrap gap-3">
              {STYLES_CONTENT.map((s) => (
                <Link
                  key={s.slug}
                  href={`/styles/${s.slug}`}
                  className="rounded-full border-2 border-primary-lighter px-5 py-2.5 text-sm font-bold text-secondary hover:border-primary hover:text-primary-dark transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">
              What you get
            </h2>
            <ul className="space-y-3">
              {[
                'A hand-drawn cartoon portrait from your photo — no AI, ever',
                'Any of our 13 styles, torso or full body',
                'Custom background: your city, a show scene, anywhere',
                'High-resolution PNG + JPG, ready to print or use as avatar',
                'A revision round + delivery in 48 hours (24h express)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-secondary-lighter">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-secondary-lighter">
            Want the full comparison of apps, filters and commissions before you decide?{' '}
            <Link href="/blog/cartoon-yourself-guide" className="text-primary font-bold underline">
              Read our complete cartoon-yourself guide
            </Link>{' '}
            — or see{' '}
            <Link href="/how-it-works" className="text-primary font-bold underline">
              how our process works
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            Ready to cartoon yourself?
          </h2>
          <p className="text-white/70 mb-8">From $15 USD · Delivered in 48h · +1000 happy clients</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Start my order
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
