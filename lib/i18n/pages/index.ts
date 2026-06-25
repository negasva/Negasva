// Registro central de contenido editable por página (es/en/fr).
// Lo consume el editor del admin (/adminlanding/contenido) para listar TODAS las
// páginas y sus campos, y las páginas públicas vía usePageText().

import type { PageDict } from '@/lib/i18n/pageContent';
import { blogContent } from './blog';
import { cookiesContent } from './cookies';
import { faqContent } from './faq';
import { privacidadContent } from './privacidad';
import { seguimientoContent } from './seguimiento';
import { terminosContent } from './terminos';

export interface PageRegistryEntry {
  key: string;            // pageKey usado en page_content / usePageText
  label: string;          // nombre legible en el panel
  defaults: PageDict<Record<string, string>>;
}

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  { key: 'faq',          label: 'FAQ',                 defaults: faqContent },
  { key: 'blog',         label: 'Blog (portada)',      defaults: blogContent },
  { key: 'seguimiento',  label: 'Seguimiento',         defaults: seguimientoContent },
  { key: 'cookies',      label: 'Cookies',             defaults: cookiesContent },
  { key: 'privacidad',   label: 'Privacidad',          defaults: privacidadContent },
  { key: 'terminos',     label: 'Términos',            defaults: terminosContent },
];
