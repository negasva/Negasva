import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { BLOG_POSTS } from '@/lib/content/blogPosts';

// Server component: la lista de artículos llega en el HTML para SEO.

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="Blog" path="/blog" />
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Blog</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Guías e Inspiración
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Consejos, historias y novedades del mundo de los retratos animados personalizados.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all p-6 md:p-8 bg-white flex items-start gap-6"
            >
              <div className="relative hidden sm:block w-36 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-primary-lighter">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="144px"
                />
              </div>
              <div className="flex-1">
                <span className="inline-block bg-primary-lighter px-3 py-1 rounded-full text-xs font-bold text-primary mb-3">
                  {post.category}
                </span>
                <h2 className="font-black text-2xl text-secondary mb-2 group-hover:text-primary transition-colors tracking-tighter">
                  {post.title}
                </h2>
                <p className="text-secondary-lighter mb-3 leading-relaxed">{post.excerpt}</p>
                <p className="text-xs text-secondary-lighter">
                  <time dateTime={post.date}>{post.dateLabel}</time>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-lighter group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            ¿Listo para tu retrato?
          </h2>
          <p className="text-white/70 mb-8">Desde $20 · Entrega en 48h · +1000 clientes felices</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark transition-all hover:shadow-xl"
          >
            Pedir mi retrato
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
