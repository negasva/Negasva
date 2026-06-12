'use client';

import { usePathname } from 'next/navigation';

export default function InstagramFloat() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  // En la landing el sticky CTA ocupa la parte inferior en mobile.
  const aboveStickyCta = pathname === '/' ? 'bottom-24 md:bottom-5' : 'bottom-5';

  return (
    <a
      href="https://instagram.com/negasva"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por Instagram @negasva"
      className={`fixed ${aboveStickyCta} right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] px-4 py-3 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform`}
    >
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
      <span className="hidden sm:inline text-sm font-bold">@negasva</span>
    </a>
  );
}
