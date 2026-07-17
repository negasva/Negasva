import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { createAnonClient } from '@/lib/supabase/server';
import { faqContent } from '@/lib/i18n/pages/faq';

// Server component: las FAQs llegan en el HTML inicial + FAQPage JSON-LD (SEO).
// ISR cada 5 min; si la BD no responde se sirve el contenido estático EN.
export const revalidate = 300;

const tx = faqContent.en;

// ponytail: el contenido del admin se sirve tal cual (sin auto-traducción
// cliente); el sitio es EN estático — las FAQs de BD deben escribirse en EN.
const FALLBACK_FAQS: Array<{ q: string; a: string }> = [
  { q: tx.faq1_q, a: tx.faq1_a },
  { q: tx.faq2_q, a: tx.faq2_a },
  { q: tx.faq3_q, a: tx.faq3_a },
  { q: tx.faq4_q, a: tx.faq4_a },
  { q: tx.faq5_q, a: tx.faq5_a },
  { q: tx.faq6_q, a: tx.faq6_a },
  { q: tx.faq7_q, a: tx.faq7_a },
  { q: tx.faq8_q, a: tx.faq8_a },
  { q: tx.faq9_q, a: tx.faq9_a },
  { q: tx.faq10_q, a: `${tx.faq10_a_before} [${tx.faq10_a_link_label}](/track-order) ${tx.faq10_a_after}` },
];

// Render admin-written answers, supporting [texto](/ruta) links.
function renderAnswer(answer: string) {
  const parts = answer.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={i}>{part}</span>;
    const [, label, href] = match;
    if (href.startsWith('/')) {
      return (
        <Link key={i} href={href} className="text-primary font-bold underline">
          {label}
        </Link>
      );
    }
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
        {label}
      </a>
    );
  });
}

// Texto plano para el schema: quita la sintaxis [label](url) dejando el label.
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

async function fetchFaqs(): Promise<Array<{ q: string; a: string }>> {
  const supabase = createAnonClient();
  if (!supabase) return FALLBACK_FAQS;
  const { data, error } = await supabase
    .from('faqs')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data?.length) return FALLBACK_FAQS;
  return data.map((f) => ({ q: f.question, a: f.answer }));
}

export default async function FaqPage() {
  const faqs = await fetchFaqs();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-4xl sm:text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter">
            {tx.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-primary-lighter bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-secondary">{item.q}</h2>
              <div className="mt-3 text-secondary-lighter leading-relaxed">
                {renderAnswer(item.a)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-black text-3xl text-white tracking-tighter mb-4">
            {tx.cta_title}
          </h2>
          <p className="text-gray-300 mb-6">
            {tx.cta_subtitle}
          </p>
          <a
            href="https://instagram.com/negasva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-primary px-8 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            {tx.cta_button}
          </a>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
