'use client';

import { useEffect } from 'react';

/**
 * La fuente de los títulos (Talina) no incluye glifos con tilde ni diéresis, así
 * que esos caracteres se veían rotos SOLO en los encabezados (h1–h6). Este
 * componente quita, únicamente en los títulos, la tilde aguda (á é í ó ú) y la
 * diéresis (ü) — conservando la eñe (ñ), que es una letra propia. El texto del
 * cuerpo (Montserrat) mantiene su ortografía correcta intacta.
 *
 * Se hace en el cliente recorriendo los nodos de texto dentro de cada
 * encabezado (para no romper spans/estructura) y se re-aplica ante cambios del
 * DOM (navegación, pasos del wizard, etc.). El HTML del servidor conserva los
 * acentos, así que el SEO y la accesibilidad no se ven afectados.
 */
// U+0301 = tilde aguda combinante, U+0308 = diéresis combinante.
// No incluye U+0303 (tilde de la eñe), que se conserva.
const ACCENTS = /[\u0301\u0308]/g;

function stripAccents(text: string): string {
  const stripped = text.normalize('NFD').replace(ACCENTS, '').normalize('NFC');
  return stripped === text ? text : stripped;
}

function stripHeadings(): void {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((h) => {
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const current = node.nodeValue ?? '';
      const next = stripAccents(current);
      // Solo escribimos si cambió, para no disparar el observer en bucle.
      if (next !== current) node.nodeValue = next;
      node = walker.nextNode();
    }
  });
}

export default function TitleAccentStripper() {
  useEffect(() => {
    let scheduled = false;
    const run = () => {
      scheduled = false;
      stripHeadings();
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(run);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
