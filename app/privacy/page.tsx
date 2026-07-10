import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

// Server component estático EN (migración EN-only desde /privacidad, con 301).
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How NEGASVA collects, uses and protects your personal information and photos when you order your custom cartoon portrait. Your data is never sold to third parties.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — NEGASVA',
    description: 'How we protect your data and your photos.',
    url: 'https://negasva.shop/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-secondary-lighter">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. Introduction</h2>
            <p className="text-secondary-lighter leading-relaxed">
              At NEGASVA we respect your privacy. This policy explains what data we collect, how we use it, and what rights you have over it when you use our custom cartoon portrait service.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. Information We Collect</h2>
            <p className="text-secondary-lighter leading-relaxed mb-4">We only collect the information needed to create your portrait:</p>
            <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
              <li>Name and email address</li>
              <li>Payment information (processed by our payment provider — we never store card data)</li>
              <li>Photos of the people to be portrayed</li>
              <li>Style, background, and instruction preferences</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. How We Use Your Information</h2>
            <p className="text-secondary-lighter leading-relaxed">
              We use your data exclusively to process and deliver your order, send you status updates, and improve our services.{' '}
              <strong className="text-secondary">We never sell or share your information with third parties for advertising purposes.</strong>
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Storage and Security</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Your data is stored on secure servers via Supabase (encrypted PostgreSQL). Photos are kept only for as long as needed to create the portrait and are automatically deleted 30 days after delivery.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Your Rights</h2>
            <p className="text-secondary-lighter leading-relaxed">
              You have the right to access, correct, or delete your personal information at any time. To exercise these rights, write to us at{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Changes to This Policy</h2>
            <p className="text-secondary-lighter leading-relaxed">
              We reserve the right to update this policy. Significant changes will be notified by email to registered customers.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">7. Contact</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Questions about privacy? Write to us at{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter />
    </div>
  );
}
