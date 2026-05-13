'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-lighter to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo href="/" size="lg" />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-2 tracking-tighter">Crear Cuenta</h2>
          <p className="text-secondary-lighter">Únete para guardar tu progreso y ver tus pedidos</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-primary-lighter p-8">
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Juan"
                  className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Apellido</label>
                <input
                  type="text"
                  placeholder="García"
                  className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                />
              </div>
            </div>
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
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              />
            </div>
            <Link
              href="/studio"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-white hover:bg-primary-dark transition-colors"
            >
              Crear Cuenta y Continuar →
            </Link>
          </form>
          <p className="mt-6 text-center text-sm text-secondary-lighter">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-secondary-lighter hover:text-primary transition-colors font-medium">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
