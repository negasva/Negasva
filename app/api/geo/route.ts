import { NextResponse } from 'next/server';

// País del visitante por la cabecera de geolocalización de Vercel. Lista
// LATAM configurable por env (LATAM_COUNTRIES, ISO-3166 separados por coma).
// Se usa para decidir si mostrar el botón flotante de WhatsApp.

export const dynamic = 'force-dynamic';

const LATAM_DEFAULT = 'AR,BO,BR,CL,CO,CR,CU,DO,EC,GT,HN,MX,NI,PA,PE,PR,PY,SV,UY,VE';

export async function GET(request: Request) {
  const country = (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  const latamList = (process.env.LATAM_COUNTRIES ?? LATAM_DEFAULT)
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  return NextResponse.json({ country, latam: latamList.includes(country) });
}
