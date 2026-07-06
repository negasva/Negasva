import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import ProductIcon from '@/components/ProductIcon';
import { getPodProduct } from '@/lib/pricing/products';

// Landing SEO de productos físicos (server component estático). Reemplaza el
// antiguo /productos "próximamente" (ahora 301 → /products).

const ITEMS = [
  {
    key: 'canvas',
    h2: 'Custom Cartoon Portrait Canvas',
    keyword: 'custom cartoon portrait canvas',
    body:
      'Your hand-drawn portrait stretched on a real gallery canvas, ready to hang the moment it arrives. It is the format that turns a fun cartoon into wall art — living rooms, hallways, the spot above the couch. Available from 8×10 in up to 24×36 in, printed from the same high-resolution file the artist delivers.',
    bullets: ['Stretched canvas on a solid frame', 'Sizes from 20×25 cm to 60×90 cm', 'Ready to hang, no framing needed'],
  },
  {
    key: 'mug',
    h2: 'Custom Cartoon Portrait Mug',
    keyword: 'custom cartoon portrait mug',
    body:
      'Coffee tastes better with your face on the cup. A custom cartoon portrait mug is the easy gift that gets used every single morning — pets on a mug for the pet parent, the couple on a mug for the partner, the whole family for grandma. White glossy ceramic, microwave and dishwasher safe.',
    bullets: ['White glossy ceramic', '11, 15 or 20 oz', 'Microwave & dishwasher safe'],
  },
  {
    key: 'tshirt',
    h2: 'Custom Cartoon Portrait T-Shirt',
    keyword: 'custom cartoon portrait t-shirt',
    body:
      'Wear your cartoon self. A custom cartoon portrait t-shirt is a favorite for stag and hen dos, family reunions, team events and inside jokes you want on cotton. 100% pre-shrunk cotton, unisex fit, in a range of colors — printed with the portrait our artist draws for you.',
    bullets: ['100% pre-shrunk cotton, unisex', 'Multiple sizes and colors', 'Durable, high-detail print'],
  },
] as const;

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export const metadata: Metadata = {
  title: 'Custom Cartoon Portrait on Canvas, Mugs & T-Shirts — From $9.50',
  description:
    'Put your hand-drawn custom cartoon portrait on physical products: canvas prints, mugs and t-shirts, shipped to your door. No AI, delivered from a real artist. From $9.50.',
  keywords: ['custom cartoon portrait canvas', 'custom cartoon portrait mug', 'custom cartoon portrait t-shirt', 'cartoon portrait on products', 'personalized portrait gifts printed'],
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Custom Cartoon Portrait on Canvas, Mugs & T-Shirts',
    description: 'Your hand-drawn portrait printed on canvas, mugs and t-shirts, shipped to your door. From $9.50.',
    url: 'https://negasva.shop/products',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Cartoon Portrait on Canvas, Mugs & T-Shirts',
    description: 'Your hand-drawn portrait printed on canvas, mugs and t-shirts, shipped to your door. From $9.50.',
  },
};

export default function ProductsPage() {
  const productsSchema = ITEMS.map((item) => {
    const price = getPodProduct(item.key)?.priceUsd ?? 0;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: item.h2,
      description: item.body,
      brand: { '@type': 'Brand', name: 'Negasva' },
      offers: {
        '@type': 'Offer',
        url: 'https://negasva.shop/order',
        priceCurrency: 'USD',
        price: String(price),
        availability: 'https://schema.org/InStock',
      },
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="Products" path="/products" />
      {productsSchema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-16 md:py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-4xl md:text-6xl tracking-tighter text-secondary mb-4">
            Custom Cartoon Portrait on Canvas, Mugs &amp; T-Shirts
          </h1>
          <p className="text-lg text-secondary-lighter mb-8">
            The digital file is always included — then put your hand-drawn portrait on real,
            printed products shipped to your door. No AI, drawn by a real artist.
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Create my portrait
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl space-y-16">
          {ITEMS.map((item) => {
            const price = getPodProduct(item.key)?.priceUsd ?? 0;
            return (
              <div key={item.key} className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex items-center justify-center aspect-square rounded-2xl bg-[#FFF1F7] border-2 border-primary-lighter">
                  <ProductIcon productKey={item.key} className="w-20 h-20 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-3xl tracking-tighter text-secondary mb-3">{item.h2}</h2>
                  <p className="font-black text-2xl text-primary mb-4">from {usd(price)}</p>
                  <p className="text-secondary-lighter leading-relaxed mb-5">{item.body}</p>
                  <ul className="space-y-2 mb-6">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-secondary-lighter">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/order"
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-7 py-3.5 font-black text-white hover:bg-secondary-light transition-colors"
                  >
                    Order on {item.h2.replace('Custom Cartoon Portrait ', '').replace(/^on /, '')}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            One portrait, endless products
          </h2>
          <p className="text-white/70 mb-8">Also on hoodies, framed posters and phone cases — added at checkout.</p>
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
