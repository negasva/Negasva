// SEO copy for each portrait style. Slugs are keyword-exact EN; old ES slugs
// 301 to these in next.config.js. Legal: always "X style", never "official"
// or anything implying a license.

export interface StyleContent {
  slug: string;
  dbSlug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string;
  whatIs: { title: string; body: string };
  forWho: { title: string; body: string };
  includes: { title: string; items: string[] };
  process: { title: string; body: string };
  faq: Array<{ q: string; a: string }>;
  image: string;
  imageAlt: string;
}

export const STYLES_CONTENT: StyleContent[] = [
  {
    slug: 'rick-and-morty-style-portrait',
    dbSlug: 'rick-morty',
    name: 'Rick and Morty Style',
    h1: 'Rick and Morty Style Custom Portrait from Your Photo',
    metaTitle: 'Rick and Morty Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into a Rick and Morty style custom portrait — hand-drawn by a real artist, no AI. Sci-fi backgrounds, couples and groups. Delivered in 48 hours, from $15.',
    keywords: [
      'rick and morty custom portrait',
      'rick and morty style portrait',
      'turn photo into rick and morty style',
      'custom cartoon portrait sci-fi',
      'rick and morty style drawing from photo',
    ],
    intro:
      'A custom portrait style bursting with chaotic energy, visual humor and sci-fi adventure. Big eyes, exaggerated expressions, jittery linework and backgrounds packed with portals, labs, planets and interdimensional scenes — your photo redrawn as a character from an adult animated sci-fi universe.',
    whatIs: {
      title: 'What is a Rick and Morty style portrait?',
      body:
        'It is a digital illustration hand-drawn from your photo in the visual language of the famous sci-fi cartoon: thin outlines, tiny pupils, intense expressions, acid color palettes and interdimensional backdrops. Every portrait is drawn from scratch by a real artist — no AI, no templates, no generic filters — so the result is funny, instantly recognizable and full of personality. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'Perfect for couples, best friends, gamer avatars, funny gifts and any portrait that calls for a wild background. If you want a custom cartoon portrait with attitude, energy and a dose of visual chaos, this style is usually the winner.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait ready to print',
        '1 to 8 people and pets in the same drawing',
        'Sci-fi backgrounds: portal, lab, space, ship or planet',
        'A revision round to adjust small details',
        'Standard delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Upload clear photos, choose how many people, body type and background, then tell us the details — pose, clothes, accessories, pets. A real illustrator draws your portrait from scratch, keeping the likeness sharp and the style consistent, and delivers it to your inbox within 48 hours.',
    },
    faq: [
      { q: 'Can I get a portal or space scene background?', a: 'Yes. Choose a portal, lab, spaceship, planet or describe a fully custom scene.' },
      { q: 'Is it a good couples or friends gift?', a: 'Yes. It is one of our strongest styles for funny gifts, casual anniversaries and friend groups.' },
    ],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Rick and Morty style custom portrait hand drawn from photo with green portal background',
  },
  {
    slug: 'simpsons-style-portrait',
    dbSlug: 'simpsons',
    name: 'Simpsons Style',
    h1: 'Simpsons Style Custom Portrait from Your Photo',
    metaTitle: 'Simpsons Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Get yourself drawn in Simpsons style: yellow skin, clean outlines, family-friendly humor. Hand-drawn from your photo by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: [
      'simpsons style portrait',
      'turn photo into simpsons style',
      'simpsons style family portrait',
      'yellow cartoon portrait from photo',
      'custom simpsons style drawing',
    ],
    intro:
      'The most recognizable cartoon look in the world: yellow skin, round eyes, bold outlines and flat colors. Perfect for turning a family photo into a warm, funny, instantly readable custom portrait that everyone gets at first glance.',
    whatIs: {
      title: 'What is a Simpsons style portrait?',
      body:
        'It is a hand-drawn digital illustration where your family, couple, pet or group appears in the aesthetic of the classic yellow animated sitcom: simple silhouettes, clear expressions, yellow skin and home or city backdrops. We adapt each person\'s hairstyle, clothes, glasses and defining features so everyone is unmistakably themselves. Drawn from scratch by a real artist — no AI. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'The safest pick for family gifts, parents, grandparents, anniversaries and big groups. It reads instantly, prints beautifully and tends to hit hard emotionally because it turns everyone into part of a shared scene.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital illustration',
        '1 to 8 people and pets',
        'Living room, house, street or fully custom family scene',
        'A revision round for likeness details',
        'Delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Send your photos, pick torso or full body, number of people and background. Want a special family composition? Add it in the notes. We draw each character with recognizable features and deliver the digital file ready to print or share.',
    },
    faq: [
      { q: 'Can you draw a full family portrait?', a: 'Yes. We can draw up to 8 people plus pets in a single scene.' },
      { q: 'Is it a good gift for parents or grandparents?', a: 'Yes. It is one of the clearest, most instantly recognizable styles for family gifts.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Simpsons style custom family portrait hand drawn from photo with yellow skin and clean outlines',
  },
  {
    slug: 'gravity-falls-style-portrait',
    dbSlug: 'gravity-falls',
    name: 'Gravity Falls Style',
    h1: 'Gravity Falls Style Custom Portrait from Your Photo',
    metaTitle: 'Gravity Falls Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into a Gravity Falls style custom portrait: big eyes, warm colors, cozy mystery vibes. Hand-drawn by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: [
      'gravity falls style portrait',
      'turn photo into gravity falls style',
      'cute cartoon portrait from photo',
      'custom cartoon avatar portrait',
      'gravity falls style drawing',
    ],
    intro:
      'A sweet, expressive, adventure-flavored style: big eyes, soft proportions, forest color palettes and a light air of mystery. The right choice when you want a custom cartoon portrait with charm, detail and a warmer feel.',
    whatIs: {
      title: 'What is a Gravity Falls style portrait?',
      body:
        'It is a custom caricature hand-drawn from your photo with large expressive features, warm palettes, simplified clothing and natural backdrops like a forest, cabin, lake or starry night. The result feels cozy, youthful and works brilliantly as an avatar or an emotional gift. Drawn entirely by a real artist — no AI. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'Ideal for siblings, best friends, sweet couples, kids, pets and social media profiles. If you want something less sarcastic and more heartfelt, this style balances adventure, tenderness and personality.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait',
        'People and pets in an expressive cartoon style',
        'Forest, cabin, lake or fully custom scene backgrounds',
        'A revision round for small details',
        'Delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Upload your photos and tell us the vibe you want: adventure, friendship, couple, family or avatar. The illustrator translates your features into big eyes and soft shapes while keeping your hairstyle, clothes and signature expression.',
    },
    faq: [
      { q: 'Does it work as a profile picture?', a: 'Yes. The big eyes and clean shapes read perfectly at small sizes.' },
      { q: 'Can I get a forest or cabin background?', a: 'Yes. Pick a natural backdrop or describe a fully custom scene.' },
    ],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Gravity Falls style custom portrait hand drawn from photo with big eyes and warm forest colors',
  },
  {
    slug: 'fairly-oddparents-style-portrait',
    dbSlug: 'fairly-odd',
    name: 'Fairly OddParents Style',
    h1: 'Fairly OddParents Style Custom Portrait from Your Photo',
    metaTitle: 'Fairly OddParents Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into a Fairly OddParents style custom portrait: geometric shapes, electric colors, magic details. Hand-drawn by a real artist, no AI. In 48 hours, from $15.',
    keywords: [
      'fairly oddparents style portrait',
      'turn photo into fairly oddparents style',
      'colorful cartoon portrait from photo',
      'custom cartoon portrait gift',
      'magic cartoon portrait',
    ],
    intro:
      'A colorful, geometric, high-energy style: angular silhouettes, vivid flat colors, huge expressions and magical touches like crowns, sparkles, wands and fantasy backdrops. Perfect when you want a portrait that looks joyful from across the room.',
    whatIs: {
      title: 'What is a Fairly OddParents style portrait?',
      body:
        'It is a hand-drawn digital illustration with simple shapes, clean lines, electric colors and a magical-comedy feel. We turn your photo into an expressive character, adding accessories and a custom scene if you want the result more romantic, funnier or wildly exaggerated. Drawn from scratch by a real artist — no AI. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'Great for couples, friends, birthday gifts, eye-catching profiles and anyone who wants a less serious portrait. It is the most color-charged style of the four, with a nostalgic energy that pops on any wall.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital illustration',
        '1 to 8 people and pets',
        'Bright, magical or fully custom backgrounds',
        'Accessories like crowns, sparkles and wands on request',
        'Delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Pick the style, upload clear photos and write down your scene ideas. We can add exaggerated hair colors, accessories, special objects or a couples composition. Then we hand-draw everything and deliver the final high-resolution file.',
    },
    faq: [
      { q: 'Can I ask for crowns, sparkles or wands?', a: 'Yes. Request magic details or special accessories in your order notes.' },
      { q: 'Does it print well?', a: 'Yes. Its flat colors and high contrast look great on posters, frames and canvas.' },
    ],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Fairly OddParents style custom portrait hand drawn from photo with electric colors and geometric shapes',
  },
];

export function getStyleBySlug(slug: string): StyleContent | undefined {
  return STYLES_CONTENT.find((s) => s.slug === slug);
}

export const DB_SLUG_TO_URL: Record<string, string> = Object.fromEntries(
  STYLES_CONTENT.map((s) => [s.dbSlug, s.slug]),
);
