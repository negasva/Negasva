'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CreditCard, Lock, ShieldCheck, Plus, Minus, Check, X, Info, Video, ShoppingBag, Trash2 } from 'lucide-react';
import Logo from '@/components/Logo';
import ProductIcon from '@/components/ProductIcon';
import { mergePodProducts, POD_PLACEHOLDER_IMG } from '@/lib/content/podProducts';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { PayPalProvider, PayPalOneTimePaymentButton, PayPalGuestPaymentButton } from '@paypal/react-paypal-js/sdk-v6';
import RecaptchaScript from '@/components/RecaptchaScript';
import MercadoPagoBrick from '@/components/MercadoPagoBrick';
import { PaymentLogo, PaymentLogoStrip } from '@/components/PaymentLogos';
import { nextFamilyTier, familyDiscountRate } from '@/lib/pricing/calc';
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
        {pick3(lang, 'Empieza ya, sube las fotos luego', 'Start now, upload photos later', 'Commence maintenant, envoie les photos plus tard')}
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
            {appliedCode.code} - {appliedCode.type === 'percentage' ? `${appliedCode.value}%` : fmt(appliedCode.value)} off
          </span>
          <button
            type="button"
            onClick={removeDiscountCode}
            className="min-h-[44px] px-2 text-xs font-bold text-secondary-lighter hover:text-primary transition-colors"
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
            className="flex-1 min-w-0 rounded-lg border-2 border-primary-lighter px-4 py-3 text-base font-bold text-secondary uppercase focus:border-primary focus:outline-none"
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

// Propina opcional (paso 5): SOLO 3 opciones — 5%, 10% o monto personalizado.
// El % lo recalcula el servidor; la personalizada viaja en USD acotada.
function TipSelector({ c }: { c: CheckoutController }) {
  const { lang, fmt, currency, rates, tip, setTip, priceBreakdown } = c;
  const l = lang as Lang;
  const [customInput, setCustomInput] = useState('');
  const base = priceBreakdown().total;
  const rate = rates[currency] ?? 1;
  const customActive = tip != null && tip.pct == null;
  const pctBtnCls = (active: boolean) =>
    `flex-1 rounded-xl border-2 px-3 py-3 min-h-[44px] text-sm font-black transition-all ${
      active ? 'border-primary bg-primary-lighter text-primary' : 'border-primary-lighter bg-white text-secondary hover:border-primary'
    }`;
  return (
    <div className="rounded-2xl border-2 border-primary-lighter bg-white p-5">
      <p className="font-black text-secondary text-base tracking-tighter">
        {pick3(l, 'Want to leave the artist a tip?', 'Want to leave the artist a tip?', 'Want to leave the artist a tip?')}{' '}
        <span className="font-normal text-secondary-lighter text-sm">{t3optional(l)}</span>
      </p>
      <div className="mt-3 flex gap-2">
        {([5, 10] as const).map(pct => (
          <button
            key={pct}
            type="button"
            onClick={() => { setTip(tip?.pct === pct ? null : { pct }); setCustomInput(''); }}
            className={pctBtnCls(tip?.pct === pct)}
          >
            {pct}% <span className="font-bold text-xs text-secondary-lighter">({fmt(base * pct / 100)})</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => { if (customActive) { setTip(null); setCustomInput(''); } else setTip({ usd: 0 }); }}
          className={pctBtnCls(customActive)}
        >
          {pick3(l, 'Otro', 'Custom', 'Autre')}
        </button>
      </div>
      {customActive && (
        <input
          value={customInput}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d.]/g, '');
            setCustomInput(v);
            // El input está en la moneda visible; al servidor viaja en USD.
            setTip({ usd: Math.min(Math.max((Number(v) || 0) / rate, 0), 500) });
          }}
          inputMode="decimal"
          placeholder={`${pick3(l, 'Monto en', 'Amount in', 'Montant en')} ${currency}`}
          className="mt-3 w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-base font-bold text-secondary focus:border-primary focus:outline-none"
        />
      )}
    </div>
  );
}
const t3optional = (l: Lang) => pick3(l, '(opcional)', '(optional)', '(facultatif)');

