import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Upload, PenTool, Mail, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { STYLES_CONTENT } from '@/lib/content/styles';

// Server component estático (SEO): keyword "custom cartoon portrait process /
// how it works" + refuerzo del ángulo no-AI.

export const metadata: Metadata = {
  title: 'How It Works — Hand-Drawn Custom Portraits in 48h',
  description:
    'How our custom cartoon portrait process works: upload your photo, a real artist draws it by hand — no AI — and you receive it in 48 hours, from $15.',
  keywords: ['custom cartoon portrait process', 'how it works custom portrait', 'hand drawn portrait from photo', 'no AI portrait'],
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works — Hand-Drawn Custom Portraits in 48h',
    description: 'Upload your photo, a real artist draws it by hand — no AI — delivered in 48 hours, from $15.',
    url: 'https://negasva.shop/how-it-works',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — Hand-Drawn Custom Portraits in 48h',
    description: 'Upload your photo, a real artist draws it by hand — no AI — delivered in 48 hours, from $15.',
  },
};

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your photo',
    body:
      'Start your order by choosing a style and uploading one clear photo of each person or pet. Front-facing, good light, no heavy filters — that is all we need. Add your instructions: the pose you want, accessories to keep, a background idea (your city, a favorite show scene, a trip you took together). If the photo will not give a good result, we contact you before drawing a single line and ask for another one — or refund you in full.',
  },
  {
    icon: PenTool,
    title: 'A real artist draws it — no AI',
    body:
      'This is where we are different. Your photo is not fed into a filter or an image generator: a real artist studies it and redraws you stroke by stroke in the style you picked. The details that make you recognizable — your exact hairstyle, your glasses, that one crooked smile — are drawn on purpose, not hallucinated by a model. Every portrait is built from scratch, which is why two orders never look the same.',
  },
  {
    icon: Mail,
    title: 'Receive it in 48 hours',
    body:
      'Your finished portrait lands in your inbox within 48 hours (24h with express) as a high-resolution PNG and JPG, ready to print, frame, or put on a mug, canvas or t-shirt. You then have 24 hours to request adjustments — minor tweaks like hair color, an accessory or an expression are included at no cost.',
  },
];

// ponytail: fotos reales del proceso pendientes (P1.10) — placeholder visual
// hasta que existan los assets; el copy SEO no depende de ellas.
function ProcessPhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center aspect-video rounded-2xl bg-primary-lighter/40 border-2 border-dashed border-primary-lighter text-primary-dark">
      <span className="text-xs font-bold p-3 text-center">{label}</span>
    </div>
  );
}

const HOWTO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to turn your photo into a hand-drawn custom cartoon portrait',
  description:
    'Upload your photo, a real artist draws it by hand in your favorite cartoon style — no AI — and you receive it in 48 hours, from $15.',
  totalTime: 'P2D',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '15' },
  step: STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.body,
  })),
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema name="How It Works" path="/how-it-works" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_SCHEMA) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-4xl md:text-6xl tracking-tighter text-secondary mb-4">
            How It Works — Hand-Drawn Custom Portraits in 48h
          </h1>
          <p className="text-lg text-secondary-lighter">
            From your photo to a cartoon character you will actually recognize, in three steps.
            100% drawn by a real artist. No AI, ever.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl space-y-16">
          {STEPS.map((step, i) => (
            <div key={step.title} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={i % 2 === 1 ? 'md:order-last' : ''}>
                <h2 className="flex items-center gap-3 font-black text-2xl md:text-3xl tracking-tighter text-secondary mb-4">
                  <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5" />
                  </span>
                  {i + 1}. {step.title}
                </h2>
                <p className="text-secondary-lighter leading-relaxed">{step.body}</p>
              </div>
              <ProcessPhotoPlaceholder label={`Process photo: ${step.title.toLowerCase()}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Why no AI */}
      <section className="bg-[#FFF1F7] py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-4">
            Why hand-drawn beats AI
          </h2>
          <p className="text-secondary-lighter leading-relaxed mb-6">
            AI portrait apps give everyone the same generic face: melted details, extra fingers,
            a smile that is almost — but not quite — yours. A hand-drawn portrait keeps what makes
            you recognizable, because a human decided every line. That is also why our portraits
            survive printing at large sizes: clean linework instead of upscaled noise.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              'Every portrait drawn from scratch by a real artist',
              'A revision round included — tell us what to tweak',
              'High-resolution files ready to print, frame or gift',
              'Full refund if your photo can not give a good result',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-secondary-lighter">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/hand-drawn-no-ai" className="font-black underline underline-offset-4 decoration-primary decoration-2">
            Read more about our no-AI promise →
          </Link>
        </div>
      </section>

      {/* Styles links */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-black text-3xl tracking-tighter text-secondary mb-6">
            Pick your style and start
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {STYLES_CONTENT.map((s) => (
              <Link
                key={s.slug}
                href={`/styles/${s.slug}`}
                className="rounded-full border-2 border-primary-lighter px-5 py-2.5 text-sm font-bold text-secondary hover:border-primary hover:text-primary-dark transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl text-white mb-4 tracking-tighter">
            Ready to see yourself in cartoon form?
          </h2>
          <p className="text-white/70 mb-8">From $15 USD · Delivered in 48h · +1000 happy clients</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Order my portrait
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
