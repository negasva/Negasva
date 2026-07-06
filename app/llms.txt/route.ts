import { STYLES_CONTENT } from '@/lib/content/styles';
import { LANDINGS } from '@/lib/content/landings';

export function GET() {
  const body = [
    'NEGASVA',
    '',
    'What it is:',
    '- Custom cartoon portrait service: your photo hand-drawn by a real artist',
    '- 100% handmade digital illustration, no AI filters or generators',
    '- Delivery in 48 hours (24h express available)',
    '- Prices start at $15 USD',
    '',
    'Important pages:',
    '- https://negasva.shop/',
    '- https://negasva.shop/how-it-works',
    '- https://negasva.shop/pricing',
    '- https://negasva.shop/styles',
    '- https://negasva.shop/gallery',
    '- https://negasva.shop/faq',
    '- https://negasva.shop/blog',
    '- https://negasva.shop/about',
    '- https://negasva.shop/order',
    '',
    'Portrait styles:',
    ...STYLES_CONTENT.map((s) => `- ${s.name}: https://negasva.shop/styles/${s.slug}`),
    '',
    'Gifts and occasions:',
    ...LANDINGS.map((l) => `- https://negasva.shop${l.path}`),
    '',
    'Key facts:',
    '- English-language site',
    '- Online store only',
    '- Custom portraits for individuals, couples, families, and pets',
    '- Up to 8 people per portrait, automatic group discounts',
    '- FAQ answers are visible in the DOM',
    '',
    'Contact:',
    '- Instagram: https://instagram.com/negasva',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
