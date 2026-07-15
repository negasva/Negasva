'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { POD_PRODUCTS, defaultProductOptions } from '@/lib/pricing/products';
import { mergePodProducts, POD_PLACEHOLDER_IMG } from '@/lib/content/podProducts';

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
      price: selected.bodyType ? `${selected.peopleCount ?? 1} portrait` : 'Style selected',
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

  useEffect(() => {
    const sync = () => setItems(readItems());
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
  const total = useMemo(() => items.reduce((sum, p) => {
    const product = POD_PRODUCTS.find((x) => x.key === p.id);
    return sum + (product?.priceUsd ?? 0) * p.qty;
  }, 0), [items]);
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

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="View cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-lighter text-secondary hover:border-primary focus:outline-none focus:border-primary">
        <ShoppingBag size={19} />
        {count > 0 && <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-primary px-1 text-xs font-black text-white">{count}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="My Cart">
          <button className="absolute inset-0 h-full w-full bg-black/45" aria-label="Close cart" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[92vw] max-w-[460px] flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-primary-lighter px-5 py-4">
              <div>
                <p className="font-black text-2xl text-secondary">My Cart</p>
                <p className="text-sm font-bold text-secondary-lighter">{count} items</p>
              </div>
              <button type="button" aria-label="Close cart" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-primary-lighter">
                <X size={22} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-10 w-10 text-primary" />
                  <p className="font-black text-secondary">Your cart is empty</p>
                  <button type="button" onClick={() => setOpen(false)} className="mt-4 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white">Keep shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-primary-lighter p-3">
                      {(item.image || images[item.id]) && <img src={item.image || images[item.id]} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-black leading-tight text-secondary">{item.name}</p>
                        <p className="mt-1 font-black text-primary">{item.price}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" aria-label="Decrease quantity" onClick={() => remove(item.id)} className="rounded-md border border-primary-lighter p-1"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                          <button type="button" aria-label="Increase quantity" onClick={() => item.id !== 'portrait' && addMainCartItem(item)} disabled={item.id === 'portrait'} className="rounded-md border border-primary-lighter p-1 disabled:opacity-40"><Plus size={14} /></button>
                          <button type="button" aria-label="Remove item" onClick={() => remove(item.id)} className="ml-auto rounded-md p-1 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-primary-lighter bg-white p-5">
                <div className="mb-4 flex items-center justify-between font-black">
                  <span className="text-secondary">Total</span>
                  <span className="text-xl text-primary">${total.toFixed(2)}</span>
                </div>
                <Link href="/order" onClick={() => setOpen(false)} className="block rounded-xl bg-secondary py-4 text-center font-black text-white hover:bg-secondary-light">Secure Checkout</Link>
                <p className="mt-3 text-center text-xs font-bold text-secondary-lighter">Visa · Mastercard · PayPal</p>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
