import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cartoon Portrait Styles — Simpsons, Family Guy, Anime & More',
  description: 'Pick from 13 custom cartoon portrait styles: Simpsons, Rick and Morty, Family Guy, South Park, Futurama, Bob\'s Burgers, American Dad, King of the Hill, anime, Studio Ghibli, Disney-Pixar and more. Hand-drawn, no AI, from $15 USD.',
  alternates: { canonical: '/styles' },
  openGraph: {
    title: 'Cartoon Portrait Styles — Negasva',
    description: 'Choose a style for your custom cartoon portrait and get your hand-drawn digital illustration in 48h.',
  },
};

export default function StylesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