// Tira de confianza bajo los botones de pago: métodos aceptados + SSL.
function PaymentTrustStrip({ lang, cop }: { lang: Lang; cop: boolean }) {
  const methods = cop ? ['Mercado Pago', 'PSE', 'Visa', 'Mastercard'] : ['Visa', 'Mastercard', 'Amex', 'PayPal'];
  return (
    <div className="mt-5 rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-center">
      <PaymentLogoStrip methods={methods} />
      <div className="mt-3 flex items-center justify-center gap-2 text-sm font-black text-green-700">
        <ShieldCheck className="h-4 w-4" />
        <span>
          {pick3(lang,
            'Secure payment - 256-bit SSL - we never store your card',
            'Secure payment - 256-bit SSL - we never store your card',
            'Secure payment - 256-bit SSL - we never store your card')}
        </span>
      </div>
    </div>
  );
}

// Barra de incentivo familiar (arriba del drawer): progreso real por
// peopleCount hacia el próximo tier de nextFamilyTier(). En el tier máximo
// muestra el beneficio logrado.
function FamilyTierBar({ c }: { c: CheckoutController }) {
  const { lang, fmt, selected, priceMap, priceBreakdown } = c;
  const l = lang as Lang;
  if (!selected.bodyType) return null;
  const tier = nextFamilyTier(selected.peopleCount);
  const b = priceBreakdown();
  // Con 1 persona el mejor incentivo es el 2º retrato con descuento fuerte
  // (% del admin de precios), no el pack familia de 3.
  if (selected.peopleCount === 1) {
    const pct = Math.round(priceMap.second_portrait_pct ?? 40);
    return (
      <div className="rounded-2xl bg-primary-lighter border-2 border-primary p-4 mb-4">
        <p className="text-xs font-black text-secondary mb-2">
          {pick3(l,
            `Add another person: 2nd portrait at -${pct}% (save ${fmt(b.perPerson * pct / 100)})`,
            `Add another person: 2nd portrait at -${pct}% (save ${fmt(b.perPerson * pct / 100)})`,
            `Add another person: 2nd portrait at -${pct}% (save ${fmt(b.perPerson * pct / 100)})`)}
        </p>
        <div className="h-2 rounded-full bg-white overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: '50%' }} />
        </div>
      </div>
    );
  }
  if (!tier) {
    const pct = Math.round(familyDiscountRate(selected.peopleCount) * 100);
    return (
      <div className="rounded-2xl bg-primary-lighter border-2 border-primary p-4 mb-4 text-center">
        <p className="text-sm font-black text-primary">
          {pick3(l,
            `You've unlocked the maximum ${pct}% family discount!`,
            `You've unlocked the maximum ${pct}% family discount!`,
            `You've unlocked the maximum ${pct}% family discount!`)}
        </p>
      </div>
    );
  }
  const missing = tier.at - selected.peopleCount;
  const perPersonAtTier = b.perPerson * (1 - tier.rate);
  return (
    <div className="rounded-2xl bg-primary-lighter border-2 border-primary p-4 mb-4">
      <p className="text-xs font-black text-secondary mb-2">
        {pick3(l,
          `Add ${missing} more ${missing > 1 ? 'people' : 'person'} and drop to ${fmt(perPersonAtTier)} each`,
          `Add ${missing} more ${missing > 1 ? 'people' : 'person'} and drop to ${fmt(perPersonAtTier)} each`,
          `Add ${missing} more ${missing > 1 ? 'people' : 'person'} and drop to ${fmt(perPersonAtTier)} each`)}
      </p>
      <div className="h-2 rounded-full bg-white overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(100, (selected.peopleCount / tier.at) * 100)}%` }}
        />
      </div>
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
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-base font-medium text-secondary focus:border-primary focus:outline-none"
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
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-base font-medium text-secondary focus:border-primary focus:outline-none"
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
            className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-base font-medium text-secondary focus:border-primary focus:outline-none"
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
    t, lang, fmt, currency, selected, styles, appliedCode, shippingEstimate, shippingSelection,
    tipUsd, priceBreakdown, totalPrice, getBgName, getStyleBgs, getProducts,
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
                  {selected.peopleCount} {t.studio.summary.people_count} x {fmt(b.perPerson)}
                </span>
                <span className={`font-bold ${b.discountRate > 0 ? 'line-through text-secondary-lighter' : 'text-secondary'}`}>
                  {fmt(b.peopleSubtotal)}
                </span>
              </div>
              {b.discountRate > 0 && (
                <div className="flex justify-between bg-white rounded-xl px-3 py-1.5">
                  <span className="text-primary font-bold">-{Math.round(b.discountRate * 100)}%</span>
                  <span className="font-bold text-primary">-{fmt(b.discount)}</span>
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
                        .join(' - ');
                      return (
                        <span key={`${p.key}-${i}`} className="text-xs bg-white rounded-full px-2.5 py-1 font-bold text-secondary">
                          {p.name[lang]}{variant ? ` - ${variant}` : ''}
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
              <span className="font-bold text-primary">-{fmt(b.codeDiscount)}</span>
            </div>
          )}
          {selected.specialRequests.trim() && (
            <div className="bg-white rounded-xl px-3 py-2">
              <span className="block text-secondary-lighter text-xs mb-0.5">{t.studio.step4.notes_label}</span>
              <span className="block text-secondary text-xs font-medium break-words">{selected.specialRequests}</span>
            </div>
          )}
        </div>
        {tipUsd > 0 && (
          <div className="flex justify-between">
            <span className="text-secondary-lighter">{pick3(lang as Lang, 'Propina', 'Tip', 'Pourboire')}</span>
            <span className="font-bold text-secondary">+{fmt(tipUsd)}</span>
          </div>
        )}
        {selected.bodyType && (
          <div className="flex justify-between border-t-2 border-primary pt-3 font-black text-lg">
            <span className="text-secondary">{t.studio.summary.total}</span>
            <span className="text-primary">{fmt(totalPrice())}</span>
          </div>
        )}
        {selected.bodyType && currency === 'COP' && (
          <p className="text-xs font-bold text-primary text-center">
            {pick3(lang as Lang, 'Hasta 3 cuotas sin interés', 'Up to 3 interest-free installments', 'Jusqu’à 3 fois sans frais')}
          </p>
        )}
        {(() => {
          if (!selected.bodyType) return null;
          // Con 1 persona el gancho es el 2º retrato con descuento fuerte.
          if (selected.peopleCount === 1) {
            const pct = Math.round(c.priceMap.second_portrait_pct ?? 40);
            return (
              <p className="bg-white rounded-xl px-3 py-2 text-xs font-bold text-primary text-center">
                {pick3(lang as Lang,
                  `Add one more person: 2nd portrait -${pct}%!`,
                  `Add one more person: 2nd portrait -${pct}%!`,
                  `Add one more person: 2nd portrait -${pct}%!`)}
              </p>
            );
          }
          const nextTier = nextFamilyTier(selected.peopleCount);
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
    selectShipping, setShippingRequired,
    productQty, addProductUnit, removeProductUnit, removeProductUnitAt, setProductUnitOption,
  } = c;

  const STEPS = t.studio.steps as unknown as string[];

  // Drawer del carrito (móvil): da la sensación de "carrito" tipo turnedyellow
  // reutilizando el resumen del pedido. En desktop ya existe el sidebar fijo.
  const [cartOpen, setCartOpen] = useState(false);
  // Cerrar el drawer con Esc (además del click en overlay y la X).
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen]);
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
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 flex items-center justify-between">
          <span className="sm:hidden"><Logo href="/" size="sm" /></span>
          <span className="hidden sm:block"><Logo href="/" size="md" /></span>
          <div className="flex items-center gap-1.5 sm:gap-4">
            <CurrencySwitcher />
            <LanguageSwitcher />
            {/* Carrito siempre visible (desktop y móvil): badge + total, abre el drawer. */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="shrink-0 flex items-center gap-2 rounded-full bg-primary text-white min-h-[44px] pl-2.5 pr-3 sm:pl-3 sm:pr-4 py-2 hover:bg-primary-dark transition-colors"
              aria-label={pick3(lang as Lang, 'Ver carrito', 'View cart', 'Voir le panier')}
            >
              <span className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-secondary text-white text-[10px] font-black">
                    {cartCount}
                  </span>
                )}
              </span>
              {selected.bodyType && (
                <span className="text-sm font-bold hidden min-[360px]:inline">{fmt(totalPrice())}</span>
              )}
            </button>
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
                  className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none disabled:cursor-not-allowed group"
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
                  <div className={`w-3 sm:w-10 h-1 mx-0.5 sm:mx-2 ${i + 1 < step ? 'bg-primary' : 'bg-primary-lighter'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-28 w-full overflow-x-hidden">
        <div className={`${step > 1 ? 'lg:grid lg:grid-cols-3 lg:gap-8' : ''}`}>
          {/* Main step content */}
          <div className={step > 1 ? 'lg:col-span-2' : ''}>

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
                                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary text-white px-1.5 py-1 shadow-md">
                                  <button
                                    type="button"
                                    onClick={() => removeProductUnit(p.key)}
                                    aria-label={`${t.studio.products.remove} ${p.name[lang]}`}
                                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-sm font-black w-4 text-center tabular-nums">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => addProductUnit(p.key)}
                                    aria-label={`${t.studio.products.add} ${p.name[lang]}`}
                                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
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

                    {getProducts().filter(p => productQty(p.key) > 0 && p.options?.length).length > 0 && (
                      <div className="mt-4 space-y-3">
                        {getProducts()
                          .filter(p => productQty(p.key) > 0 && p.options?.length)
                          .map(p => (
                            <div key={p.key} className="rounded-2xl border-2 border-primary-lighter bg-white p-4">
                              <p className="mb-3 flex items-center gap-2 text-sm font-black text-secondary">
                                <ProductIcon productKey={p.key} className="w-4 h-4 text-primary" />
                                {p.name[lang]}
                              </p>
                              <div className="space-y-3">
                                {(selected.productUnits[p.key] ?? []).map((unit, unitIndex) => (
                                  <div key={`${p.key}-${unitIndex}`} className="rounded-xl border border-primary-lighter p-3">
                                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-secondary-lighter">
                                      {p.name[lang]} #{unitIndex + 1}
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {(p.options ?? []).map((group) => (
                                        <label key={group.key} className="block">
                                          <span className="mb-1 block text-xs font-bold text-secondary-lighter">
                                            {group.label[lang]}
                                          </span>
                                          <select
                                            value={unit[group.key] ?? ''}
                                            onChange={(e) => setProductUnitOption(p.key, unitIndex, group.key, e.target.value)}
                                            className="w-full rounded-lg border-2 border-primary-lighter px-3 py-2.5 text-base font-bold text-secondary focus:border-primary focus:outline-none"
                                          >
                                            {(group.values ?? []).map((value) => (
                                              <option key={value.key} value={value.key}>
                                                {value.label[lang]}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {Object.values(selected.productUnits).some((list) => list.length > 0) && (
                      <ShippingCalculator
                        productUnits={selected.productUnits}
                        lang={lang as Lang}
                        fmt={fmt}
                        defaultCountry={CURRENCY_COUNTRY[currency] ?? 'US'}
                        onSelect={selectShipping}
                        onRequiredChange={setShippingRequired}
                      />
                    )}

                    <div className="rounded-2xl border-2 border-primary-lighter bg-white p-5">
                      <label className="block cursor-pointer">
                        <span className="block text-lg font-black tracking-tighter text-secondary">{t.studio.step5.title}</span>
                        <span className="mt-1 block text-sm text-secondary-lighter">{t.studio.step5.subtitle}</span>
                        <div className="mt-4 rounded-2xl border-2 border-dashed border-primary-lighter bg-primary-lighter/20 px-4 py-6 text-center">
                          <span className="block font-bold text-secondary">{t.studio.step5.drag}</span>
                          <span className="mt-1 block text-sm text-secondary-lighter">{t.studio.step5.or}</span>
                          <span className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-black text-white">
                            {t.studio.step5.select_btn}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </label>
                      <p className="mt-3 text-xs font-bold text-secondary-lighter">
                        {t.studio.step5.max_size} - {selected.peopleCount} {selected.peopleCount > 1 ? t.studio.step5.required_photos_plural : t.studio.step5.required_photos}
                      </p>
                      {selected.photos.length > 0 && (
                        <p className="mt-2 text-sm font-bold text-primary">
                          {selected.photos.length} {selected.photos.length > 1 ? t.studio.step5.selected_plural : t.studio.step5.selected}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border-2 border-primary-lighter bg-white p-5">
                      <label className="block">
                        <span className="block text-lg font-black tracking-tighter text-secondary">
                          {t.studio.step4.notes_label} <span className="text-sm font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
                        </span>
                        <textarea
                          value={selected.specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder={t.studio.step4.notes_placeholder}
                          rows={5}
                          maxLength={500}
                          className="mt-3 w-full resize-none rounded-lg border-2 border-primary-lighter px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="lg:hidden">
                      <DiscountCode c={c} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && checkoutParams && (
              <div>
                <div className="mb-8 text-center">
                  <h2 className="mb-3 text-4xl font-black tracking-tighter text-secondary">{t.studio.pay.title}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-secondary-lighter">
                    <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> {t.studio.pay.ssl}</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> {currency === 'COP' ? 'Mercado Pago' : 'PayPal'}</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> {t.studio.pay.no_card}</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <ContactForm c={c} />
                  <TipSelector c={c} />

                  <div className="overflow-hidden rounded-2xl border-2 border-primary-lighter bg-white shadow-lg">
                    <div className="flex items-center justify-between gap-3 bg-primary-lighter px-6 py-3.5">
                      <span className="text-sm font-black text-secondary">Total: {fmt(totalPrice())}</span>
                      <div className="flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Secure payment</span>
                      </div>
                    </div>
                    <div className="p-5">
                      {!contactValid ? (
                        <p className="py-6 text-center text-sm font-bold text-secondary-lighter">
                          Fill in your name and email above to continue to payment.
                        </p>
                      ) : currency === 'COP' ? (
                        <>
                          <p className="mb-3 text-center text-xs font-bold text-primary">
                            Pay in up to 3 interest-free installments
                          </p>
                          <MercadoPagoBrick key={JSON.stringify(c.tip)} lang={lang as Lang} createOrder={createMpOrder} />
                        </>
                      ) : !PAYPAL_CLIENT_ID ? (
                        <p className="py-6 text-center text-sm font-bold text-red-500">
                          PayPal is not configured (missing NEXT_PUBLIC_PAYPAL_CLIENT_ID).
                        </p>
                      ) : (
                        <PayPalProvider
                          clientId={PAYPAL_CLIENT_ID}
                          environment={PAYPAL_ENVIRONMENT}
                          components={['paypal-payments', 'paypal-guest-payments']}
                          pageType="checkout"
                        >
                          <div className="space-y-3 paypal-checkout-panels">
                            <div className="rounded-xl border border-[#ffc439] bg-[#fff7d6] p-3">
                              <div className="mb-2 flex items-center justify-center gap-2 text-sm font-black">
                                <PaymentLogo name="" />
                                <span></span>
                              </div>
                              <PayPalOneTimePaymentButton
                                type="checkout"
                                presentationMode="modal"
                                createOrder={async () => ({ orderId: await createPayPalOrder() })}
                                onApprove={async ({ orderId }) => capturePayPalOrder(orderId)}
                                onError={() => setCheckoutError(t.studio.errors.payment)}
                                onCancel={() => setCheckoutError('')}
                              />
                            </div>
                            <div className="rounded-xl border border-primary-lighter bg-white p-3">
                              <div className="mb-2 flex items-center justify-center gap-2 text-sm font-black text-secondary">
                                <CreditCard className="h-4 w-4" />
                                <span></span>
                              </div>
                              <PayPalGuestPaymentButton
                                createOrder={async () => ({ orderId: await createPayPalOrder() })}
                                onApprove={async ({ orderId }) => capturePayPalOrder(orderId)}
                                onError={() => setCheckoutError(t.studio.errors.payment)}
                                onCancel={() => setCheckoutError('')}
                              />
                            </div>
                          </div>
                          <style jsx global>{`
                            .paypal-checkout-panels paypal-button,
                            .paypal-checkout-panels paypal-basic-card-button,
                            .paypal-checkout-panels paypal-basic-card-container {
                              display: block;
                              width: 100% !important;
                              max-width: none !important;
                            }
                            .paypal-checkout-panels iframe {
                              width: 100% !important;
                              max-width: none !important;
                            }
                          `}</style>
                        </PayPalProvider>
                      )}
                      <PaymentTrustStrip lang={lang as Lang} cop={currency === 'COP'} />
                    </div>
                  </div>

                  {/* El error del pago también debe verse en el paso 5 (la barra
                      de navegación con checkoutError solo existe en los pasos 1–4). */}
                  {checkoutError && (
                    <p className="text-center text-sm font-bold text-red-500">
                      {checkoutError}
                    </p>
                  )}

                  <div className="text-center pt-1">
                    <button
                      onClick={() => setStep(4)}
                      className="text-sm font-bold text-secondary-lighter border-b-2 border-primary-lighter hover:text-primary-dark hover:border-primary transition-colors"
                    >
                      {t.studio.pay.back}
                    </button>
                  </div>
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
                        {step > 1 && <span className="font-black">- {fmt(totalPrice())}</span>}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Order Summary (pasos 2–5; en el 5 es donde vive el
              resumen — la columna principal solo lleva datos + pago). */}
          {step > 1 && (
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

      {/* Drawer del carrito (desktop y móvil, todos los pasos): panel lateral
          que reutiliza el resumen del pedido y se actualiza en vivo. Se abre
          desde el icono del carrito de la nav. */}
      {cartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header: "My Cart" + contador de artículos */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-primary-lighter">
              <span className="font-black text-secondary text-lg tracking-tighter flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                {pick3(lang as Lang, 'Mi carrito', 'My Cart', 'Mon panier')}
                <span className="text-secondary-lighter font-bold text-sm">({cartCount})</span>
              </span>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary-lighter transition-colors"
                aria-label={pick3(lang as Lang, 'Cerrar', 'Close', 'Fermer')}
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FamilyTierBar c={c} />
              {selected.style ? (
                <>
                  <CartDrawerItems c={c} podImages={podImages} />
                  <OrderSummary c={c} sticky={false} />
                  <DiscountCode c={c} />
                </>
              ) : (
                <p className="text-sm text-secondary-lighter text-center py-8">
                  {pick3(lang as Lang, 'Tu carrito está vacío. Elige un estilo para empezar.', 'Your cart is empty. Pick a style to start.', 'Ton panier est vide. Choisis un style pour commencer.')}
                </p>
              )}
            </div>

            {/* Footer fijo: total + Secure Checkout (dorado, escudo) + métodos */}
            {selected.bodyType && (
              <div className="border-t border-primary-lighter px-4 py-4 space-y-3 bg-white">
                <div className="flex justify-between items-center font-black text-lg">
                  <span className="text-secondary">{t.studio.summary.total}</span>
                  <span className="text-secondary">{fmt(totalPrice())}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setCartOpen(false); if (step < 4) setStep(4); }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-400 hover:bg-amber-500 text-secondary font-black py-3.5 shadow-md transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {pick3(lang as Lang, 'Pago seguro', 'Secure Checkout', 'Paiement sécurisé')}
                </button>
                {/* ponytail: chips de texto para métodos de pago — cero assets, igual que PaymentTrustStrip. */}
                <div className="flex justify-center flex-wrap gap-1.5">
                  {['Visa', 'Mastercard', 'Shop Pay', 'Google Pay', 'PayPal'].map(m => (
                    <span key={m} className="px-2 py-1 rounded-md border border-primary-lighter bg-white text-[9px] font-black uppercase tracking-wide text-secondary-lighter">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CartDrawerItems({ c, podImages }: { c: CheckoutController; podImages: Record<string, string | null> }) {
  const {
    lang, fmt, selected, styles, priceBreakdown, getProducts,
    removePortrait, removeBackground, removeExpress, removeRecording, removeProductUnitAt,
  } = c;
  const b = priceBreakdown();
  const style = styles.find(s => s.id === selected.style);
  const products = getProducts().flatMap((p) =>
    (selected.productUnits[p.key] ?? []).map((unit, i) => {
      const variant = (p.options ?? [])
        .map(g => g.values.find(v => v.key === unit[g.key])?.label[lang])
        .filter(Boolean)
        .join(' - ');
      return { p, i, variant };
    }),
  );

  return (
    <div className="space-y-3 mb-4">
      {selected.style && (
        <div className="flex gap-3 rounded-2xl border-2 border-primary-lighter bg-white p-3">
          {style?.image && <img src={style.image} alt={style.name} className="h-16 w-16 rounded-xl object-cover" />}
          <div className="min-w-0 flex-1">
            <p className="font-black text-secondary leading-tight">{style?.name ?? selected.style}</p>
            <p className="text-xs font-bold text-secondary-lighter">
              {selected.bodyType === 'full_body' ? 'Full body' : 'Torso'} · {selected.peopleCount} people
            </p>
            {selected.bodyType && <p className="mt-1 font-black text-primary">{fmt(b.peopleSubtotal - b.discount)}</p>}
          </div>
          <button type="button" onClick={removePortrait} aria-label="Remove portrait" className="self-start rounded-md p-3 -m-2 text-red-500 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {selected.background && selected.background !== 'none' && (
        <CartMiniRow label="Background" value={fmt(b.bgCost)} onRemove={removeBackground} />
      )}
      {selected.express && (
        <CartMiniRow label="Express 24h" value={fmt(b.expressSurcharge)} onRemove={removeExpress} />
      )}
      {selected.recording && (
        <CartMiniRow label="Process video" value={fmt(b.recordingCost)} onRemove={removeRecording} />
      )}
      {products.map(({ p, i, variant }) => (
        <div key={`${p.key}-${i}`} className="flex gap-3 rounded-2xl border-2 border-primary-lighter bg-white p-3">
          <img src={podImages[p.key] || POD_PLACEHOLDER_IMG} alt={p.name[lang]} className="h-14 w-14 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-secondary leading-tight">{p.name[lang]}</p>
            {variant && <p className="text-xs font-bold text-secondary-lighter">{variant}</p>}
            <p className="mt-1 font-black text-primary">{fmt(p.priceUsd)}</p>
          </div>
          <button type="button" onClick={() => removeProductUnitAt(p.key, i)} aria-label={`Remove ${p.name[lang]}`} className="self-start rounded-md p-3 -m-2 text-red-500 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function CartMiniRow({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary-lighter bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="font-black text-secondary leading-tight">{label}</p>
        <p className="text-sm font-black text-primary">{value}</p>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="rounded-md p-3 -m-2 text-red-500 hover:bg-red-50">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
