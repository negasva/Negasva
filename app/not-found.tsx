import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full">
        <p className="font-black text-6xl text-primary tracking-tighter mb-2">404</p>
        <h1 className="font-black text-2xl text-secondary tracking-tighter mb-3">Página no encontrada</h1>
        <p className="text-secondary-lighter mb-8">
          La página que buscas no existe o se movió.
        </p>
        <Link
          href="/"
          className="block w-full rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
