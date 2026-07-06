export function GET() {
  const body = [
    'NEGASVA',
    '',
    'What it is:',
    '- Personalized cartoon portrait service',
    '- Handmade digital illustration, not AI filters',
    '- Delivery in 48 hours',
    '- Prices start at $15 USD',
    '',
    'Important pages:',
    '- https://negasva.shop/',
    '- https://negasva.shop/pricing',
    '- https://negasva.shop/styles',
    '- https://negasva.shop/faq',
    '- https://negasva.shop/gallery',
    '- https://negasva.shop/blog',
    '- https://negasva.shop/order',
    '',
    'Key facts:',
    '- Spanish-first site',
    '- Online store only',
    '- Custom portraits for individuals, couples, families, and pets',
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
