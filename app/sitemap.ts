import type { MetadataRoute } from 'next';
import { STYLES_CONTENT } from '@/lib/content/styles';
import { BLOG_POSTS } from '@/lib/content/blogPosts';
import { LANDINGS } from '@/lib/content/landings';

const BASE = 'https://negasva.shop';

// Fecha del último cambio real de contenido de las páginas estáticas
// (migración EN + reescritura SEO). Actualizar al tocar el contenido.
const CONTENT_UPDATED = new Date('2026-07-05');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly'; lastModified?: Date }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/order', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/styles', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/cartoon-yourself', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/track-order', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'monthly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'monthly' },
    // Landing individual por estilo — páginas de captación SEO
    ...STYLES_CONTENT.map((s) => ({
      path: `/styles/${s.slug}`,
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    })),
    // Landings SEO por sujeto, ocasión y ángulo
    ...LANDINGS.map((l) => ({
      path: l.path,
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    })),
    // Artículos del blog — lastModified = fecha real del post
    ...BLOG_POSTS.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(p.date),
    })),
  ];

  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: r.lastModified ?? CONTENT_UPDATED,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
