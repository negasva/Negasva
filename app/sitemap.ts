import type { MetadataRoute } from 'next';
import { STYLES_CONTENT } from '@/lib/content/styles';
import { BLOG_POSTS } from '@/lib/content/blogPosts';

const BASE = 'https://negasva.shop';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/order', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/styles', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/precios', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/galeria', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/sobre', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/contacto', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/seguimiento', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/privacidad', priority: 0.2, changeFrequency: 'monthly' },
    { path: '/terminos', priority: 0.2, changeFrequency: 'monthly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'monthly' },
    // Landing individual por estilo — páginas de captación SEO
    ...STYLES_CONTENT.map((s) => ({
      path: `/styles/${s.slug}`,
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    })),
    // Artículos del blog
    ...BLOG_POSTS.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ];

  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
