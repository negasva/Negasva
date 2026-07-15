'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

type MainCartItem = {
  id: string;
  name: string;
  price: string;
  image?: string;
  qty: number;
};

const KEY = 'negasva_main_cart_v1';

function readCart(): MainCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCart(items: MainCartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('main-cart:update'));
}

function amount(price: string) {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}

export function addMainCartItem(item: Omit<MainCartItem, 'qty'>) {
  const items = readCart();
  const next = items.some((p) => p.id === item.id)
    ? items.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p))
    : [...items, { ...item, qty: 1 }];
  writeCart(next);
}

export default function MainCartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MainCartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener('main-cart:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('main-cart:update', sync);
      window.removeEventListener('storage', sync);
    };
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
  const total = useMemo(() => items.reduce((sum, p) => sum + amount(p.price) * p.qty, 0), [items]);
  const save = (next: MainCartItem[]) => {
    writeCart(next);
    setItems(next);
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
                      {item.image && <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-black leading-tight text-secondary">{item.name}</p>
                        <p className="mt-1 font-black text-primary">{item.price}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" aria-label="Decrease quantity" onClick={() => save(item.qty <= 1 ? items.filter((p) => p.id !== item.id) : items.map((p) => p.id === item.id ? { ...p, qty: p.qty - 1 } : p))} className="rounded-md border border-primary-lighter p-1"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                          <button type="button" aria-label="Increase quantity" onClick={() => save(items.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p))} className="rounded-md border border-primary-lighter p-1"><Plus size={14} /></button>
                          <button type="button" aria-label="Remove item" onClick={() => save(items.filter((p) => p.id !== item.id))} className="ml-auto rounded-md p-1 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
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
