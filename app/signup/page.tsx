'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { usePageText } from '@/lib/i18n/pageContent';
import { signupContent } from '@/lib/i18n/pages/signup';

export default function SignupPage() {
  const tx = usePageText('signup', signupContent);
  return (
    <div className="min-h-screen bg-primary-lighter/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo href="/" size="lg" />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-2 tracking-tighter">{tx.title}</h2>
          <p className="text-secondary-lighter">{tx.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-primary-lighter p-8">
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{tx.first_name_label}</label>
                <input
                  type="text"
                  placeholder={tx.first_name_placeholder}
                  className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{tx.last_name_label}</label>
                <input
                  type="text"
                  placeholder={tx.last_name_placeholder}
                  className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{tx.email_label}</label>
              <input
                type="email"
                placeholder={tx.email_placeholder}
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{tx.password_label}</label>
              <input
                type="password"
                placeholder={tx.password_placeholder}
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              />
            </div>
            <Link
              href="/order"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-white hover:bg-primary-dark transition-colors"
            >
              {tx.submit}
            </Link>
          </form>
          <p className="mt-6 text-center text-sm text-secondary-lighter">
            {tx.have_account}{' '}
            <Link href="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
              {tx.login_link}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-secondary-lighter hover:text-primary transition-colors font-medium">{tx.back_home}</Link>
        </p>
      </div>
    </div>
  );
}
