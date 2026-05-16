'use client';

import { Instagram } from 'lucide-react';

export default function InstagramFloat() {
  return (
    <a
      href="https://instagram.com/negasva"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por Instagram @negasva"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] px-4 py-3 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
    >
      <Instagram className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-bold">@negasva</span>
    </a>
  );
}
