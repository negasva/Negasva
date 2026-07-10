import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

// Server component estático EN (migración EN-only; el slug /cookies ya es EN).
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Learn which cookies NEGASVA uses (essential, analytics and functional), what they do, and how you can control them from your browser.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy — NEGASVA',
    description: 'Which cookies we use and how to control them.',
    url: 'https://negasva.shop/cookies',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-secondary-lighter">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">1. What Are Cookies?</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Cookies are small text files stored in your browser when you visit a website. They are used to improve your browsing experience, remember preferences, and analyze traffic.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">2. Cookies We Use</h2>
            <p className="text-secondary-lighter leading-relaxed mb-4">We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
              <li><strong className="text-secondary">Essential:</strong> Required for the basic operation of the site (session, cart).</li>
              <li><strong className="text-secondary">Analytics:</strong> Google Analytics, to understand how the site is used anonymously.</li>
              <li><strong className="text-secondary">Functional:</strong> They remember your selected language and currency.</li>
              <li><strong className="text-secondary">Advertising:</strong> To personalize relevant ads on social media.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">3. Cookie Control</h2>
            <p className="text-secondary-lighter leading-relaxed">
              You can control and delete cookies from your browser settings. Keep in mind that disabling essential cookies may affect how the site works (for example, the cart or language).
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">4. Third-Party Cookies</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Some external services such as Google Analytics or our payment providers may install their own cookies. We do not control those cookies; check each provider&rsquo;s privacy policy for more information.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">5. Changes to This Policy</h2>
            <p className="text-secondary-lighter leading-relaxed">
              We reserve the right to update this policy. Changes will be posted on this same page.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">6. Contact</h2>
            <p className="text-secondary-lighter leading-relaxed">
              Questions about our cookies? Write to us at{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>

      <PageFooter />
    </div>
  );
}
