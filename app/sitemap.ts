import type { MetadataRoute } from 'next';
import { STYLES_CONTENT } from '@/lib/content/styles';
import { BLOG_POSTS } from '@/lib/content/blogPosts';
import { LANDINGS } from '@/lib/content/landings';

const BASE = 'https://negasva.shop';

// Fecha de última modificación real POR RUTA. En lugar de un único timestamp
// global (que el crawler termina ignorando cuando se mueve en bloque), cada
// ruta lleva la fecha de su último cambio de contenido real; solo se actualiza
// la ruta que se toca. Las rutas no listadas caen al baseline de la última
// reescritura SEO. Los posts del blog ya usan su propia `date` (ver abajo).
const DEFAULT_LAST_MODIFIED = new Date('2026-07-05');
const ROUTE_LAST_MODIFIED: Record<string, Date> = {
  // Páginas legales reescritas a EN en la migración EN-only.
  '/privacy': new Date('2026-07-10'),
  '/terms': new Date('2026-07-10'),
  '/cookies': new Date('2026-07-10'),
};

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
    lastModified: r.lastModified ?? ROUTE_LAST_MODIFIED[r.path] ?? DEFAULT_LAST_MODIFIED,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
