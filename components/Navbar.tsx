'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-primary-lighter">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/studio"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
            >
              {t.nav.create}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
