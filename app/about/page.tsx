import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Zap, Star, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

// Server component estático: página del artista (E-E-A-T) con schema Person.
// El Person de aquí es el author de los BlogPosting en /blog/[slug].

export const metadata: Metadata = {
  title: 'About the Artist — Hand-Drawn Portraits, No AI',
  description:
    'Meet Negasva, the illustrator behind every custom cartoon portrait: 100% hand-drawn, no AI, 1000+ happy customers, finished portraits delivered in 48 hours.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Negasva — The Artist Behind the Portraits',
    description: 'Every portrait is hand-drawn by a real artist. No AI, no filters — delivered in 48 hours.',
    url: 'https://negasva.shop/about',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Negasva',
    jobTitle: 'Illustrator & Founder',
    url: 'https://negasva.shop/about',
    description:
      'Digital illustrator specialized in custom cartoon portraits hand-drawn from photos — Simpsons, Rick and Morty, anime and more styles. No AI at any step.',
    knowsAbout: ['cartoon portraits', 'digital illustration', 'character design', 'cartoon art styles'],
    worksFor: { '@type': 'Organization', name: 'NEGASVA', url: 'https://negasva.shop' },
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://negasva.shop' },
    { '@type': 'ListItem', position: 2, name: 'About the Artist', item: 'https://negasva.shop/about' },
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Meet the Artist Behind Negasva
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Every portrait on this site is drawn by hand, from your photo, by a real illustrator. No AI, no filters, no templates.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="prose max-w-none text-secondary-lighter">
            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter">The story</h2>
            <p className="mb-6 leading-relaxed">
              Negasva started as a personal project with a simple idea: turning people&apos;s photos into
              portraits of their favorite cartoons — properly. Not run through a filter, but studied and
              redrawn by hand so that the person in the portrait is unmistakably <em>you</em>: your exact
              hairline, your crooked smile, your dog&apos;s one floppy ear. That obsession with likeness
              turned a side project into a studio with more than 1,000 happy customers.
            </p>
            <p className="mb-6 leading-relaxed">
              Today the catalog covers eight cartoon styles — from the classic yellow family look and
              sci-fi portal chaos to anime and Disney-Pixar-inspired portraits — all drawn in the same way:
              your photo, a digital tablet, and hours of hand work. The finished portrait, not a preview,
              is delivered to your inbox within 48 hours, from $15, with a revision included.
            </p>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">Why no AI?</h2>
            <p className="mb-6 leading-relaxed">
              Because AI doesn&apos;t know what makes you recognizable. Image generators average faces toward
              the style, producing a generic character who vaguely resembles you. The entire craft of a
              custom portrait is the opposite: deciding which of your features matter and translating them
              faithfully into the visual language of the style. That judgment is human work — and it&apos;s the
              reason people frame these portraits instead of replacing them next month. You can read more
              about the process on the <Link href="/blog" className="text-primary underline">blog</Link> or
              browse finished examples in every <Link href="/styles" className="text-primary underline">style</Link>.
            </p>

            <h2 className="font-black text-3xl text-secondary mb-6 tracking-tighter mt-12">What we stand for</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8 mb-12">
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Heart className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">Hand-drawn, always</h3>
                <p className="text-sm text-secondary-lighter">Every portrait is drawn stroke by stroke from your photo. No AI at any step.</p>
              </div>
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">48-hour delivery</h3>
                <p className="text-sm text-secondary-lighter">The finished portrait — not a preview — arrives in your inbox within 48 hours.</p>
              </div>
              <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
                <Star className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-secondary mb-3">Likeness first</h3>
                <p className="text-sm text-secondary-lighter">If a detail isn&apos;t right, the included revision fixes it. The portrait has to look like you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            Ready for your portrait?
          </h2>
          <p className="text-white/70 mb-8">From $15 USD · Delivered in 48h · 1000+ happy customers</p>
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
