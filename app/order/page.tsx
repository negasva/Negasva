'use client';

import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import RecaptchaScript from '@/components/RecaptchaScript';
import { useCheckout } from './useCheckout';
import StepStyle from './StepStyle';
import StepBody from './StepBody';
import StepBackground from './StepBackground';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StudioPage() {
  const c = useCheckout();
  const {
    t, fmt,
    step, setStep, selected, styles, priceMap,
    discountCodeInput, setDiscountCodeInput,
    appliedCode, setAppliedCode, codeStatus, setCodeStatus,
    showError, errorRing, errorShake, onShakeEnd,
    checkoutLoading, checkoutParams,
    canAdvance, priceBreakdown, totalPrice, getBgName, getStyleBgs,
    nextStep, prevStep, fetchClientSecret, handlePhotoUpload,
    toggleExpress, setSpecialRequests,
  } = c;

  const STEPS = t.studio.steps as unknown as string[];

  // Order summary — shown as a sticky sidebar from step 2 onward, and as a
  // static, always-visible card on the checkout step so the customer sees
  // exactly what they're paying for (in the site's own style).
  const OrderSummary = ({ sticky = true }: { sticky?: boolean }) => {
    const b = priceBreakdown();
    const styleName = styles.find(s => s.id === selected.style)?.name;
    const hasAnyContent = !!selected.style;
    if (!hasAnyContent) return null;

    return (
      <div className={`rounded-2xl bg-primary-lighter border-2 border-primary p-5 space-y-3 text-sm ${sticky ? 'sticky top-24' : ''}`}>
        <p className="font-black text-secondary text-base tracking-tighter">{t.studio.summary.title}</p>
        <div className="space-y-2">
          {selected.style && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.style}</span>
              <span className="font-bold text-secondary">{styleName}</span>
            </div>
          )}
          {selected.bodyType && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.type}</span>
              <span className="font-bold text-secondary">
                {selected.bodyType === 'full_body' ? t.studio.summary.full_body : t.studio.summary.torso}
              </span>
            </div>
          )}
          {selected.bodyType && (
            <>
              <div className="flex justify-between">
                <span className="text-secondary-lighter">
                  {selected.peopleCount} {t.studio.summary.people_count} × {fmt(b.perPerson)}
                </span>
                <span className={`font-bold ${b.discountRate > 0 ? 'line-through text-secondary-lighter' : 'text-secondary'}`}>
                  {fmt(b.peopleSubtotal)}
                </span>
              </div>
              {b.discountRate > 0 && (
                <div className="flex justify-between bg-white rounded-xl px-3 py-1.5">
                  <span className="text-primary font-bold">−{Math.round(b.discountRate * 100)}%</span>
                  <span className="font-bold text-primary">−{fmt(b.discount)}</span>
                </div>
              )}
            </>
          )}
          {selected.background && selected.background !== 'none' && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.background}</span>
              <span className="font-bold text-secondary">+{fmt(b.bgCost)}</span>
            </div>
          )}
          {selected.background && selected.background !== 'none' && (
            <div className="flex justify-between text-xs text-secondary-lighter pl-2">
              <span>{getStyleBgs().find(bg => bg.id === selected.background)?.name ?? getBgName(selected.background)}</span>
            </div>
          )}
          {selected.express && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.express}</span>
              <span className="font-bold text-secondary">+{fmt(b.expressSurcharge)}</span>
            </div>
          )}
          {appliedCode && b.codeDiscount > 0 && (
            <div className="flex justify-between bg-white rounded-xl px-3 py-1.5">
              <span className="text-primary font-bold">{appliedCode.code}</span>
              <span className="font-bold text-primary">−{fmt(b.codeDiscount)}</span>
            </div>
          )}
          {selected.specialRequests.trim() && (
            <div className="bg-white rounded-xl px-3 py-2">
              <span className="block text-secondary-lighter text-xs mb-0.5">{t.studio.step4.notes_label}</span>
              <span className="block text-secondary text-xs font-medium break-words">{selected.specialRequests}</span>
            </div>
          )}
        </div>
        {selected.bodyType && (
          <div className="flex justify-between border-t-2 border-primary pt-3 font-black text-lg">
            <span className="text-secondary">{t.studio.summary.total}</span>
            <span className="text-primary">{fmt(totalPrice())}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <RecaptchaScript />
      {/* Nav */}
      <nav className="bg-white border-b border-primary-lighter sticky top-0 z-[60] w-full">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
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
        <div className="mx-auto max-w-6xl px-4 py-4 flex justify-center">
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
      <main className="mx-auto max-w-6xl px-4 py-8 w-full overflow-x-hidden">
        <div className={`${step > 1 && step < 5 ? 'lg:grid lg:grid-cols-3 lg:gap-8' : ''}`}>
          {/* Main step content */}
          <div className={step > 1 && step < 5 ? 'lg:col-span-2' : ''}>

            {step === 1 && <StepStyle c={c} />}
            {step === 2 && <StepBody c={c} />}
            {step === 3 && <StepBackground c={c} />}

            {/* PASO 4: Detalles */}
            {step === 4 && (
              <div>
                <div className="text-center mb-10">
                  <h2 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step4.title}</h2>
                  <p className="text-lg text-secondary-lighter">{t.studio.step4.subtitle}</p>
                </div>
                <div className="max-w-2xl mx-auto space-y-8">
                  {/* 1 · Entrega exprés 24h */}
                  <button
                    type="button"
                    onClick={toggleExpress}
                    className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                      selected.express
                        ? 'border-primary bg-primary-lighter ring-2 ring-primary'
                        : 'border-primary-lighter bg-white hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected.express ? 'bg-primary border-primary text-white' : 'border-secondary-lighter'}`}>
                        {selected.express && '✓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-secondary text-lg tracking-tighter">{t.studio.step4.express_title}</p>
                        <p className="text-sm text-secondary-lighter mt-1">{t.studio.step4.express_desc}</p>
                      </div>
                      <span className="font-black text-secondary text-xl whitespace-nowrap">+{Math.round(priceMap.express_surcharge_pct ?? 30)}%</span>
                    </div>
                  </button>

                  {/* 2 · Sube tus fotos (compacto) */}
                  <div>
                    <h2 className="font-black text-xl text-secondary mb-1 tracking-tighter">{t.studio.step5.title}</h2>
                    <p className="text-sm text-secondary-lighter mb-3">{t.studio.step5.subtitle}</p>
                    <div
                      onAnimationEnd={onShakeEnd}
                      className={`rounded-2xl border-2 border-dashed bg-white p-6 text-center hover:border-primary hover:bg-primary-lighter transition-all cursor-pointer ${
                        showError ? 'border-red-500' : 'border-primary-lighter'
                      } ${errorRing} ${errorShake}`}
                    >
                      <p className="font-bold text-secondary text-sm mb-1">{t.studio.step5.drag}</p>
                      <p className="text-xs text-secondary-lighter mb-4">{t.studio.step5.or}</p>
                      <label className="inline-block cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                        {t.studio.step5.select_btn}
                        <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {selected.photos.length > 0 && (
                        <div className="mt-4 text-sm text-primary font-bold">
                          {selected.photos.length} {selected.photos.length > 1 ? t.studio.step5.selected_plural : t.studio.step5.selected}
                        </div>
                      )}
                      <p className="mt-4 text-xs text-secondary-lighter">
                        {t.studio.step5.max_size} · {selected.peopleCount} {selected.peopleCount > 1 ? t.studio.step5.required_photos_plural : t.studio.step5.required_photos}
                      </p>
                    </div>
                  </div>

                  {/* 3 · Notas especiales */}
                  <div>
                    <label className="block font-bold text-secondary mb-3">
                      {t.studio.step4.notes_label} <span className="font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
                    </label>
                    <textarea
                      value={selected.specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder={t.studio.step4.notes_placeholder}
                      rows={5}
                      maxLength={500}
                      className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none resize-none"
                    />
                    <p className="text-right text-xs text-secondary-lighter mt-2">{selected.specialRequests.length}/500</p>
                  </div>

                  {/* 4 · Código de descuento */}
                  <div>
                    <label className="block font-bold text-secondary mb-3">Código de descuento <span className="font-normal text-secondary-lighter">(opcional)</span></label>
                    {appliedCode ? (
                      <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary-lighter px-4 py-3">
                        <span className="font-bold text-secondary text-sm">
                          {appliedCode.code} · −{appliedCode.type === 'percentage' ? `${appliedCode.value}%` : fmt(appliedCode.value)}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setAppliedCode(null); setDiscountCodeInput(''); setCodeStatus('idle'); }}
                          className="text-xs font-bold text-secondary-lighter hover:text-primary transition-colors"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={discountCodeInput}
                          onChange={(e) => { setDiscountCodeInput(e.target.value.toUpperCase()); setCodeStatus('idle'); }}
                          placeholder="MICODIGO"
                          maxLength={40}
                          className="flex-1 rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm font-bold text-secondary uppercase focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={discountCodeInput.trim().length < 2 || codeStatus === 'checking'}
                          onClick={async () => {
                            setCodeStatus('checking');
                            try {
                              const res = await fetch('/api/discount-codes/validate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: discountCodeInput.trim(), subtotal: priceBreakdown().subtotal + priceBreakdown().expressSurcharge }),
                              });
                              const data = await res.json();
                              if (data.valid) {
                                setAppliedCode({ code: data.code, type: data.type, value: data.value, amount: data.amount });
                                setCodeStatus('idle');
                              } else {
                                setCodeStatus('invalid');
                              }
                            } catch {
                              setCodeStatus('invalid');
                            }
                          }}
                          className="rounded-lg bg-secondary px-6 py-3 text-sm font-bold text-white hover:bg-secondary-light transition-colors disabled:opacity-40"
                        >
                          {codeStatus === 'checking' ? '...' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    {codeStatus === 'invalid' && (
                      <p className="text-xs text-red-500 font-bold mt-2">Código inválido o expirado.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 5: Embedded Checkout */}
            {step === 5 && checkoutParams && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-black text-3xl text-secondary mb-2 tracking-tighter">Pago seguro</h2>
                  <div className="flex items-center justify-center gap-4 text-xs text-secondary-lighter flex-wrap">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-primary" /> Cifrado SSL 256-bit</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> Procesado por Stripe</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> Nunca guardamos tu tarjeta</span>
                  </div>
                </div>
                {/* Resumen detallado del pedido (estilo de la web), siempre visible */}
                <div className="max-w-xl mx-auto mb-6">
                  <OrderSummary sticky={false} />
                </div>

                <div className="max-w-xl mx-auto bg-white rounded-2xl border-2 border-primary-lighter shadow-lg overflow-hidden">
                  <div className="bg-primary-lighter px-6 py-4 flex items-center justify-between">
                    <span className="font-black text-secondary text-sm">Total: {fmt(totalPrice())}</span>
                    <div className="flex items-center gap-2 text-xs text-secondary-lighter">
                      <Lock className="w-3 h-3" />
                      <span>Pago seguro</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(4)} className="text-secondary-lighter hover:text-primary text-sm font-bold transition-colors">
                    Volver al paso anterior
                  </button>
                </div>
              </div>
            )}

            {/* Navigation (pasos 1–4) */}
            {step < 5 && (
              <>
                <div className="flex justify-between items-center mt-14">
                  <button
                    onClick={prevStep}
                    className="text-secondary-lighter hover:text-primary text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary-lighter transition-colors"
                  >
                    {step === 1 ? <Link href="/">{t.studio.nav.back_home}</Link> : t.studio.nav.prev}
                  </button>
                  {step > 1 && (
                    <button
                      onClick={nextStep}
                      disabled={checkoutLoading}
                      aria-disabled={!canAdvance()}
                      className="rounded-lg px-10 py-3 font-bold text-white transition-all flex items-center gap-2 bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl disabled:opacity-60"
                    >
                      {checkoutLoading && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {step === 4 ? t.studio.nav.checkout : t.studio.nav.next}
                    </button>
                  )}
                </div>

                {showError && !canAdvance() && (
                  <p className="text-center text-sm text-red-500 font-bold mt-4">
                    {t.studio.nav.missing}
                  </p>
                )}

                <p className="text-center text-xs text-secondary-lighter mt-8">
                  {t.studio.nav.secure}
                </p>
              </>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          {step > 1 && step < 5 && (
            <div className="hidden lg:block">
              <OrderSummary />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
