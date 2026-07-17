'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react';
import { POD_PRODUCTS, defaultProductOptions } from '@/lib/pricing/products';
import { mergePodProducts, POD_PLACEHOLDER_IMG } from '@/lib/content/podProducts';
import { PaymentLogoStrip } from '@/components/PaymentLogos';

type MainCartItem = {
  id: string;
  name: string;
  price: string;
  image?: string;
  qty: number;
};

type OrderCartState = {
  selected?: {
    style?: string;
    bodyType?: string;
    peopleCount?: number;
    background?: string;
    express?: boolean;
    recording?: boolean;
    productUnits?: Record<string, Array<Record<string, string>>>;
  };
  step?: number;
  contact?: { name: string; email: string; phone: string };
};

const KEY = 'negasva_cart_v1';
const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Shop Pay', 'Google Pay', 'PayPal'];

function readState(): OrderCartState {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeState(state: OrderCartState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('main-cart:update'));
  window.dispatchEvent(new Event('storage'));
}

function readItems(): MainCartItem[] {
  const state = readState();
  const selected = state.selected ?? {};
  const items: MainCartItem[] = [];
  if (selected.style) {
    items.push({
      id: 'portrait',
      name: selected.style.replaceAll('-', ' '),
      price: selected.bodyType ? `${selected.peopleCount ?? 1} people` : 'Style selected',
      qty: selected.peopleCount ?? 1,
    });
  }
  for (const product of POD_PRODUCTS) {
    const qty = selected.productUnits?.[product.key]?.length ?? 0;
    if (qty > 0) items.push({ id: product.key, name: product.name.en, price: `$${product.priceUsd}`, qty });
  }
  return items;
}

export function addMainCartItem(item: Omit<MainCartItem, 'qty'>) {
  const state = readState();
  const selected = state.selected ?? {};
  const productUnits = { ...(selected.productUnits ?? {}) };
  const list = productUnits[item.id] ?? [];
  productUnits[item.id] = [...list, defaultProductOptions(item.id)];
  writeState({ ...state, selected: { peopleCount: 1, ...selected, productUnits }, step: Math.max(state.step ?? 1, 4) });
}

