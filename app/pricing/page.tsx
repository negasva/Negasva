import Link from 'next/link';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { createAnonClient } from '@/lib/supabase/server';

// Server component: precios y paquetes llegan en el HTML inicial (SEO).
// ISR cada 5 min; si la BD no responde se usan los fallbacks.
export const revalidate = 300;

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  final_price: number;
}

// Fallbacks if the DB is unavailable — admin manages the real values.
// Must match lib/pricing/fallbacks.ts and the landing (app/page.tsx: $15 / $25 / +$15).
const FALLBACK_BODY_PRICES: Record<string, number> = { torso_only: 15, full_body: 25 };
const FALLBACK_PRICES: Record<string, number> = { background_standard: 15, background_custom: 15 };

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

async function fetchPricing() {
  const bodyPrices = { ...FALLBACK_BODY_PRICES };
  const priceMap = { ...FALLBACK_PRICES };
  let packages: PackageItem[] = [];

  const supabase = createAnonClient();
  if (supabase) {
    const [bodyRes, priceRes, pkgRes] = await Promise.all([
      supabase.from('body_types').select('slug, price_usd').eq('is_active', true),
      supabase.from('prices').select('key, amount'),
      supabase.from('packages').select('id, name, description, final_price').eq('active', true).order('final_price', { ascending: true }),
    ]);
    for (const b of bodyRes.data ?? []) bodyPrices[b.slug] = Number(b.price_usd);
    for (const p of priceRes.data ?? []) priceMap[p.key] = Number(p.amount);
    packages = pkgRes.data ?? [];
  }
  return { bodyPrices, priceMap, packages };
}

export default async function PricingPage() {
  const { bodyPrices, priceMap, packages } = await fetchPricing();

  const torso = bodyPrices.torso_only ?? 15;
  const full = bodyPrices.full_body ?? 25;
  const bgStandard = priceMap.background_standard ?? 15;
  const bgCustom = priceMap.background_custom ?? 15;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Our Pricing
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            Transparent, simple and no surprises
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">One Person — Torso</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Bust up to the waist</p>
                </div>
                <span className="font-black text-3xl text-primary">{usd(torso)}</span>
              </div>
              <ul className="space-y-2">
                {['Professional quality portrait', 'Full customization', 'Delivery in 48 hours'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-secondary-lighter text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">One Person — Full Body</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Full body character</p>
                </div>
                <span className="font-black text-3xl text-primary">{usd(full)}</span>
              </div>
              <ul className="space-y-2">
                {['Full body portrait', 'Multiple pose options', 'Custom accessories'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-secondary-lighter text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-secondary">Custom Background</h3>
                  <p className="text-sm text-secondary-lighter mt-1">Custom scene or background</p>
                </div>
                <span className="font-black text-3xl text-primary">+{usd(bgStandard)}</span>
              </div>
              <ul className="space-y-2">
                {['Show backgrounds or custom', 'Professional background design'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-secondary-lighter text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Packages / Promotions */}
          {packages.length > 0 && (
            <div className="mb-12">
              <h2 className="font-black text-2xl text-secondary mb-2 tracking-tighter">Packages & promotions</h2>
              <p className="text-sm text-secondary-lighter mb-6">Combine options and save with our packages.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-primary-lighter/40 rounded-xl p-6 border-2 border-primary-lighter hover:border-primary hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-black text-lg text-secondary leading-tight">{pkg.name}</h3>
                      <span className="font-black text-2xl text-primary flex-shrink-0">${pkg.final_price}</span>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-secondary-lighter">{pkg.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-secondary rounded-2xl p-12 text-white mb-12">
            <h3 className="font-black text-3xl mb-6 tracking-tighter">Budget Examples</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>1 person, full body</span>
                <span className="font-bold">{usd(full)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>2 people, full body</span>
                <span className="font-bold">{usd(2 * full)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary-lighter">
                <span>2 people + custom background</span>
                <span className="font-bold">{usd(2 * full + bgCustom)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold">Full family (4 people) + background</span>
                <span className="font-black text-2xl">{usd(4 * full * 0.85 + bgStandard)}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/order"
              className="inline-block rounded-lg bg-secondary px-10 py-5 font-bold text-white hover:bg-secondary-light transition-colors text-lg"
            >
              Start Now
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
