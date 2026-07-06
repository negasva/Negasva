import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cartoon Portrait Styles — Simpsons, Family Guy, Anime & More',
  description: 'Pick from 8 custom cartoon portrait styles: Simpsons, Rick and Morty, Family Guy, South Park, anime, Disney-Pixar, Gravity Falls or Fairly OddParents. Hand-drawn, no AI, from $15 USD.',
  alternates: { canonical: '/styles' },
  openGraph: {
    title: 'Cartoon Portrait Styles — Negasva',
    description: 'Choose a style for your custom cartoon portrait and get your hand-drawn digital illustration in 48h.',
  },
};

export default function StylesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
