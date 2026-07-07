import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { BLOG_POSTS, getPostBySlug } from '@/lib/content/blogPosts';
import { STYLES_CONTENT } from '@/lib/content/styles';

// Server component estático: contenido completo en el HTML para SEO.

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    // Sin imagen por post: la OG global del sitio (app/opengraph-image.tsx)
    // aplica por defecto.
    openGraph: {
      type: 'article',
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://negasva.shop/blog/${post.slug}`,
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = STYLES_CONTENT.filter((s) => post.relatedStyleSlugs.includes(s.slug));
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    image: 'https://negasva.shop/opengraph-image',
    author: {
      '@type': 'Person',
      name: 'Negasva',
      jobTitle: 'Illustrator & Founder',
      url: 'https://negasva.shop/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NEGASVA',
      logo: { '@type': 'ImageObject', url: 'https://negasva.shop/favicon.png' },
    },
    mainEntityOfPage: `https://negasva.shop/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://negasva.shop' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://negasva.shop/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://negasva.shop/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="breadcrumb" className="mb-4 text-sm text-secondary-lighter">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
          </nav>
          <span className="inline-block bg-primary-lighter px-3 py-1 rounded-full text-xs font-bold text-primary mb-4">
            {post.category}
          </span>
          <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
            {post.title}
          </h1>
          <p className="text-sm text-secondary-lighter">
            <time dateTime={post.date}>{post.dateLabel}</time> · By{' '}
            <Link href="/about" className="hover:text-primary underline">Negasva, the artist</Link>
          </p>
        </div>
      </section>

      {/* Artículo */}
      <article className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
          {post.image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary-lighter mb-10">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          <p className="text-lg text-secondary-lighter leading-relaxed mb-10">{post.intro}</p>

          {post.sections.map((section) => (
            <div key={section.h2} className="mb-10">
              <h2 className="font-black text-2xl md:text-3xl tracking-tighter text-secondary mb-4">
                {section.h2}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-secondary-lighter leading-relaxed mb-4">{p}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 space-y-2 text-secondary-lighter">
                  {section.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}

          {/* Enlaces internos a estilos relacionados */}
          {related.length > 0 && (
            <div className="rounded-2xl bg-primary-lighter/30 p-8 mb-10">
              <h2 className="font-black text-xl text-secondary mb-4">Styles mentioned in this article</h2>
              <div className="flex flex-wrap gap-3">
                {related.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/styles/${s.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border-2 border-primary bg-white px-4 py-2 font-bold text-primary hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    {s.name} Portrait
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
                <Link
                  href="/styles"
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-primary-lighter bg-white px-4 py-2 font-bold text-secondary hover:border-primary hover:text-primary transition-all text-sm"
                >
                  All styles
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Enlaces internos a landings de intención */}
          {post.relatedLandings && post.relatedLandings.length > 0 && (
            <div className="rounded-2xl bg-primary-lighter/30 p-8 mb-10">
              <h2 className="font-black text-xl text-secondary mb-4">Gift ideas from this article</h2>
              <div className="flex flex-wrap gap-3">
                {post.relatedLandings.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-1 rounded-xl border-2 border-primary bg-white px-4 py-2 font-bold text-primary hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    {l.label}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

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

      {/* Más artículos */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-8">Keep reading</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all p-6"
              >
                <span className="inline-block bg-primary-lighter px-3 py-1 rounded-full text-xs font-bold text-primary mb-3">
                  {p.category}
                </span>
                <h3 className="font-black text-lg text-secondary group-hover:text-primary transition-colors tracking-tighter mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-secondary-lighter line-clamp-3">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
