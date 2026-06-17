import { redirect } from 'next/navigation';

// La sección de productos físicos está en "coming soon" y no tiene nada
// comprable: mostrarla da mala imagen. La desactivamos redirigiendo al inicio
// hasta que exista catálogo real. También se quitó de footer y sitemap.
export default function ProductosPage() {
  redirect('/');
}
