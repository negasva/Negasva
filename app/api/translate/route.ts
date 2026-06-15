import { NextResponse } from 'next/server';
import { translateBatch, type TargetLang } from '@/lib/i18n/translate';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';

// Traducción automática es -> en/fr con caché. Body: { texts: string[], target }.
// Devuelve { translations: string[] } alineado con texts (fallback: español).

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rl = rateLimitByIp(request, { prefix: 'translate', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400);

  const { texts, target } = body as { texts?: unknown; target?: unknown };
  if (!Array.isArray(texts) || texts.some((t) => typeof t !== 'string')) {
    return errorResponse('Invalid texts', 400);
  }
  if (target !== 'en' && target !== 'fr') {
    // 'es' u otro: devolver tal cual.
    return NextResponse.json({ translations: texts }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (texts.length > 100) return errorResponse('Too many texts', 400);

  try {
    const translations = await translateBatch(texts as string[], target as TargetLang);
    return NextResponse.json({ translations }, {
      // Cacheable en el edge: el contenido cambia poco y ya hay caché en BD.
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400' },
    });
  } catch (err) {
    // Nunca rompemos la página: devolvemos el español.
    return NextResponse.json({ translations: texts }, { status: 200 });
  }
}
