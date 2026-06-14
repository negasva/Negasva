'use client';

import { usePageText } from '@/lib/i18n/pageContent';
import { terminosContent } from '@/lib/i18n/pages/terminos';

export default function TerminosContent() {
  const t = usePageText('terminos', terminosContent);

  return (
    <>
      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">{t.badge}</p>
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-secondary-lighter">{t.updated}</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-10 text-secondary">

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s1_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s1_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s2_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">
              {t.s2_body_pre} <strong className="text-secondary">{t.s2_strong}</strong> {t.s2_body_post}
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s3_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s3_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s4_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s4_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s5_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s5_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s6_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s6_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s7_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s7_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s8_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">
              {t.s8_body}{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
