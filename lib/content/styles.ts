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
  // ponytail: imágenes placeholder (rm-*.webp) hasta tener samples reales de cada estilo nuevo.
  {
    slug: 'family-guy-style-portrait',
    dbSlug: 'family-guy',
    name: 'Family Guy Style',
    h1: 'Family Guy Style Custom Portrait from Your Photo',
    metaTitle: 'Family Guy Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into a Family Guy style custom portrait: round faces, bold outlines, sitcom humor. Hand-drawn by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: [
      'family guy style portrait',
      'turn photo into family guy style',
      'family guy style drawing from photo',
      'custom cartoon portrait sitcom',
      'family guy style couple portrait',
    ],
    intro:
      'The look of the classic adult animated sitcom: round faces, big chins, bold outlines and flat suburban colors. Perfect for turning yourself, your partner or the whole family into characters from a living-room comedy scene.',
    whatIs: {
      title: 'What is a Family Guy style portrait?',
      body:
        'It is a digital illustration hand-drawn from your photo in the visual language of the famous suburban animated sitcom: rounded heads, prominent chins, simple oval eyes, thick outlines and cozy home or bar backdrops. We adapt each person\'s hairstyle, outfit, glasses and defining features so the likeness lands instantly. Every portrait is drawn from scratch by a real artist — no AI, no filters. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'Great for couples with a sense of humor, groups of friends, family gifts and anyone who grew up with adult animated sitcoms. If Simpsons style feels too classic and Rick and Morty style too chaotic, this sits right in the middle: familiar, funny and instantly readable.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait ready to print',
        '1 to 8 people and pets in the same drawing',
        'Living room, bar, street or fully custom backgrounds',
        'A revision round to adjust small details',
        'Standard delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Upload clear photos, choose how many people, body type and background, and add notes for poses or props. A real illustrator redraws everyone in the rounded sitcom style, keeps the likeness sharp and delivers the file to your inbox within 48 hours.',
    },
    faq: [
      { q: 'Can you draw us on the famous couch?', a: 'Yes. Ask for a living-room scene in your order notes and we will compose a couch scene for your group.' },
      { q: 'Does it work for couples?', a: 'Yes. Couple portraits are one of the most requested uses of this style.' },
    ],
    image: '/backgrounds/rm-6.webp',
    imageAlt: 'Family Guy style custom portrait hand drawn from photo with round faces and bold outlines',
  },
  {
    slug: 'south-park-style-portrait',
    dbSlug: 'south-park',
    name: 'South Park Style',
    h1: 'South Park Style Custom Portrait from Your Photo',
    metaTitle: 'South Park Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Get yourself drawn in South Park style: paper-cutout look, tiny bodies, big heads. Hand-drawn from your photo by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: [
      'south park style portrait',
      'turn photo into south park style',
      'south park style drawing from photo',
      'paper cutout cartoon portrait',
      'south park style group portrait',
    ],
    intro:
      'The iconic paper-cutout look: big round heads, tiny mitten hands, minimal features and snowy mountain-town backdrops. The funniest, most instantly recognizable way to turn a group of friends into cartoon characters.',
    whatIs: {
      title: 'What is a South Park style portrait?',
      body:
        'It is a hand-drawn digital illustration that recreates the flat, construction-paper aesthetic of the famous mountain-town cartoon: oversized heads, simple dot eyes, small rounded bodies and clean flat colors. We match each person\'s hair, beanie, jacket and accessories so everyone is recognizable at a glance. Drawn from scratch by a real artist — no AI. This is a fan-art style tribute; we are not affiliated with the show.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'The go-to style for friend groups, coworkers, gaming squads and irreverent gifts. Because the shapes are so simple, it works brilliantly for large groups and reads perfectly even at sticker or avatar size.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait ready to print',
        '1 to 8 people and pets in the same drawing',
        'Snowy town, school, sofa or fully custom backgrounds',
        'A revision round to adjust small details',
        'Standard delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Send clear photos of each person, pick the background and tell us about outfits, props or poses. The artist rebuilds everyone in the cutout style — hair, clothes and expression included — and delivers the print-ready file within 48 hours.',
    },
    faq: [
      { q: 'Is it good for big groups?', a: 'Yes. The simple shapes make it the best style for groups of 5 to 8 people.' },
      { q: 'Can I use it as an avatar or sticker?', a: 'Yes. The bold simple shapes read perfectly at small sizes.' },
    ],
    image: '/backgrounds/rm-10.webp',
    imageAlt: 'South Park style custom group portrait hand drawn from photo with paper cutout look',
  },
  {
    slug: 'anime-style-portrait',
    dbSlug: 'anime',
    name: 'Anime Style',
    h1: 'Anime Style Custom Portrait from Your Photo',
    metaTitle: 'Anime Portrait from Photo — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into an anime style custom portrait: expressive eyes, dynamic hair, manga-inspired shading. Hand-drawn by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: [
      'anime portrait from photo',
      'anime style portrait',
      'turn photo into anime',
      'custom anime drawing from photo',
      'anime couple portrait commission',
    ],
    intro:
      'A hand-drawn anime portrait with everything the style is loved for: large expressive eyes, dynamic hair, clean linework and soft cel shading. From wholesome slice-of-life vibes to dramatic shonen energy — you pick the mood.',
    whatIs: {
      title: 'What is an anime style portrait?',
      body:
        'It is a custom illustration drawn from your photo in Japanese animation aesthetics: expressive eyes with light reflections, stylized proportions, detailed hair and backgrounds ranging from cherry blossoms to neon city streets. Unlike AI anime filters, every line is drawn by a real artist, so your actual features — not a generic anime face — come through in the final piece.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'Perfect for anime fans, couples, gamer profiles, VTuber-style avatars and gifts for anyone who loves manga. It is also the most flexible style for dramatic or romantic scenes: sunsets, rain, festivals, neon nights.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait ready to print',
        '1 to 8 people and pets in the same drawing',
        'Backgrounds: cherry blossom, city, sunset, festival or custom scene',
        'A revision round to adjust small details',
        'Standard delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Upload clear photos, choose the number of people and the mood — cute, epic or romantic. The artist draws your features into anime proportions while keeping your hairstyle, eye color and signature expression, then delivers the high-resolution file within 48 hours.',
    },
    faq: [
      { q: 'Can you match a specific anime aesthetic?', a: 'Yes. Describe the vibe or reference the general look you want in your order notes and the artist will adapt the shading and linework.' },
      { q: 'Is this made with AI?', a: 'No. Every portrait is 100% hand-drawn by a real artist from scratch.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Anime style custom portrait hand drawn from photo with expressive eyes and cel shading',
  },
  {
    slug: 'disney-pixar-style-portrait',
    dbSlug: 'disney-pixar',
    name: 'Disney-Pixar Style',
    h1: 'Disney-Pixar Style Custom Portrait from Your Photo',
    metaTitle: 'Disney-Pixar Style Custom Portrait — Hand-Drawn in 48h, From $15',
    metaDescription:
      'Turn your photo into a Disney-Pixar style custom portrait: big warm eyes, soft 3D-look shading, storybook charm. Hand-drawn by a real artist, no AI. In 48 hours, from $15.',
    keywords: [
      'disney pixar style portrait',
      'turn photo into disney style',
      'pixar style portrait from photo',
      'disney style family portrait',
      'cartoon movie style portrait',
    ],
    intro:
      'The warm, polished look of modern animated movies: big sparkling eyes, soft rounded features, gentle painterly shading and storybook lighting. The most heartwarming style for family portraits, kids and romantic gifts.',
    whatIs: {
      title: 'What is a Disney-Pixar style portrait?',
      body:
        'It is a hand-drawn digital illustration inspired by the aesthetics of modern animated feature films: expressive oversized eyes, soft volumes that mimic 3D shading, warm color grading and charming, cinematic backdrops. We keep every person\'s real features — freckles, glasses, curls — so the result feels like a frame from a movie starring your family. Drawn by a real artist, no AI. This is a fan-art style tribute; we are not affiliated with any studio.',
    },
    forWho: {
      title: 'Who is it best for?',
      body:
        'The favorite for family portraits, babies and kids, wedding and anniversary gifts, and memorial portraits. If you want the most emotional, universally loved style of the catalog, this is it.',
    },
    includes: {
      title: 'What does your portrait include?',
      items: [
        'High-resolution digital portrait ready to print',
        '1 to 8 people and pets in the same drawing',
        'Castle, sunset, home or fully custom storybook backgrounds',
        'A revision round to adjust small details',
        'Standard delivery in 48 hours, or express in 24h',
      ],
    },
    process: {
      title: 'How is it made?',
      body:
        'Upload clear photos of everyone, choose torso or full body and pick a backdrop. The artist sculpts each face into soft movie-style volumes while keeping the real likeness, then paints lighting and color and delivers the final file within 48 hours.',
    },
    faq: [
      { q: 'Does it work for babies and kids?', a: 'Yes. The soft rounded features of this style are especially flattering for children.' },
      { q: 'Is it a good anniversary or wedding gift?', a: 'Yes. It is our most requested style for romantic and family milestone gifts.' },
    ],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Disney-Pixar style custom family portrait hand drawn from photo with big warm eyes and soft shading',
  },
];

export function getStyleBySlug(slug: string): StyleContent | undefined {
  return STYLES_CONTENT.find((s) => s.slug === slug);
}

export const DB_SLUG_TO_URL: Record<string, string> = Object.fromEntries(
  STYLES_CONTENT.map((s) => [s.dbSlug, s.slug]),
);
