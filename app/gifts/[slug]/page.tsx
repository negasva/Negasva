import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SeoLanding, { landingMetadata } from '@/components/SeoLanding';
import { LANDINGS, getLandingByPath } from '@/lib/content/landings';

const GIFT_SLUGS = LANDINGS.filter((l) => l.path.startsWith('/gifts/')).map((l) => l.path.split('/')[2]);

export function generateStaticParams() {
  return GIFT_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const content = getLandingByPath(`/gifts/${params.slug}`);
  return content ? landingMetadata(content) : {};
}

export default function GiftLandingPage({ params }: { params: { slug: string } }) {
  const content = getLandingByPath(`/gifts/${params.slug}`);
  if (!content) notFound();
  return <SeoLanding content={content} />;
}
