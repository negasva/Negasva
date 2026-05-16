'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import CurrencySwitcher from '@/components/CurrencySwitcher';

const STYLES = [
  { id: 'rick-morty', name: 'Rick & Morty' },
  { id: 'gravity-falls', name: 'Gravity Falls' },
  { id: 'simpsons', name: 'Simpsons' },
  { id: 'fairly-odd', name: 'Los Padrinos Mágicos' },
  { id: 'negasva', name: 'Estilo NEGASVA' },
];

const BODY_TYPES = [
  { id: 'torso_only', name: 'Solo Torso', desc: 'Busto hasta la cintura', price: 15, original: 20 },
  { id: 'full_body', name: 'Cuerpo Completo', desc: 'Personaje de cuerpo entero', price: 25, original: null },
];

const BACKGROUNDS_BY_STYLE: Record<string, { id: string; price?: number }[]> = {
  'rick-morty': [
    { id: 'rm-1' },
    { id: 'rm-3' },
    { id: 'rm-4' },
    { id: 'rm-5' },
    { id: 'rm-6' },
    { id: 'rm-10' },
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
  'gravity-falls': [
    { id: 'gf-1' },
    { id: 'gf-2' },
    { id: 'gf-3' },
    { id: 'gf-4' },
    { id: 'gf-5' },
    { id: 'gf-8' },
    { id: 'gf-9' },
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
  'simpsons': [
    { id: 'sp-1' },
    { id: 'sp-2' },
    { id: 'sp-3' },
    { id: 'sp-4' },
    { id: 'sp-5' },
    { id: 'sp-6' },
    { id: 'sp-10' },
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
  'fairly-odd': [
    { id: 'fo-1' },
    { id: 'fo-2' },
    { id: 'fo-3' },
    { id: 'fo-5' },
    { id: 'fo-10' },
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
  'negasva': [
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
  'custom': [
    { id: 'custom', price: 25 },
    { id: 'none' },
  ],
};

export default function StudioPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { fmt } = useCurrency();
  const STEPS = t.studio.steps as unknown as string[];
  const ROLES = t.studio.step2.roles as unknown as string[];

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({
    style: '',
    bodyType: '',
    background: '',
    people: [{ name: '', role: ROLES[0] }],
    specialRequests: '',
    photos: [] as File[],
  });

  const canAdvance = () => {
    if (step === 1) return !!selected.style;
    if (step === 2) return !!selected.bodyType && selected.people.every(p => p.name.trim().length >= 2);
    if (step === 3) return !!selected.background;
    if (step === 4) return true;
    if (step === 5) return selected.photos.length >= selected.people.length;
    return true;
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else router.push('/checkout');
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const totalPrice = () => {
    const perPerson = selected.bodyType === 'full_body' ? 25 : 15;
    const bgCost = selected.background === 'custom' ? 25 : selected.background && selected.background !== 'none' ? 15 : 0;
    return selected.people.length * perPerson + bgCost;
  };

  const addPerson = () => {
    if (selected.people.length < 4) {
      setSelected({ ...selected, people: [...selected.people, { name: '', role: ROLES[4] }] });
    }
  };

  const removePerson = (i: number) => {
    setSelected({ ...selected, people: selected.people.filter((_, idx) => idx !== i) });
  };

  const updatePerson = (i: number, field: string, value: string) => {
    const people = [...selected.people];
    people[i] = { ...people[i], [field]: value };
    setSelected({ ...selected, people });
  };

  const getBgName = (id: string) =>
    (t.studio.backgrounds as Record<string, string>)[id] ?? id;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelected({ ...selected, photos: files });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-primary-lighter sticky top-0 z-10 w-full overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <LanguageSwitcher />
            {selected.bodyType && (
              <span className="text-sm font-bold text-white bg-primary px-4 py-2 rounded-full">
                Total: {fmt(totalPrice())}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div className="bg-white border-b-2 border-primary-lighter w-full overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-4 flex justify-center">
          <div className="flex items-center gap-1 sm:gap-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => i + 1 <= step && setStep(i + 1)}
                  disabled={i + 1 > step}
                  className="flex flex-col items-center focus:outline-none disabled:cursor-not-allowed group"
                >
                  <div className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                    i + 1 < step ? 'bg-primary text-white group-hover:bg-primary-dark cursor-pointer' :
                    i + 1 === step ? 'bg-primary text-white ring-4 ring-primary-lighter' :
                    'bg-primary-lighter text-secondary'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`mt-1 text-xs hidden sm:block font-bold ${i + 1 === step ? 'text-primary' : 'text-secondary-lighter'}`}>
                    {label}
                  </span>
                </button>
                {i < 4 && (
                  <div className={`w-4 sm:w-10 h-1 mx-1 sm:mx-2 ${i + 1 < step ? 'bg-primary' : 'bg-primary-lighter'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 w-full overflow-x-hidden">

        {/* PASO 1: Estilo */}
        {step === 1 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step1.title}</h1>
              <p className="text-lg text-secondary-lighter">{t.studio.step1.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected({ ...selected, style: s.id, background: '' })}
                  className={`rounded-2xl border-2 p-8 text-center transition-all focus:outline-none ${
                    selected.style === s.id
                      ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                      : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
                  }`}
                >
                  {selected.style === s.id && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">•</span>
                  )}
                  <p className="font-bold text-secondary">{s.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Cuerpo + Personas */}
        {step === 2 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step2.title}</h1>
              <p className="text-lg text-secondary-lighter">{t.studio.step2.subtitle}</p>
            </div>

            {/* Body Type selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
              {[
                { id: 'torso_only', name: t.studio.body_types.torso_name, desc: t.studio.body_types.torso_desc, price: 15, original: 20 },
                { id: 'full_body', name: t.studio.body_types.full_name, desc: t.studio.body_types.full_desc, price: 25, original: null as null },
              ].map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setSelected({ ...selected, bodyType: b.id })}
                  className={`rounded-2xl border-2 p-6 text-center transition-all focus:outline-none relative ${
                    selected.bodyType === b.id
                      ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-xl'
                      : 'border-primary-lighter bg-white hover:border-primary hover:shadow-lg'
                  } ${idx === 0 ? 'animate-pulse-scale' : ''}`}
                >
                  {b.original && (
                    <div className="inline-flex items-center gap-1 bg-secondary text-white px-2.5 py-1 rounded-full text-xs font-black mb-3 shadow">
                      {t.studio.body_types.torso_badge} <span className="line-through text-gray-400">{fmt(b.original)}</span> {t.studio.body_types.torso_now} <span className="text-primary-lighter font-black">{fmt(b.price)}</span>
                    </div>
                  )}
                  {selected.bodyType === b.id && (
                    <span className="block text-primary font-bold text-xs mb-2">{t.studio.body_types.selected}</span>
                  )}
                  <p className="font-black text-xl sm:text-2xl text-secondary mb-2 tracking-tighter">{b.name}</p>
                  <p className="text-secondary-lighter text-sm mb-4">{b.desc}</p>
                  <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-4 py-3 font-black text-2xl sm:text-3xl">
                    {fmt(b.price)}{t.studio.body_types.per_person}
                  </div>
                </button>
              ))}
            </div>

            {/* Personas section */}
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-black text-2xl text-secondary tracking-tighter">{t.studio.step2.people_title}</h2>
                  <p className="text-secondary-lighter text-sm mt-1">{t.studio.step2.people_subtitle}</p>
                </div>
                {/* Contador rápido */}
                <div className="flex items-center gap-3 bg-primary-lighter rounded-2xl px-4 py-2">
                  <button
                    onClick={() => selected.people.length > 1 && removePerson(selected.people.length - 1)}
                    disabled={selected.people.length <= 1}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-xl text-secondary w-6 text-center">{selected.people.length}</span>
                  <button
                    onClick={addPerson}
                    disabled={selected.people.length >= 4}
                    className="w-8 h-8 rounded-full bg-primary text-white shadow flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:bg-primary-lighter disabled:text-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selected.people.map((person, i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-primary-lighter p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-black flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-2">{t.studio.step2.name_label}</label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(i, 'name', e.target.value)}
                          placeholder="Ej: María"
                          className="w-full rounded-lg border-2 border-primary-lighter px-4 py-2.5 text-sm text-secondary focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-2">{t.studio.step2.role_label}</label>
                        <select
                          value={person.role}
                          onChange={(e) => updatePerson(i, 'role', e.target.value)}
                          className="w-full rounded-lg border-2 border-primary-lighter px-4 py-2.5 text-sm text-secondary focus:border-primary focus:outline-none"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    {i > 0 && (
                      <button
                        onClick={() => removePerson(i)}
                        className="text-secondary-lighter hover:text-primary transition-colors flex-shrink-0 font-bold text-xl"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Precio dinámico */}
              {selected.bodyType && (
                <div className="mt-6 bg-primary-lighter rounded-2xl p-5 border-2 border-primary">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">
                      {selected.people.length} persona{selected.people.length > 1 ? 's' : ''} x {fmt(selected.bodyType === 'full_body' ? 25 : 15)}
                    </span>
                    <span className="font-black text-xl text-primary">{fmt(selected.people.length * (selected.bodyType === 'full_body' ? 25 : 15))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 3: Fondo */}
        {step === 3 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step3.title}</h1>
              <p className="text-lg text-secondary-lighter">{t.studio.step3.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(BACKGROUNDS_BY_STYLE[selected.style] ?? []).map((bg) => {
                const isSelected = selected.background === bg.id;

                if (bg.id === 'none') {
                  return (
                    <button
                      key={bg.id}
                      onClick={() => setSelected({ ...selected, background: bg.id })}
                      className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col items-center justify-center min-h-[152px] ${
                        isSelected
                          ? 'border-secondary bg-secondary-light ring-2 ring-secondary shadow-lg'
                          : 'border-secondary bg-secondary hover:bg-secondary-light hover:shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <span className="block text-white text-base font-black mb-2 tracking-widest">✓</span>
                      )}
                      <p className="font-montserrat font-black text-white text-sm uppercase tracking-[0.12em] leading-tight px-3">
                        {getBgName(bg.id)}
                      </p>
                    </button>
                  );
                }

                if (bg.id === 'custom') {
                  return (
                    <button
                      key={bg.id}
                      onClick={() => setSelected({ ...selected, background: bg.id })}
                      className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col animate-wiggle-slow animate-glow-pulse ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary shadow-lg'
                          : 'border-primary-lighter bg-white hover:border-primary'
                      }`}
                    >
                      <div className="relative h-24 w-full flex items-center justify-center bg-gradient-to-br from-primary-lighter via-white to-primary-light flex-shrink-0">
                        <span className="text-4xl select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(255,158,197,0.8))' }}>✦</span>
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="text-white text-lg font-black drop-shadow">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-black text-secondary leading-tight uppercase tracking-tight">
                          {getBgName(bg.id)}
                        </p>
                        <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? 25)}</p>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={bg.id}
                    onClick={() => setSelected({ ...selected, background: bg.id })}
                    className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary shadow-lg'
                        : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="relative w-full h-24 flex-shrink-0">
                      <Image
                        src={`/backgrounds/${bg.id}.jpg`}
                        alt={getBgName(bg.id)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <span className="text-white text-lg font-bold drop-shadow">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-secondary leading-tight">{getBgName(bg.id)}</p>
                      <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? 15)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 4: Detalles */}
        {step === 4 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step4.title}</h1>
              <p className="text-lg text-secondary-lighter">{t.studio.step4.subtitle}</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <label className="block font-bold text-secondary mb-3">
                {t.studio.step4.notes_label} <span className="font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
              </label>
              <textarea
                value={selected.specialRequests}
                onChange={(e) => setSelected({ ...selected, specialRequests: e.target.value })}
                placeholder={t.studio.step4.notes_placeholder}
                rows={6}
                maxLength={500}
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none resize-none"
              />
              <p className="text-right text-xs text-secondary-lighter mt-2">{selected.specialRequests.length}/500</p>
            </div>
          </div>
        )}

        {/* PASO 5: Fotos */}
        {step === 5 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step5.title}</h1>
              <p className="text-lg text-secondary-lighter">{t.studio.step5.subtitle}</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl border-2 border-dashed border-primary-lighter bg-white p-12 text-center hover:border-primary hover:bg-primary-lighter transition-all cursor-pointer">
                <p className="font-bold text-secondary mb-2">{t.studio.step5.drag}</p>
                <p className="text-secondary-lighter mb-6">{t.studio.step5.or}</p>
                <label className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                  {t.studio.step5.select_btn}
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {selected.photos.length > 0 && (
                  <div className="mt-6 text-sm text-primary font-bold">
                    {selected.photos.length} {selected.photos.length > 1 ? t.studio.step5.selected_plural : t.studio.step5.selected}
                  </div>
                )}
                <p className="mt-6 text-xs text-secondary-lighter">
                  {t.studio.step5.max_size} · {selected.people.length} {selected.people.length > 1 ? t.studio.step5.required_photos_plural : t.studio.step5.required_photos}
                </p>
              </div>

              {/* Resumen del pedido */}
              <div className="mt-8 rounded-2xl bg-primary-lighter border-2 border-primary p-8">
                <p className="font-black text-secondary mb-5 text-lg tracking-tighter">{t.studio.summary.title}</p>
                <div className="space-y-3 text-secondary">
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">{t.studio.summary.style}</span>
                    <span className="font-bold">{STYLES.find(s => s.id === selected.style)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">{t.studio.summary.type}</span>
                    <span className="font-bold">{selected.bodyType === 'full_body' ? t.studio.summary.full_body : t.studio.summary.torso}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">{t.studio.summary.people}</span>
                    <span className="font-bold">{selected.people.map(p => p.name).join(', ')}</span>
                  </div>
                  {selected.background && selected.background !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-secondary-lighter">{t.studio.summary.background}</span>
                      <span className="font-bold">{getBgName(selected.background)} (+{fmt(selected.background === 'custom' ? 25 : 15)})</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-primary pt-4 mt-4 font-black text-xl">
                    <span>{t.studio.summary.total}</span>
                    <span className="text-primary">{fmt(totalPrice())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between items-center mt-14">
          <button
            onClick={prevStep}
            className="text-secondary-lighter hover:text-primary text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary-lighter transition-colors"
          >
            {step === 1 ? <Link href="/">{t.studio.nav.back_home}</Link> : t.studio.nav.prev}
          </button>
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className={`rounded-lg px-10 py-3 font-bold text-white transition-all ${
              canAdvance()
                ? 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl'
                : 'bg-secondary-lighter text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 5 ? t.studio.nav.checkout : t.studio.nav.next}
          </button>
        </div>

        <p className="text-center text-xs text-secondary-lighter mt-8">
          {t.studio.nav.secure}
        </p>
      </main>
    </div>
  );
}
