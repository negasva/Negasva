import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIX = '/backgrounds/';

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

export function middleware(request: NextRequest) {
  if (!isProtectedRequest(request)) return NextResponse.next();

  const site = request.headers.get('sec-fetch-site');
  const dest = request.headers.get('sec-fetch-dest');
  const mode = request.headers.get('sec-fetch-mode');

  const allowed =
    site === 'same-origin' &&
    dest === 'image' &&
    (mode === 'no-cors' || mode === 'cors');

  if (allowed) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  return new NextResponse('Forbidden', {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export const config = {
  matcher: ['/backgrounds/:path*', '/_next/image'],
};
