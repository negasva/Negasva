'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-lighter to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo href="/" size="lg" />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-2 tracking-tighter">Iniciar Sesión</h2>
          <p className="text-secondary-lighter">Accede a tu cuenta para gestionar tus pedidos</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-primary-lighter p-8">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              />
            </div>
            <Link
              href="/order"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-white hover:bg-primary-dark transition-colors"
            >
              Entrar
            </Link>
          </form>
          <p className="mt-6 text-center text-sm text-secondary-lighter">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-primary font-bold hover:text-primary-dark transition-colors">
              Regístrate gratis
            </Link>
          </p>
          <div className="mt-6 border-t-2 border-primary-lighter pt-6">
            <Link
              href="/order"
              className="block w-full rounded-lg border-2 border-secondary px-4 py-3 text-center font-bold text-secondary hover:bg-secondary hover:text-white transition-colors"
            >
              Continuar sin cuenta →
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-secondary-lighter hover:text-primary transition-colors font-medium">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
