'use client';

import { addMainCartItem } from '@/components/MainCartDrawer';

type Props = {
  id: string;
  name: string;
  price: string;
  image?: string;
};

export default function MainCartAddButton({ id, name, price, image }: Props) {
  return (
    <button
      type="button"
      aria-label={`Add ${name} to cart`}
      onClick={() => addMainCartItem({ id, name, price, image })}
      className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary font-black hover:bg-primary hover:text-white transition-colors"
    >
      +
    </button>
  );
}
