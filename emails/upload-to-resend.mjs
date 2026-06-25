// Sube la plantilla a Resend (crear + publicar).
// Uso:
//   npm i -D resend            # si aún no está
//   RESEND_API_KEY=re_xxx node emails/upload-to-resend.mjs
// La key se lee de la variable de entorno: nunca la pongas en el código.
//
// Alternativa sin script: copia el contenido de order-confirmation.html y
// pégalo en el editor de plantillas del panel de Resend.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Falta RESEND_API_KEY en el entorno.');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'order-confirmation.html'), 'utf8');
const resend = new Resend(apiKey);

const variables = [
  { key: 'CUSTOMER_NAME', type: 'string', fallbackValue: 'cliente' },
  { key: 'STYLE',         type: 'string', fallbackValue: '—' },
  { key: 'BODY_TYPE',     type: 'string', fallbackValue: '—' },
  { key: 'BACKGROUND',    type: 'string', fallbackValue: '—' },
  { key: 'PEOPLE',        type: 'string', fallbackValue: '1' },
  { key: 'REFERENCE',     type: 'string', fallbackValue: '—' },
  { key: 'PRICE',         type: 'string', fallbackValue: '$20 USD' },
  { key: 'DELIVERY',      type: 'string', fallbackValue: '48 horas' },
  { key: 'ORDER_URL',     type: 'string', fallbackValue: 'https://negasva.shop/seguimiento' },
];

const res = await resend.templates.create({
  name: 'order-confirmation',
  html,
  variables,
}).publish();

console.log('Plantilla creada y publicada:', res);
