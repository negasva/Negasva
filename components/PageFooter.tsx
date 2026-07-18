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
        { label_es: 'Cómo funciona', label_en: 'How It Works', label_fr: 'Comment ça marche', href: '/how-it-works' },
        { label_es: 'Estilos', label_en: 'Styles', label_fr: 'Styles', href: '/styles' },
        { label_es: 'Precios', label_en: 'Pricing', label_fr: 'Tarifs', href: '/pricing' },
        { label_es: 'Galería', label_en: 'Gallery', label_fr: 'Galerie', href: '/gallery' },
        { label_es: 'Productos', label_en: 'Products', label_fr: 'Produits', href: '/products' },
        { label_es: 'Seguimiento', label_en: 'Tracking', label_fr: 'Suivi', href: '/track-order' },
      ],
    },
    {
      title_es: 'Empresa', title_en: 'Company', title_fr: 'Entreprise',
      links: [
        { label_es: 'Sobre', label_en: 'About', label_fr: 'À propos', href: '/about' },
        { label_es: 'Blog', label_en: 'Blog', label_fr: 'Blog', href: '/blog' },
        { label_es: 'Contacto', label_en: 'Contact', label_fr: 'Contact', href: '/contact' },
        { label_es: 'FAQ', label_en: 'FAQ', label_fr: 'FAQ', href: '/faq' },
      ],
    },
    {
      title_es: 'Legal', title_en: 'Legal', title_fr: 'Légal',
      links: [
        { label_es: 'Privacidad', label_en: 'Privacy', label_fr: 'Confidentialité', href: '/privacy' },
        { label_es: 'Términos', label_en: 'Terms', label_fr: 'Conditions', href: '/terms' },
        { label_es: 'Cookies', label_en: 'Cookies', label_fr: 'Cookies', href: '/cookies' },
      ],
    },
  ],
};

// Columnas SEO fijas (sitio EN estático): enlazan las landings de intención y
// de estilo desde todas las páginas. No editables desde el admin a propósito.
const SEO_COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: 'Gifts & Occasions',
    links: [
      { label: 'Couple Portrait', href: '/custom-couple-portrait' },
      { label: 'Family Portrait', href: '/custom-family-portrait' },
      { label: 'Pet Portrait', href: '/custom-pet-portrait' },
      { label: 'Memorial Portrait', href: '/memorial-portrait' },
      { label: 'Christmas Gift', href: '/gifts/christmas' },
      { label: 'Anniversary Gift', href: '/gifts/anniversary' },
      { label: "Valentine's Day Gift", href: '/gifts/valentines-day' },
      { label: 'Birthday Gift', href: '/gifts/birthday' },
      { label: "Mother's Day Gift", href: '/gifts/mothers-day' },
      { label: "Father's Day Gift", href: '/gifts/fathers-day' },
      { label: 'Wedding Gift', href: '/gifts/wedding' },
      { label: 'Hand-Drawn, No AI', href: '/hand-drawn-no-ai' },
    ],
  },
  {
    title: 'Styles',
    links: [
      { label: 'Simpsons Style', href: '/styles/simpsons-style-portrait' },
      { label: 'Rick and Morty Style', href: '/styles/rick-and-morty-style-portrait' },
      { label: 'Family Guy Style', href: '/styles/family-guy-style-portrait' },
      { label: 'South Park Style', href: '/styles/south-park-style-portrait' },
      { label: 'Anime Style', href: '/styles/anime-style-portrait' },
      { label: 'Disney-Pixar Style', href: '/styles/disney-pixar-style-portrait' },
      { label: 'Gravity Falls Style', href: '/styles/gravity-falls-style-portrait' },
      { label: 'Fairly OddParents Style', href: '/styles/fairly-oddparents-style-portrait' },
      { label: 'Futurama Style', href: '/styles/futurama-style-portrait' },
      { label: "Bob's Burgers Style", href: '/styles/bobs-burgers-style-portrait' },
      { label: 'American Dad Style', href: '/styles/american-dad-style-portrait' },
      { label: 'King of the Hill Style', href: '/styles/king-of-the-hill-style-portrait' },
      { label: 'Studio Ghibli Style', href: '/styles/studio-ghibli-style-portrait' },
      { label: 'Cartoon Yourself', href: '/cartoon-yourself' },
    ],
  },
];

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
        {/* Móvil: 2 columnas agrupadas por sección (compacto) → desktop igual. */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 md:gap-12 mb-12">
          {/* Brand + social */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
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
            <div key={i} className="text-left">
              <h4 className="font-bold text-white mb-4">{pick(col.title_es, col.title_en, col.title_fr)}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-block py-1 text-white/70 hover:text-primary transition-colors">
                      {pick(link.label_es, link.label_en, link.label_fr)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {SEO_COLUMNS.map((col) => (
            <div key={col.title} className="text-left">
              <h4 className="font-bold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-block py-1 text-white/70 hover:text-primary transition-colors">
                      {link.label}
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
