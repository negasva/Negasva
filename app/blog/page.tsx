import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { BLOG_POSTS } from '@/lib/content/blogPosts';
import Content from './Content';

// Server component: la lista de artículos llega en el HTML para SEO.
// El chrome traducible (encabezado, CTA) vive en Content.tsx ('use client').

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="Blog" path="/blog" />
      <Navbar />

      <Content>
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all p-6 md:p-8 bg-white flex items-start gap-6"
          >
            {post.image && (
              <div className="relative hidden sm:block w-36 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-primary-lighter">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="144px"
                />
              </div>
            )}
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
      </Content>

      <PageFooter />
    </div>
  );
}
