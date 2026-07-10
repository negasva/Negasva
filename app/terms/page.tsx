import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

// Server component estático EN (migración EN-only desde /terminos, con 301).
export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'NEGASVA terms of use: 48h delivery, refund policy, usage rights for your custom cartoon portrait, and how we handle your photos.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service — NEGASVA',
    description: 'Delivery, refunds and usage rights for your portrait.',
    url: 'https://negasva.shop/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-secondary-lighter">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. Acceptance of Terms</h2>
            <p className="text-secondary-lighter leading-relaxed">
              By accessing and using negasva.shop you agree to comply with these terms. If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. The Service</h2>
            <p className="text-secondary-lighter leading-relaxed">
              NEGASVA offers personalized digital portraits in cartoon styles (chaotic sci-fi, classic yellow-family, cozy-mystery, bright 90s-fantasy, and more). Portraits are delivered as high-resolution PNG/JPG files within{' '}
              <strong className="text-secondary">48 hours</strong> (or 24h with express delivery).
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. Payments and Refunds</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Payments are processed securely through our payment providers. Refunds are available within 7 days if you have not received your portrait or if the result does not match the instructions provided. Minor adjustments are included at no extra cost during the first 24 hours after delivery.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Copyright and Usage</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Once delivered, the portrait is yours for personal use: social media, printing, gifts, and decoration. Commercial use (sale, licensing, advertising) requires a prior written agreement. The cartoon styles we reference are trademarks of their respective owners.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Photos and Content</h2>
            <p className="text-secondary-lighter leading-relaxed">
              By uploading photos you confirm that you have the right to use those images. We do not accept photos of minors without explicit parental consent, nor inappropriate or illegal content.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Limitation of Liability</h2>
            <p className="text-secondary-lighter leading-relaxed">
              NEGASVA is not liable for indirect or consequential damages. Our maximum liability is limited to the amount paid for the order in question.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">7. Changes to the Terms</h2>
            <p className="text-secondary-lighter leading-relaxed">
              We may update these terms at any time. We will post changes on this page with the update date.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">8. Contact</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Questions about these terms? Write to us at{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter />
    </div>
  );
}
