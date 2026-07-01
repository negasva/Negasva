import type { MetadataRoute } from 'next';

// Manifest PWA → permite "Añadir a pantalla de inicio" e instalarla como app.
// Next.js lo sirve en /manifest.webmanifest y enlaza <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NEGASVA — Retratos Animados Personalizados',
    short_name: 'NEGASVA',
    description:
      'Convierte tu foto en un retrato digital personalizado, dibujado a mano y listo para regalar.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'es',
    dir: 'ltr',
    background_color: '#ffffff',
    theme_color: '#FF9EC5',
    categories: ['shopping', 'lifestyle', 'photo'],
    icons: [
      { src: '/pig-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pig-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
