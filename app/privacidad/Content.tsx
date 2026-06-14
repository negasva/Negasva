'use client';

import { usePageText } from '@/lib/i18n/pageContent';
import { privacidadContent } from '@/lib/i18n/pages/privacidad';

export default function PrivacidadContent() {
  const t = usePageText('privacidad', privacidadContent);

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
            <p className="text-secondary-lighter leading-relaxed mb-4">{t.s2_intro}</p>
            <ul className="list-disc list-inside space-y-2 text-secondary-lighter">
              <li>{t.s2_item1}</li>
              <li>{t.s2_item2}</li>
              <li>{t.s2_item3}</li>
              <li>{t.s2_item4}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s3_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">
              {t.s3_body} <strong className="text-secondary">{t.s3_strong}</strong>
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s4_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s4_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s5_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">
              {t.s5_body}{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s6_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">{t.s6_body}</p>
          </div>

          <div>
            <h2 className="font-black text-2xl text-secondary mb-3 tracking-tighter">{t.s7_title}</h2>
            <p className="text-secondary-lighter leading-relaxed">
              {t.s7_body}{' '}
              <a href="mailto:hola@negasva.com" className="text-primary font-bold hover:underline">hola@negasva.com</a>.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
