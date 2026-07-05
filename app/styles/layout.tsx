import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cartoon Portrait Styles — Simpsons, Rick and Morty & More',
  description: 'Pick your custom cartoon portrait style: Rick and Morty style, Simpsons style, Gravity Falls style or Fairly OddParents style. Hand-drawn, no AI, from $15 USD.',
  alternates: { canonical: '/styles' },
  openGraph: {
    title: 'Cartoon Portrait Styles — Negasva',
    description: 'Choose a style for your custom cartoon portrait and get your hand-drawn digital illustration in 48h.',
  },
};

export default function StylesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
