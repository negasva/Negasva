import type { Metadata } from 'next';

// Metadata por defecto de la sección — /blog/[slug] la sobreescribe con
// generateMetadata. El breadcrumb schema vive en cada página para no duplicarse.
export const metadata: Metadata = {
  title: 'Blog — Cartoon Portrait Guides & Comparisons',
  description:
    'Guides on custom cartoon portraits: how to turn a photo into a cartoon, the best portrait sites compared, style guides and photo tips from the Negasva artist.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Negasva Blog — Custom Cartoon Portrait Guides',
    description: 'Guides on cartoon portraits, style comparisons and original gift ideas.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
