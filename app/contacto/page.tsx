'use client';

import { Mail, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

export default function ContactoPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.contact.title}
          </h1>
          <p className="text-lg text-secondary-lighter max-w-2xl">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.contact.email_title}</h3>
              <p className="text-secondary-lighter mb-4">{t.contact.email_desc}</p>
              <a href="mailto:contacto@negasva.com" className="text-primary hover:text-primary-dark font-bold transition-colors">
                contacto@negasva.com
              </a>
            </div>

            <div className="bg-primary-lighter/40 rounded-2xl p-8 border-2 border-primary-lighter">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.contact.social_title}</h3>
              <p className="text-secondary-lighter mb-4">{t.contact.social_desc}</p>
              <div className="space-y-2">
                <a href="https://instagram.com/negasva" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary-dark font-bold transition-colors">
                  Instagram @negasva
                </a>
                <a href="https://tiktok.com/@negasva" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary-dark font-bold transition-colors">
                  TikTok @negasva
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-primary-lighter p-8">
            <h3 className="font-black text-2xl text-secondary mb-6 tracking-tighter">{t.contact.faq_title}</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-secondary mb-2">{t.contact.q1}</h4>
                <p className="text-secondary-lighter">{t.contact.a1}</p>
              </div>
              <div>
                <h4 className="font-bold text-secondary mb-2">{t.contact.q2}</h4>
                <p className="text-secondary-lighter">{t.contact.a2}</p>
              </div>
              <div>
                <h4 className="font-bold text-secondary mb-2">{t.contact.q3}</h4>
                <p className="text-secondary-lighter">{t.contact.a3}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
