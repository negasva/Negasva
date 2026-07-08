export interface PrintProduct {
  name: string;
  price: string;
  image: string;
}

export const PRINT_PRODUCTS: PrintProduct[] = [
  { name: 'Mug', price: '$10', image: '/backgrounds/rm-1.webp' },
  { name: 'T-shirt', price: '$13', image: '/backgrounds/rm-3.webp' },
  { name: 'Hoodie', price: '$41', image: '/backgrounds/rm-4.webp' },
  { name: 'Canvas', price: '$23', image: '/backgrounds/rm-5.webp' },
  { name: 'Framed poster', price: '$27', image: '/backgrounds/rm-6.webp' },
  { name: 'Phone case', price: '$22', image: '/backgrounds/rm-10.webp' },
];
