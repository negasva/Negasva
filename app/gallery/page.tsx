import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { createAnonClient } from '@/lib/supabase/server';

// Server component: la galería llega en el HTML inicial (SEO). ISR cada 5 min.
// El slider antes/después sigue siendo isla cliente (interactividad).
export const revalidate = 300;

interface GalleryItem {
  id: string;
  title: string;
  style: string | null;
  image_url: string;
}

async function fetchGallery(): Promise<GalleryItem[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, title, style, image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  return error ? [] : (data ?? []);
}

const TITLE_MAP: Record<string, string> = {
  'digital-portrait-rick-and-morty': 'Rick and Morty Style Portrait comission',
  'digital-portrait-fairly-odd-parents': 'Fiarly odd arents  Style Portrait comission',
  'digital-portrait-the-simpsons': 'The Simpsons Style Portrait comission',
};

function displayTitle(raw: string): string {
  if (!raw || raw.trim() === '') return 'Personalized Negasva Art Comission portrait';
  return TITLE_MAP[raw.trim()] ?? raw;
}

// Alt pattern keyword para image SEO.
const altFor = (item: GalleryItem) =>
  `${item.style ? `${item.style} style ` : ''}custom portrait hand drawn from photo — ${displayTitle(item.title)}`;

export default async function GalleryPage() {
  const items = await fetchGallery();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Work Gallery
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Discover the portraits our customers have created
          </p>
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
                      alt={altFor(item)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-secondary mb-2">{displayTitle(item.title)}</h3>
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
            Will yours be next?
          </h2>
          <p className="text-gray-300 mb-8">
            Join our community of satisfied customers
          </p>
          <Link
            href="/order"
            className="inline-block rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Create My Portrait
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
