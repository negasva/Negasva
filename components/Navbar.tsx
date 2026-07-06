'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Links SEO del sitio EN estático — texto fijo en inglés, sin i18n.
const NAV_LINKS = [
  { href: '/styles', label: 'Styles' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

function Navbar() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="md" variant="dark" />

          {/* Desktop: all controls inline */}
          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-bold text-secondary hover:text-primary-dark transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <CurrencySwitcher />
            <Link
              href="/order"
              className="bg-secondary rounded-lg px-5 py-2.5 text-sm font-black text-white hover:bg-secondary-light transition-colors shadow-sm"
            >
              {t.nav.create}
            </Link>
          </div>

          {/* Mobile: primary CTA stays visible, the rest collapses into a menu */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/order"
              className="bg-secondary rounded-lg px-4 py-2 text-sm font-black text-white hover:bg-secondary-light transition-colors shadow-sm"
            >
              {t.nav.create}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={t.nav.menu}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-primary-lighter text-secondary hover:border-primary hover:text-secondary focus:outline-none focus:border-primary transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown: currency picker, out of the cramped top row.
          El selector de idioma se quitó del navbar: las páginas SEO son EN
          estático y el navegador ofrece la traducción; sigue vivo en /order,
          donde el wizard sí traduce completo. */}
      {menuOpen && (
        <div className="md:hidden border-t border-primary-lighter bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-bold text-secondary hover:text-primary-dark transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <CurrencySwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}

export default memo(Navbar);
