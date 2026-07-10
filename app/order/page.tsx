'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Plus, Minus, Check, X, Info, Video, ShoppingBag } from 'lucide-react';
import Logo from '@/components/Logo';
import ProductIcon from '@/components/ProductIcon';
import { mergePodProducts, POD_PLACEHOLDER_IMG } from '@/lib/content/podProducts';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { PayPalProvider, PayPalOneTimePaymentButton, PayPalGuestPaymentButton } from '@paypal/react-paypal-js/sdk-v6';
import RecaptchaScript from '@/components/RecaptchaScript';
import MercadoPagoBrick from '@/components/MercadoPagoBrick';
import { nextFamilyTier } from '@/lib/pricing/calc';
import ShippingCalculator from '@/components/ShippingCalculator';
import { useCheckout, CURRENCY_COUNTRY, type CheckoutController } from './useCheckout';
import StepStyle from './StepStyle';
import StepBody from './StepBody';
import StepBackground from './StepBackground';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
// El SDK v6 exige declarar el entorno explícitamente (el client id ya no lo
// selecciona). Se toma de NEXT_PUBLIC_PAYPAL_ENV (igual criterio que el
// PAYPAL_ENV del servidor: 'live' → producción); si falta, se deduce de
// NODE_ENV para no exigir una variable nueva en desarrollo.
const PAYPAL_ENVIRONMENT: 'production' | 'sandbox' =
  (process.env.NEXT_PUBLIC_PAYPAL_ENV ?? (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox')) === 'live'
    ? 'production'
    : 'sandbox';

type Lang = 'es' | 'en' | 'fr';
const pick3 = (lang: Lang, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;

// Banner verde: puedes empezar ya y enviar las fotos después.
function StartNowBanner({ lang }: { lang: Lang }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-green-500/40 bg-green-50 px-5 py-3.5">
      <span className="font-black text-green-600 text-sm sm:text-base">
        ✏️ {pick3(lang, 'Empieza ya, sube las fotos luego', 'Start now, upload photos later', 'Commence maintenant, envoie les photos plus tard')}
      </span>
      <span title={pick3(
        lang,
        'Puedes pagar ahora y enviarnos las fotos después por email o WhatsApp.',
        'You can pay now and send us your photos later by email or WhatsApp.',
        'Tu peux payer maintenant et envoyer tes photos plus tard par email ou WhatsApp.',
      )}>
        <Info className="w-5 h-5 text-green-600 shrink-0" />
      </span>
    </div>
  );
}

// Código de descuento — vive debajo del resumen del pedido, fuera de su
// contenedor (y dentro del paso 4 en pantallas sin sidebar).
function DiscountCode({ c }: { c: CheckoutController }) {
  const {
    t, fmt, discountCodeInput, onDiscountInput,
    appliedCode, codeStatus, applyDiscountCode, removeDiscountCode,
  } = c;
  return (
    <div className="mt-4">
      <label className="block font-bold text-secondary mb-2 text-sm">
        {t.studio.discount.label} <span className="font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
      </label>
      {appliedCode ? (
        <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary-lighter px-4 py-3">
          <span className="font-bold text-secondary text-sm">
            {appliedCode.code} · −{appliedCode.type === 'percentage' ? `${appliedCode.value}%` : fmt(appliedCode.value)}
          </span>
          <button
            type="button"
            onClick={removeDiscountCode}
            className="text-xs font-bold text-secondary-lighter hover:text-primary transition-colors"
          >
            {t.studio.discount.remove}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={discountCodeInput}
            onChange={(e) => onDiscountInput(e.target.value)}
            placeholder="MICODIGO"
            maxLength={40}
            className="flex-1 min-w-0 rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm font-bold text-secondary uppercase focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={discountCodeInput.trim().length < 2 || codeStatus === 'checking'}
            onClick={applyDiscountCode}
            className="rounded-lg bg-secondary px-5 py-3 text-sm font-bold text-white hover:bg-secondary-light transition-colors disabled:opacity-40"
          >
            {codeStatus === 'checking' ? '...' : t.studio.discount.apply}
          </button>
        </div>
      )}
      {codeStatus === 'invalid' && (
        <p className="text-xs text-red-500 font-bold mt-2">{t.studio.discount.invalid}</p>
      )}
    </div>
  );
}

// Datos de contacto — se piden en el paso de pago para saber quién compra y
// cómo contactarlo (email + WhatsApp). Sin nombre + email válido no se
// muestran los botones de pago.
function ContactForm({ c }: { c: CheckoutController }) {
  const { lang, contact, setContactField } = c;
  const l = lang as Lang;
  return (
    <div className="rounded-2xl border-2 border-primary-lighter bg-white p-5 space-y-4">
      <div>
        <p className="font-black text-secondary text-base tracking-tighter">
          {pick3(l, 'Tus datos', 'Your details', 'Tes coordonnées')}
        </p>
        <p className="text-sm text-secondary-lighter">
          {pick3(l,
            'Para enviarte tu retrato y avisarte cuando esté listo.',
            'So we can send your portrait and let you know when it’s ready.',
            'Pour t’envoyer ton portrait et te prévenir quand il est prêt.')}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block sm:col-span-2">
          <span className="block text-xs font-bold text-secondary-lighter mb-1">
            {pick3(l, 'Nombre completo', 'Full name', 'Nom complet')} *
          </span>
          <input
            value={contact.name}
            onChange={(e) => setContactField('name', e.target.value)}
            placeholder={pick3(l, 'María García', 'Jane Doe', 'Marie Dupont')}
            maxLength={120}
            autoComplete="name"
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm font-medium text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-secondary-lighter mb-1">Email *</span>
          <input
            value={contact.email}
            onChange={(e) => setContactField('email', e.target.value)}
            placeholder="tucorreo@email.com"
            type="email"
            maxLength={255}
            autoComplete="email"
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm font-medium text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-secondary-lighter mb-1">
            WhatsApp <span className="font-normal">({pick3(l, 'opcional', 'optional', 'facultatif')})</span>
          </span>
          <input
            value={contact.phone}
            onChange={(e) => setContactField('phone', e.target.value)}
            placeholder="+57 300 123 4567"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm font-medium text-secondary focus:border-primary focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}

// Order summary — shown as a sticky sidebar from step 2 onward, and as a
// static, always-visible card on the checkout step so the customer sees
// exactly what they're paying for (in the site's own style).
function OrderSummary({ c, sticky = true }: { c: CheckoutController; sticky?: boolean }) {
  const {
    t, lang, fmt, selected, styles, appliedCode, shippingEstimate, shippingSelection,
    priceBreakdown, totalPrice, getBgName, getStyleBgs, getProducts,
  } = c;
  const b = priceBreakdown();
  const styleName = styles.find(s => s.id === selected.style)?.name;
  if (!selected.style) return null;

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
          {selected.recording && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">
                {pick3(lang as Lang, 'Video del proceso:', 'Process video:', 'Vidéo du processus :')}
              </span>
              <span className="font-bold text-secondary">+{fmt(b.recordingCost)}</span>
            </div>
          )}
          {b.products.length > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-secondary-lighter">{t.studio.summary.products}</span>
                <span className="font-bold text-secondary">+{fmt(b.productsCost)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-2">
                {getProducts()
                  .filter(p => (selected.productUnits[p.key]?.length ?? 0) > 0)
                  .flatMap(p =>
                    (selected.productUnits[p.key] ?? []).map((sel, i) => {
                      const variant = (p.options ?? [])
                        .map(g => g.values.find(v => v.key === sel[g.key])?.label[lang])
                        .filter(Boolean)
                        .join(' · ');
                      return (
                        <span key={`${p.key}-${i}`} className="text-xs bg-white rounded-full px-2.5 py-1 font-bold text-secondary">
                          {p.name[lang]}{variant ? ` · ${variant}` : ''}
                        </span>
                      );
                    }),
                  )}
              </div>
              {shippingSelection ? (
                <div className="flex justify-between">
                  <span className="text-secondary-lighter">
                    {pick3(lang as Lang, 'Envío', 'Shipping', 'Livraison')}: {shippingSelection.option.name}
                  </span>
                  <span className="font-bold text-secondary">+{fmt(shippingSelection.option.rateUsd)}</span>
                </div>
              ) : (
                <p className="text-xs text-secondary-lighter pl-2">
                  {shippingEstimate != null
                    ? `${pick3(lang as Lang, 'Envío estimado', 'Estimated shipping', 'Livraison estimée')}: ~${fmt(shippingEstimate)}`
                    : pick3(lang as Lang, 'Envío calculado en el checkout', 'Shipping calculated at checkout', 'Livraison calculée au paiement')}
                </p>
              )}
            </>
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
        {(() => {
          const nextTier = selected.bodyType ? nextFamilyTier(selected.peopleCount) : null;
          return nextTier && (
            <p className="bg-white rounded-xl px-3 py-2 text-xs font-bold text-primary text-center">
              {t.studio.step2.next_tier
                .replace('{n}', String(nextTier.at - selected.peopleCount))
                .replace('{pct}', String(Math.round(nextTier.rate * 100)))}
            </p>
          );
        })()}
      </div>
    );
}

export default function StudioPage() {
  const c = useCheckout();
  const {
    t, lang, fmt, currency,
    step, setStep, selected, priceMap,
    contact, setContactField, contactValid,
    showError,
    checkoutLoading, checkoutError, setCheckoutError, checkoutParams,
    canAdvance, totalPrice, getProducts,
    nextStep, prevStep, createPayPalOrder, capturePayPalOrder, createMpOrder, handlePhotoUpload,
    toggleExpress, toggleRecording, setSpecialRequests,
    productQty, addProductUnit, removeProductUnit, removeProductUnitAt, setProductUnitOption,
  } = c;

  const STEPS = t.studio.steps as unknown as string[];

  // Drawer del carrito (móvil): da la sensación de "carrito" tipo turnedyellow
  // reutilizando el resumen del pedido. En desktop ya existe el sidebar fijo.
  const [cartOpen, setCartOpen] = useState(false);
  // Nº de artículos/extras en el carrito para el badge del botón flotante.
  const cartCount =
    (selected.bodyType ? selected.peopleCount : 0) +
    (selected.background && selected.background !== 'none' ? 1 : 0) +
    (selected.express ? 1 : 0) +
    (selected.recording ? 1 : 0) +
    Object.values(selected.productUnits).reduce((n, list) => n + list.length, 0);

  // Misma foto por producto que la landing: imagen editable de pod_products
  // (landing_config), con POD_PLACEHOLDER_IMG como fallback.
  const [podImages, setPodImages] = useState<Record<string, string | null>>({});
  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string | null> = {};
        for (const p of mergePodProducts(d.pod_products)) map[p.key] = p.image;
        setPodImages(map);
      })
      .catch(() => null);
  }, []);

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
                    {i + 1 < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : i + 1}
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
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-28 w-full overflow-x-hidden">
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
                        {selected.express && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-secondary text-lg tracking-tighter">{t.studio.step4.express_title}</p>
                        <p className="text-sm text-secondary-lighter mt-1">{t.studio.step4.express_desc}</p>
                      </div>
                      <span className="font-black text-secondary text-xl whitespace-nowrap">+{Math.round(priceMap.express_surcharge_pct ?? 30)}%</span>
                    </div>
                  </button>

                  {/* 1b · Video del proceso de dibujo */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                      selected.recording
                        ? 'border-primary bg-primary-lighter ring-2 ring-primary'
                        : 'border-primary-lighter bg-white hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected.recording ? 'bg-primary border-primary text-white' : 'border-secondary-lighter'}`}>
                        {selected.recording && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-secondary text-lg tracking-tighter flex items-center gap-2">
                          <Video className="w-5 h-5 text-primary" />
                          {pick3(lang as Lang, 'Video del proceso de dibujo', 'Watch your artwork come to life', 'Vidéo du processus de dessin')}
                        </p>
                        <p className="text-sm text-secondary-lighter mt-1">
                          {pick3(lang as Lang, 'Grabamos cómo se crea tu retrato, de boceto a color.', 'We record how your portrait is created, from sketch to color.', 'Nous filmons la création de ton portrait, du croquis à la couleur.')}
                        </p>
                      </div>
                      <span className="font-black text-secondary text-xl whitespace-nowrap">+{fmt(priceMap.recording_addon ?? 20)}</span>
                    </div>
                  </button>

                  {/* Puedes pagar ya y mandar las fotos después */}
                  <StartNowBanner lang={lang as Lang} />

                  {/* 2 · Imprime tu dibujo (print on demand) */}
                  <div>
                    <h2 className="font-black text-xl text-secondary mb-1 tracking-tighter">{t.studio.products.title}</h2>
                    <p className="text-sm text-secondary-lighter mb-3">{t.studio.products.subtitle}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getProducts().map((p) => {
                        const qty = productQty(p.key);
                        const isSelected = qty > 0;
                        return (
                          <div
                            key={p.key}
                            className={`rounded-2xl border-2 p-3 transition-all bg-white ${
                              isSelected
                                ? 'border-primary ring-2 ring-primary'
                                : 'border-primary-lighter hover:border-primary'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => { if (qty === 0) addProductUnit(p.key); }}
                              aria-pressed={isSelected}
                              className="block w-full text-left focus:outline-none"
                            >
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-primary-lighter/40">
                                <Image
                                  src={podImages[p.key] || POD_PLACEHOLDER_IMG}
                                  alt={p.name[lang]}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </button>
                            <div className="mt-3 flex items-end justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-black text-secondary text-sm leading-tight">{p.name[lang]}</p>
                                <p className="text-sm text-secondary-lighter mt-0.5">{fmt(p.priceUsd)}</p>
                              </div>
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => addProductUnit(p.key)}
                                  aria-label={`${t.studio.products.add} ${p.name[lang]}`}
                                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary text-white px-1.5 py-1 shadow-md">
                                  <button
                                    type="button"
                                    onClick={() => removeProductUnit(p.key)}
                                    aria-label={`${t.studio.products.remove} ${p.name[lang]}`}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-sm font-black w-4 text-center tabular-nums">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => addProductUnit(p.key)}
                                    aria-label={`${t.studio.products.add} ${p.name[lang]}`}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Variantes por unidad (talla, modelo…): una fila por unidad,
                        para elegir el tamaño de cada item por separado. */}
                    {getProducts().filter(p => productQty(p.key) > 0 && p.options?.length).length > 0 && (
                      <div className="mt-4 space-y-3">
                        {getProducts()
                          .filter(p => productQty(p.key) > 0 && p.options?.length)
                          .map(p => (
                            <div key={p.key} className="rounded-2xl border-2 border-primary-lighter bg-white p-4">
                              <p className="font-black text-secondary text-sm mb-3 flex items-center gap-2">
                                <ProductIcon productKey={p.key} className="w-4 h-4 text-primary" />
                                {p.name[lang]}
                              </p>
                              <div className="space-y-3">
                                {(selected.productUnits[p.key] ?? []).map((unitSel, idx) => (
                                  <div key={idx} className="flex items-end gap-2">
                                    <span className="text-xs font-black text-secondary-lighter w-7 shrink-0 pb-2.5 tabular-nums">#{idx + 1}</span>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {(p.options ?? []).map(g => (
                                        <label key={g.key} className="block">
                                          <span className="block text-xs font-bold text-secondary-lighter mb-1">{g.label[lang]}</span>
                                          <select
                                            value={unitSel[g.key] ?? g.values[0]?.key}
                                            onChange={(e) => setProductUnitOption(p.key, idx, g.key, e.target.value)}
                                            className="w-full rounded-lg border-2 border-primary-lighter px-3 py-2.5 text-sm font-bold text-secondary focus:border-primary focus:outline-none bg-white"
                                          >
                                            {g.values.map(v => (
                                              <option key={v.key} value={v.key}>{v.label[lang]}</option>
                                            ))}
                                          </select>
                                        </label>
                                      ))}
                                    </div>
                                    {productQty(p.key) > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeProductUnitAt(p.key, idx)}
                                        aria-label={`${t.studio.products.remove} ${p.name[lang]} #${idx + 1}`}
                                        className="shrink-0 w-8 h-8 mb-0.5 rounded-full flex items-center justify-center border-2 border-primary-lighter text-secondary-lighter hover:border-primary hover:text-primary transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    <p className="text-xs text-secondary-lighter mt-3">{t.studio.products.digital_note}</p>

                    {/* Calculador de envío: solo con productos físicos en el
                        carrito. Obligatorio — sin método elegido no se avanza
                        y se resalta en rojo con shake como el resto. */}
                    {Object.values(selected.productUnits).some(list => list.length > 0) && (
                      <div
                        id="required-field"
                        onAnimationEnd={c.onShakeEnd}
                        className={`mt-4 ${c.errorRing} ${c.errorShake}`}
                      >
                        <ShippingCalculator
                          key={JSON.stringify(selected.productUnits)}
                          productUnits={selected.productUnits}
                          lang={lang as Lang}
                          fmt={fmt}
                          defaultCountry={CURRENCY_COUNTRY[currency] ?? 'US'}
                          onSelect={c.selectShipping}
                          onRequiredChange={c.setShippingRequired}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2 · Sube tus fotos (compacto) */}
                  <div>
                    <h2 className="font-black text-xl text-secondary mb-1 tracking-tighter">
                      {t.studio.step5.title}{' '}
                      <span className="text-sm font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
                    </h2>
                    <p className="text-sm text-secondary-lighter mb-3">{t.studio.step5.subtitle}</p>
                    <div
                      className="rounded-2xl border-2 border-dashed border-primary-lighter bg-white p-6 text-center hover:border-primary hover:bg-primary-lighter transition-all cursor-pointer"
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

                  {/* 4 · Notas especiales */}
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

                  {/* 5 · Código de descuento: solo móvil/tablet — en lg vive
                      debajo del resumen del pedido en el sidebar. */}
                  <div className="lg:hidden">
                    <DiscountCode c={c} />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 5: Embedded Checkout */}
            {step === 5 && checkoutParams && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-black text-3xl text-secondary mb-2 tracking-tighter">{t.studio.pay.title}</h2>
                  <div className="flex items-center justify-center gap-4 text-xs text-secondary-lighter flex-wrap">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-primary" /> {t.studio.pay.ssl}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> {currency === 'COP' ? 'Mercado Pago' : 'PayPal'}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> {t.studio.pay.no_card}</span>
                  </div>
                </div>
                {/* Resumen detallado del pedido (estilo de la web), siempre visible */}
                <div className="max-w-xl mx-auto mb-6">
                  <OrderSummary c={c} sticky={false} />
                </div>

                {/* Datos de contacto — obligatorios antes de pagar */}
                <div className="max-w-xl mx-auto mb-6">
                  <ContactForm c={c} />
                </div>

                <div className="max-w-xl mx-auto bg-white rounded-2xl border-2 border-primary-lighter shadow-lg overflow-hidden">
                  <div className="bg-primary-lighter px-6 py-4 flex items-center justify-between">
                    <span className="font-black text-secondary text-sm">Total: {fmt(totalPrice())}</span>
                    <div className="flex items-center gap-2 text-xs text-secondary-lighter">
                      <Lock className="w-3 h-3" />
                      <span>{t.studio.pay.secure}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    {!contactValid ? (
                      <p className="text-center text-sm font-bold text-secondary-lighter py-6">
                        {pick3(lang as Lang,
                          'Completa tu nombre y email arriba para continuar con el pago.',
                          'Fill in your name and email above to continue to payment.',
                          'Renseigne ton nom et ton email ci-dessus pour continuer.')}
                      </p>
                    ) : currency === 'COP' ? (
                      <MercadoPagoBrick lang={lang as Lang} createOrder={createMpOrder} />
                    ) : !PAYPAL_CLIENT_ID ? (
                      // Sin client id el SDK de PayPal falla mudo y el recuadro
                      // queda vacío — mejor decir explícitamente qué falta.
                      <p className="text-center text-sm font-bold text-red-500 py-6">
                        PayPal no está configurado (falta NEXT_PUBLIC_PAYPAL_CLIENT_ID).
                      </p>
                    ) : (
                      // SDK v6 con presentationMode="modal": el checkout se abre
                      // SIEMPRE como overlay dentro de la página, nunca en una
                      // ventana externa (que a veces quedaba en about:blank).
                      // La moneda e intent viajan en la orden creada por el
                      // servidor (/api/checkout), no en el proveedor.
                      <PayPalProvider
                        clientId={PAYPAL_CLIENT_ID}
                        environment={PAYPAL_ENVIRONMENT}
                        components={['paypal-payments']}
                        pageType="checkout"
                      >
                        <PayPalOneTimePaymentButton
                          presentationMode="modal"
                          createOrder={async () => ({ orderId: await createPayPalOrder() })}
                          onApprove={async ({ orderId }) => capturePayPalOrder(orderId)}
                          // Si el SDK cierra el modal por un fallo (incluida la
                          // orden que no se pudo crear), mostramos el error.
                          onError={() => setCheckoutError(t.studio.errors.payment)}
                          // Cancelar no es un error: se limpia el mensaje.
                          onCancel={() => setCheckoutError('')}
                        />
                        {/* Botón de pago con tarjeta (guest checkout / BCDC):
                            el equivalente en SDK v6 al botón "Débito o crédito"
                            que el layout vertical de PayPalButtons (v5) mostraba
                            junto al de PayPal. Reutiliza la misma orden y
                            callbacks que el botón de PayPal. */}
                        <div className="mt-2">
                          <PayPalGuestPaymentButton
                            createOrder={async () => ({ orderId: await createPayPalOrder() })}
                            onApprove={async ({ orderId }) => capturePayPalOrder(orderId)}
                            onError={() => setCheckoutError(t.studio.errors.payment)}
                            onCancel={() => setCheckoutError('')}
                          />
                        </div>
                      </PayPalProvider>
                    )}
                  </div>
                </div>
                {/* El error del pago también debe verse en el paso 5 (la barra de
                    navegación con checkoutError solo existe en los pasos 1–4). */}
                {checkoutError && (
                  <p className="max-w-xl mx-auto mt-4 text-center text-sm font-bold text-red-500">
                    {checkoutError}
                  </p>
                )}
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(4)} className="text-secondary-lighter hover:text-primary text-sm font-bold transition-colors">
                    {t.studio.pay.back}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation (pasos 1–4). Barra fija abajo (móvil y desktop),
                siempre accesible sin scrollear. */}
            {step < 5 && (
              <>
                <div className="hidden sm:block">
                  {showError && !canAdvance() && (
                    <p className="text-center text-sm text-red-500 font-bold mt-4 order-first">
                      {t.studio.nav.missing}
                    </p>
                  )}
                  <p className="text-center text-xs text-secondary-lighter mt-8">
                    {t.studio.nav.secure}
                  </p>
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-primary-lighter shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  {showError && !canAdvance() && (
                    <p className="sm:hidden text-center text-xs text-red-500 font-bold mb-2">
                      {t.studio.nav.missing}
                    </p>
                  )}
                  {checkoutError && (
                    <p className="text-center text-xs text-red-500 font-bold mb-2">
                      {checkoutError}
                    </p>
                  )}
                  <div className="flex justify-between items-center gap-3 mx-auto max-w-6xl">
                    <button
                      onClick={prevStep}
                      className="text-secondary-lighter hover:text-primary text-sm font-bold px-4 sm:px-6 py-3 rounded-lg hover:bg-primary-lighter transition-colors flex-shrink-0"
                    >
                      {step === 1 ? <Link href="/">{t.studio.nav.back_home}</Link> : t.studio.nav.prev}
                    </button>
                    {step > 1 && (
                      <button
                        onClick={nextStep}
                        disabled={checkoutLoading}
                        aria-disabled={!canAdvance()}
                        className="flex-1 sm:flex-none justify-center rounded-lg px-6 sm:px-10 py-4 sm:py-3 font-bold text-white transition-all flex items-center gap-2 bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl disabled:opacity-60"
                      >
                        {checkoutLoading && (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {step === 4 ? t.studio.nav.checkout : t.studio.nav.next}
                        {step > 1 && <span className="font-black">· {fmt(totalPrice())}</span>}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          {step > 1 && step < 5 && (
            <div className="hidden lg:block">
              {/* Sticky sobre el conjunto: el cupón va debajo del resumen,
                  fuera de su contenedor, y baja junto con él al hacer scroll. */}
              <div className="sticky top-24">
                <OrderSummary c={c} sticky={false} />
                <DiscountCode c={c} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Carrito flotante (móvil): botón + panel deslizante que reutiliza el
          resumen del pedido, para dar sensación de carrito estilo turnedyellow.
          En desktop (lg) ya está el sidebar fijo, así que se oculta. */}
      {step > 1 && step < 5 && selected.style && (
        <>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-secondary text-white pl-4 pr-5 py-3 shadow-xl hover:bg-secondary-light transition-colors"
            aria-label={pick3(lang as Lang, 'Ver carrito', 'View cart', 'Voir le panier')}
          >
            <span className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="font-black text-sm">{fmt(totalPrice())}</span>
          </button>

          {cartOpen && (
            <div className="lg:hidden fixed inset-0 z-[70]">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setCartOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl overflow-y-auto p-4 pb-24">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-secondary text-lg tracking-tighter">
                    {pick3(lang as Lang, 'Tu carrito', 'Your cart', 'Ton panier')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-lighter transition-colors"
                    aria-label={pick3(lang as Lang, 'Cerrar', 'Close', 'Fermer')}
                  >
                    <X className="w-5 h-5 text-secondary" />
                  </button>
                </div>
                <OrderSummary c={c} sticky={false} />
                <DiscountCode c={c} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
