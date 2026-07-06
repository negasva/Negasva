'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

interface GalleryItem {
  id: string;
  title: string;
  style: string | null;
  image_url: string;
}

export default function GaleriaPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    cachedFetchJSON<GalleryItem[]>('/api/gallery')
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.gallery.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.gallery.subtitle}
          </p>
        </div>
      </section>

      {/* Before/After showcase */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="font-black text-3xl md:text-4xl tracking-tighter text-secondary mb-2">
              Arrastra para ver la transformación
            </h2>
            <p className="text-secondary-lighter">De foto real a personaje animado</p>
          </div>
          <BeforeAfterSlider
            beforeSrc="/samples/before-1.svg"
            afterSrc="/samples/after-1.svg"
            beforeLabel="Antes"
            afterLabel="Después"
          />
        </div>
      </section>

      {/* Gallery — real portfolio from gallery_items. Hidden entirely when empty
          (better than fake placeholder cards). */}
      {items.length > 0 && (
        <section className="py-20 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl overflow-hidden border-2 border-primary-lighter hover:border-primary hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                    {item.style && <p className="text-sm text-primary font-semibold">{item.style}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-6 tracking-tighter">
            {t.gallery.cta_title}
          </h2>
          <p className="text-gray-300 mb-8">
            {t.gallery.cta_subtitle}
          </p>
          <Link
            href="/order"
            className="inline-block rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            {t.gallery.cta_btn}
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
