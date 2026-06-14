// Registro central de contenido editable por página (es/en/fr).
// Lo consume el editor del admin (/admin/contenido) para listar TODAS las
// páginas y sus campos, y las páginas públicas vía usePageText().

import type { PageDict } from '@/lib/i18n/pageContent';
import { blogContent } from './blog';
import { cookiesContent } from './cookies';
import { faqContent } from './faq';
import { loginContent } from './login';
import { privacidadContent } from './privacidad';
import { productosContent } from './productos';
import { seguimientoContent } from './seguimiento';
import { signupContent } from './signup';
import { terminosContent } from './terminos';
import { trackContent } from './track';

export interface PageRegistryEntry {
  key: string;            // pageKey usado en page_content / usePageText
  label: string;          // nombre legible en el panel
  defaults: PageDict<Record<string, string>>;
}

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  { key: 'faq',          label: 'FAQ',                 defaults: faqContent },
  { key: 'productos',    label: 'Productos',           defaults: productosContent },
  { key: 'blog',         label: 'Blog (portada)',      defaults: blogContent },
  { key: 'seguimiento',  label: 'Seguimiento',         defaults: seguimientoContent },
  { key: 'track',        label: 'Track',               defaults: trackContent },
  { key: 'login',        label: 'Login',               defaults: loginContent },
  { key: 'signup',       label: 'Registro',            defaults: signupContent },
  { key: 'cookies',      label: 'Cookies',             defaults: cookiesContent },
  { key: 'privacidad',   label: 'Privacidad',          defaults: privacidadContent },
  { key: 'terminos',     label: 'Términos',            defaults: terminosContent },
];
