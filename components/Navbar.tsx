'use client';

import { memo } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="md" variant="dark" />
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <Link
              href="/studio"
              className="bg-secondary rounded-lg px-5 py-2.5 text-sm font-black text-white hover:bg-secondary-light transition-colors shadow-sm"
            >
              {t.nav.create}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
