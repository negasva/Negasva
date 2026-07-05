import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIX = '/backgrounds/';

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  MX: 'MXN',
  CO: 'COP',
  GB: 'GBP',
  CA: 'CAD',
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  PT: 'EUR', IE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
};

const GEO_COOKIE = 'negasva-geo-currency';

function isProtectedRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith(PROTECTED_PREFIX)) return true;

  if (pathname === '/_next/image') {
    const url = searchParams.get('url') ?? '';
    try {
      const decoded = decodeURIComponent(url);
      if (decoded.startsWith(PROTECTED_PREFIX)) return true;
    } catch {
      if (url.startsWith(PROTECTED_PREFIX)) return true;
    }
  }

  return false;
}

function applyGeoCurrency(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(GEO_COOKIE)) return;
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    '';
  const currency = COUNTRY_TO_CURRENCY[country.toUpperCase()] || 'USD';
  response.cookies.set(GEO_COOKIE, currency, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = host.slice(4);
    return NextResponse.redirect(url, 301);
  }

  if (isProtectedRequest(request)) {
    // Solo bloquea el hotlinking real: un navegador en OTRO origen embebiendo
    // la imagen manda sec-fetch-site: cross-site. Todo lo demás debe pasar —
    // usuarios (same-origin), navegación directa (none), y clientes sin
    // sec-fetch: el optimizador de imágenes de Next, buscadores y previews
    // sociales. Antes se bloqueaba a todos esos, rompiendo la optimización de
    // los hero de blog/estilos (400) y la OG image en Ahrefs/redes.
    const site = request.headers.get('sec-fetch-site');
    if (site === 'cross-site') {
      return new NextResponse('Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  const res = NextResponse.next();
  applyGeoCurrency(request, res);
  return res;
}

export const config = {
  matcher: [
    '/backgrounds/:path*',
    '/_next/image',
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)',
  ],
};