export default function MainCartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MainCartItem[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [styles, setStyles] = useState<Record<string, { name: string; image?: string }>>({});
  const [styleId, setStyleId] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const productTotal = (nextItems: MainCartItem[]) => nextItems.reduce((sum, p) => {
      const product = POD_PRODUCTS.find((x) => x.key === p.id);
      return sum + (product?.priceUsd ?? 0) * p.qty;
    }, 0);

    const sync = () => {
      const state = readState();
      const selected = state.selected ?? {};
      const nextItems = readItems();
      setItems(nextItems);
      setStyleId(selected.style ?? '');
      setTotal(productTotal(nextItems));

      if (!selected.bodyType) return;
      fetch('/api/pricing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyType: selected.bodyType,
          peopleCount: selected.peopleCount ?? 1,
          background: selected.background || 'none',
          express: !!selected.express,
          recording: !!selected.recording,
          productUnits: selected.productUnits ?? {},
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (typeof d?.total === 'number') setTotal(d.total);
        })
        .catch(() => null);
    };

    sync();
    window.addEventListener('main-cart:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('main-cart:update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    fetch('/api/landing-config')
      .then((r) => r.json())
      .then((d) => {
        const next: Record<string, string> = {};
        for (const p of mergePodProducts(d.pod_products)) next[p.key] = p.image || POD_PLACEHOLDER_IMG;
        setImages(next);
      })
      .catch(() => null);

    fetch('/api/styles')
      .then((r) => r.json())
      .then((data: Array<{ slug: string; name: string; image?: string }>) => {
        const next: Record<string, { name: string; image?: string }> = {};
        for (const style of data ?? []) next[style.slug] = { name: style.name, image: style.image };
        setStyles(next);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const count = items.reduce((sum, p) => sum + p.qty, 0);

  const remove = (id: string) => {
    const state = readState();
    const selected = state.selected ?? {};
    if (id === 'portrait') {
      writeState({ ...state, selected: { ...selected, style: '', bodyType: '', background: '', peopleCount: 1, express: false, recording: false } });
    } else {
      const productUnits = { ...(selected.productUnits ?? {}) };
      delete productUnits[id];
      writeState({ ...state, selected: { ...selected, productUnits } });
    }
    setItems(readItems());
  };

  const decrement = (id: string) => {
    if (id === 'portrait') return remove(id);
    const state = readState();
    const selected = state.selected ?? {};
    const productUnits = { ...(selected.productUnits ?? {}) };
    const list = productUnits[id] ?? [];
    if (list.length <= 1) delete productUnits[id];
    else productUnits[id] = list.slice(0, -1);
    writeState({ ...state, selected: { ...selected, productUnits } });
    setItems(readItems());
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="View cart" className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary-lighter text-secondary hover:border-primary focus:outline-none focus:border-primary">
        <ShoppingBag size={19} />
        {count > 0 && <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-primary px-1 text-xs font-black text-white">{count}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="My Cart">
          <button className="absolute inset-0 h-full w-full bg-black/45" aria-label="Close cart" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-sm flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-primary-lighter px-4 py-4">
              <span className="flex items-center gap-2 text-lg font-black tracking-tighter text-secondary">
                <ShoppingBag className="h-5 w-5 text-primary" />
                My Cart
                <span className="text-sm font-bold text-secondary-lighter">({count})</span>
              </span>
              <button type="button" aria-label="Close cart" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-primary-lighter">
                <X className="h-5 w-5 text-secondary" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-10 w-10 text-primary" />
                  <p className="font-black text-secondary">Your cart is empty</p>
                  <button type="button" onClick={() => setOpen(false)} className="mt-4 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white">Keep shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const style = item.id === 'portrait' ? styles[styleId] : null;
                    const image = item.image || style?.image || images[item.id];
                    const name = item.id === 'portrait' ? (style?.name || item.name) : item.name;
                    return (
                      <div key={item.id} className="flex gap-3 rounded-2xl border-2 border-primary-lighter bg-white p-3">
                        {image && <img src={image} alt={name} className="h-16 w-16 rounded-xl object-cover" />}
                        <div className="min-w-0 flex-1">
                          <p className="font-black leading-tight text-secondary">{name}</p>
                          <p className="mt-1 text-xs font-bold text-secondary-lighter">{item.price}</p>
                          <div className="mt-3 flex items-center gap-2">
 claude/ponytail-caveman-mode-76u40v
                            <button type="button" aria-label="Decrease quantity" onClick={() => decrement(item.id)} className="flex h-11 w-11 items-center justify-center rounded-md border border-primary-lighter"><Minus size={14} /></button>
                            <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                            <button type="button" aria-label="Increase quantity" onClick={() => item.id !== 'portrait' && addMainCartItem(item)} disabled={item.id === 'portrait'} className="flex h-11 w-11 items-center justify-center rounded-md border border-primary-lighter disabled:opacity-40"><Plus size={14} /></button>
                            <button type="button" aria-label="Remove item" onClick={() => remove(item.id)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>

                            {/* ponytail: 40px, no 44 — tres botones de 44 no caben en el drawer a 320px */}
                            <button type="button" aria-label="Decrease quantity" onClick={() => decrement(item.id)} className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-lighter"><Minus size={14} /></button>
                            <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                            <button type="button" aria-label="Increase quantity" onClick={() => item.id !== 'portrait' && addMainCartItem(item)} disabled={item.id === 'portrait'} className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-lighter disabled:opacity-40"><Plus size={14} /></button>
                            <button type="button" aria-label="Remove item" onClick={() => remove(item.id)} className="ml-auto flex h-10 w-10 items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
 main
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="space-y-3 border-t border-primary-lighter bg-white px-4 py-4">
                <div className="flex items-center justify-between text-lg font-black">
                  <span className="text-secondary">Total</span>
                  <span className="text-secondary">${total.toFixed(2)}</span>
                </div>
                <Link href="/order" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 py-3.5 font-black text-secondary shadow-md hover:bg-amber-500">
                  <ShieldCheck className="h-5 w-5" />
                  Secure Checkout
                </Link>
                <PaymentLogoStrip methods={PAYMENT_METHODS} />
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
