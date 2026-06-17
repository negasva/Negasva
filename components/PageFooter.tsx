'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';

interface FooterLink { label_es: string; label_en: string; label_fr?: string; href: string; }
interface FooterColumn { title_es: string; title_en: string; title_fr?: string; links: FooterLink[]; }
interface FooterSocial { label: string; url: string; }
interface FooterConfig {
  tagline_es: string;
  tagline_en: string;
  tagline_fr?: string;
  social: FooterSocial[];
  columns: FooterColumn[];
}

// Fallback si /api/landing-config no responde — el admin gestiona el contenido real
const DEFAULT_FOOTER: FooterConfig = {
  tagline_es: 'Retratos personalizados de calidad profesional',
  tagline_en: 'Professional quality custom portraits',
  tagline_fr: 'Portraits personnalisés de qualité professionnelle',
  social: [
    { label: 'Instagram', url: 'https://instagram.com/negasva' },
    { label: 'TikTok', url: 'https://tiktok.com/@negasva' },
  ],
  columns: [
    {
      title_es: 'Producto', title_en: 'Product', title_fr: 'Produit',
      links: [
        { label_es: 'Estilos', label_en: 'Styles', label_fr: 'Styles', href: '/estilos' },
        { label_es: 'Precios', label_en: 'Pricing', label_fr: 'Tarifs', href: '/precios' },
        { label_es: 'Galería', label_en: 'Gallery', label_fr: 'Galerie', href: '/galeria' },
        { label_es: 'Seguimiento', label_en: 'Tracking', label_fr: 'Suivi', href: '/seguimiento' },
      ],
    },
    {
      title_es: 'Empresa', title_en: 'Company', title_fr: 'Entreprise',
      links: [
        { label_es: 'Sobre', label_en: 'About', label_fr: 'À propos', href: '/sobre' },
        { label_es: 'Blog', label_en: 'Blog', label_fr: 'Blog', href: '/blog' },
        { label_es: 'Contacto', label_en: 'Contact', label_fr: 'Contact', href: '/contacto' },
        { label_es: 'FAQ', label_en: 'FAQ', label_fr: 'FAQ', href: '/faq' },
      ],
    },
    {
      title_es: 'Legal', title_en: 'Legal', title_fr: 'Légal',
      links: [
        { label_es: 'Privacidad', label_en: 'Privacy', label_fr: 'Confidentialité', href: '/privacidad' },
        { label_es: 'Términos', label_en: 'Terms', label_fr: 'Conditions', href: '/terminos' },
        { label_es: 'Cookies', label_en: 'Cookies', label_fr: 'Cookies', href: '/cookies' },
      ],
    },
  ],
};

interface PageFooterProps {
  minimal?: boolean;
}

// Backfill del francés desde el footer por defecto cuando la BD (es/en) no lo
// trae: títulos por índice, enlaces por href, tagline global. Así el francés no
// cae a inglés/español en el contenido editable.
function withFrenchFallback(footer: FooterConfig): FooterConfig {
  const frByHref = new Map<string, string>();
  DEFAULT_FOOTER.columns.forEach((c) =>
    c.links.forEach((l) => { if (l.label_fr) frByHref.set(l.href, l.label_fr); }),
  );
  return {
    ...footer,
    tagline_fr: footer.tagline_fr || DEFAULT_FOOTER.tagline_fr,
    columns: footer.columns.map((col, i) => ({
      ...col,
      title_fr: col.title_fr || DEFAULT_FOOTER.columns[i]?.title_fr,
      links: col.links.map((link) => ({
        ...link,
        label_fr: link.label_fr || frByHref.get(link.href),
      })),
    })),
  };
}

function PageFooter({ minimal = false }: PageFooterProps) {
  const { t, lang } = useLanguage();
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);

  useEffect(() => {
    if (minimal) return;
    cachedFetchJSON<{ footer?: FooterConfig }>('/api/landing-config', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((data) => {
        if (data?.footer?.columns?.length) setFooter(withFrenchFallback(data.footer));
      })
      .catch(() => null);
  }, [minimal]);

  if (minimal) {
    return (
      <footer className="bg-secondary py-12 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-white/50">{t.footer.rights}</p>
        </div>
      </footer>
    );
  }

  // Selección por idioma con fallback fr → en → es.
  const pick = (esVal: string, enVal: string, frVal?: string) =>
    lang === 'fr' ? (frVal || enVal || esVal) : lang === 'en' ? enVal : esVal;

  return (
    <footer className="bg-secondary py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Brand + social */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo size="lg" variant="light" className="mb-4 block" />
            <p className="text-sm mb-6 text-white/70">{pick(footer.tagline_es, footer.tagline_en, footer.tagline_fr)}</p>
            <div className="flex gap-4 justify-center md:justify-start">
              {footer.social.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-colors text-sm font-bold"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {footer.columns.map((col, i) => (
            <div key={i} className="text-center md:text-left">
              <h4 className="font-bold text-white mb-4">{pick(col.title_es, col.title_en, col.title_fr)}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-primary transition-colors">
                      {pick(link.label_es, link.label_en, link.label_fr)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/50">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(PageFooter);
