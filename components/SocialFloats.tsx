'use client';

import { usePathname } from 'next/navigation';

// Botones sociales flotantes (Instagram, TikTok, Behance). Se apilan en
// vertical en la esquina inferior derecha y aparecen en todo el sitio salvo
// en el panel de administración.
const SOCIALS = [
  {
    key: 'instagram',
    href: 'https://instagram.com/negasva',
    label: '@negasva',
    ariaLabel: 'Escríbenos por Instagram @negasva',
    className:
      'bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/@negasva',
    label: '@negasva',
    ariaLabel: 'Síguenos en TikTok @negasva',
    className: 'bg-black text-white',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    key: 'behance',
    href: 'https://www.behance.net/negasva',
    label: 'negasva',
    ariaLabel: 'Míranos en Behance @negasva',
    className: 'bg-[#1769ff] text-white',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
      </svg>
    ),
  },
];

export default function SocialFloats() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  // Posición vertical del stack para que no tape los CTA fijos que hay al
  // fondo en móvil:
  //  - Landing "/": el sticky CTA ocupa el fondo hasta md.
  //  - Order "/order": la barra de checkout es fija abajo (móvil y desktop).
  //  - Resto: pegado al fondo.
  let bottom = 'bottom-5';
  if (pathname === '/') bottom = 'bottom-24 md:bottom-5';
  else if (pathname.startsWith('/order')) bottom = 'bottom-24';

  return (
    <div
      className={`fixed ${bottom} right-5 z-50 flex flex-col items-end gap-2`}
    >
      {SOCIALS.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.ariaLabel}
          className={`flex items-center gap-2 rounded-full px-4 py-3 shadow-xl hover:scale-105 active:scale-95 transition-transform sm:w-44 ${s.className}`}
        >
          {s.icon}
          <span className="hidden sm:inline text-sm font-bold">{s.label}</span>
        </a>
      ))}
    </div>
  );
}
