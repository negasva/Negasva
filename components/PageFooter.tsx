'use client';

import { memo } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PageFooterProps {
  minimal?: boolean;
}

function PageFooter({ minimal = false }: PageFooterProps) {
  const { t } = useLanguage();

  if (minimal) {
    return (
      <footer className="bg-secondary py-12 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-cream/50">{t.footer.rights}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-secondary py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <Logo size="lg" variant="light" className="mb-4 block" />
            <p className="text-sm mb-6 text-cream/50">{t.footer.tagline}</p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/negasva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/50 hover:text-primary transition-colors text-sm font-bold"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com/@negasva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/50 hover:text-primary transition-colors text-sm font-bold"
              >
                TikTok
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/estilos" className="text-cream/50 hover:text-primary transition-colors">{t.footer.styles}</Link></li>
              <li><Link href="/precios" className="text-cream/50 hover:text-primary transition-colors">{t.footer.pricing}</Link></li>
              <li><Link href="/galeria" className="text-cream/50 hover:text-primary transition-colors">{t.footer.gallery}</Link></li>
              <li><Link href="/productos" className="text-cream/50 hover:text-primary transition-colors">Productos</Link></li>
              <li><Link href="/seguimiento" className="text-cream/50 hover:text-primary transition-colors">Seguimiento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre" className="text-cream/50 hover:text-primary transition-colors">{t.footer.about}</Link></li>
              <li><Link href="/blog" className="text-cream/50 hover:text-primary transition-colors">{t.footer.blog}</Link></li>
              <li><Link href="/contacto" className="text-cream/50 hover:text-primary transition-colors">{t.footer.contact}</Link></li>
              <li><Link href="/faq" className="text-cream/50 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="text-cream/50 hover:text-primary transition-colors">{t.footer.privacy}</Link></li>
              <li><Link href="/terminos" className="text-cream/50 hover:text-primary transition-colors">{t.footer.terms}</Link></li>
              <li><Link href="/cookies" className="text-cream/50 hover:text-primary transition-colors">{t.footer.cookies}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/10 pt-8">
          <p className="text-center text-sm text-cream/30">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(PageFooter);
