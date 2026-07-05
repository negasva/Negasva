import { ImageResponse } from 'next/og';

// OG image propia generada en build (sin arte de marcas ajenas).
// Convención de archivo de Next: aplica a og:image y twitter:image del sitio.

export const runtime = 'edge';
export const alt = 'Negasva — Custom cartoon portraits hand-drawn from your photo, no AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #FFF1F7 0%, #FFD0E5 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: '#FC90B6',
            color: '#fff',
            fontSize: 34,
            fontWeight: 800,
            padding: '14px 36px',
            borderRadius: 999,
            marginBottom: 44,
            alignSelf: 'flex-start',
          }}
        >
          NEGASVA
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 88,
            fontWeight: 900,
            color: '#2B2B33',
            lineHeight: 1.05,
            letterSpacing: '-3px',
            marginBottom: 36,
          }}
        >
          Custom Cartoon Portraits from Your Photo
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 38, fontWeight: 700, color: '#D14D82' }}>
          <span>Hand-Drawn, No AI</span>
          <span>•</span>
          <span>48h Delivery</span>
          <span>•</span>
          <span>From $15</span>
        </div>
      </div>
    ),
    size,
  );
}
