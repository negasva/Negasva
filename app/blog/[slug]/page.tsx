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
    openGraph: {
      type: 'article',
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://negasva.shop/blog/${post.slug}`,
      publishedTime: post.date,
      images: [{ url: post.image, width: 819, height: 461, alt: post.imageAlt }],
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
    image: `https://negasva.shop${post.image}`,
    author: { '@type': 'Organization', name: 'NEGASVA', url: 'https://negasva.shop' },
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
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://negasva.shop' },
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
            <Link href="/" className="hover:text-primary">Inicio</Link>
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
            <time dateTime={post.date}>{post.dateLabel}</time> · Equipo NEGASVA
          </p>
        </div>
      </section>

      {/* Artículo */}
      <article className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
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
              <h2 className="font-black text-xl text-secondary mb-4">Estilos mencionados en este artículo</h2>
              <div className="flex flex-wrap gap-3">
                {related.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/styles/${s.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border-2 border-primary bg-white px-4 py-2 font-bold text-primary hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    Retrato {s.name}
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
            ¿Listo para tu retrato?
          </h2>
          <p className="text-white/70 mb-8">Desde $15 USD · Entrega en 48h · +1000 clientes felices</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Pedir mi retrato
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Más artículos */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-8">Sigue leyendo</h2>
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
