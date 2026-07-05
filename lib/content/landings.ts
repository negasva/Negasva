// SEO landing pages by subject, occasion and angle. Rendered by
// components/SeoLanding.tsx. Same discipline as styles.ts: EN keyword-first,
// "X style" wording, never "official".

export interface LandingContent {
  /** URL path, e.g. '/custom-couple-portrait' or '/gifts/christmas'. */
  path: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  bullets: { title: string; items: string[] };
  faq: Array<{ q: string; a: string }>;
  image: string;
  imageAlt: string;
  /** Style slugs from lib/content/styles.ts to link to. */
  relatedStyles: string[];
  /** Other landing paths to cross-link. */
  relatedLandings: string[];
}

export const LANDINGS: LandingContent[] = [
  // ── By subject ──────────────────────────────────────────────────────────
  {
    path: '/custom-couple-portrait',
    metaTitle: 'Custom Couple Portrait from Photo — Hand-Drawn, No AI • 48h • From $15',
    metaDescription:
      'Turn a photo of you two into a custom couple portrait, hand-drawn by a real artist in the cartoon style you love — no AI. Delivered in 48 hours, from $15.',
    keywords: ['custom couple portrait', 'couple cartoon portrait', 'couple portrait from photo', 'anniversary portrait gift', 'custom couple drawing'],
    h1: 'Custom Couple Portrait, Hand-Drawn from Your Photo',
    intro:
      'A custom couple portrait is the gift that never misses: your favorite photo of the two of you, redrawn by a real artist in a cartoon style you both love. No AI filters, no templates — just the two of you, stroke by stroke, delivered in 48 hours from $15.',
    sections: [
      {
        title: 'Why a hand-drawn couple portrait beats any filter',
        body:
          'Apps and AI filters give everyone the same generic face. A hand-drawn custom couple portrait keeps what makes you two recognizable: her exact curls, his crooked smile, the matching hoodies, even your dog squeezed between you. Our artist studies your photo and rebuilds every detail by hand, so the final piece looks unmistakably like you — not like a stock cartoon couple.',
      },
      {
        title: 'Pick the style that fits your story',
        body:
          'Choose Simpsons style for a classic sitcom-couch vibe, Rick and Morty style if your relationship runs on chaotic humor, anime style for something romantic and cinematic, or Disney-Pixar style for full storybook energy. Every style works for couples, and you can add a custom background: where you met, your city skyline, a favorite trip.',
      },
      {
        title: 'From photo to framed gift in 48 hours',
        body:
          'Upload one clear photo of each of you (or one together), pick torso or full body and tell us the scene you want. The portrait arrives in your inbox within 48 hours as a high-resolution file, ready to print, frame or put on a mug or canvas. Need it faster? Express delivery gets it to you in 24 hours.',
      },
    ],
    bullets: {
      title: 'What your couple portrait includes',
      items: [
        'Both of you (plus pets) hand-drawn in one scene',
        'Any of our 8 cartoon styles',
        'Custom background: your city, your trip, your couch',
        'High-resolution file ready to print or gift digitally',
        'A revision round + delivery in 48 hours',
      ],
    },
    faq: [
      { q: 'Can we use two separate photos?', a: 'Yes. Send one clear photo per person and we compose you together in a single scene.' },
      { q: 'Can you include our pet?', a: 'Yes. Pets can join the portrait in the same style — just add their photo.' },
    ],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Custom couple portrait hand drawn from photo in cartoon style',
    relatedStyles: ['simpsons-style-portrait', 'anime-style-portrait', 'disney-pixar-style-portrait'],
    relatedLandings: ['/gifts/anniversary', '/gifts/valentines-day', '/custom-family-portrait'],
  },
  {
    path: '/custom-family-portrait',
    metaTitle: 'Custom Family Portrait from Photo — Hand-Drawn, No AI • 48h • From $15',
    metaDescription:
      'Turn a family photo into a custom cartoon family portrait — up to 8 people and pets, hand-drawn by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: ['custom family portrait', 'family cartoon portrait', 'family portrait from photo', 'personalized family gift', 'cartoon family drawing'],
    h1: 'Custom Family Portrait, Hand-Drawn from Your Photo',
    intro:
      'Getting the whole family to pose for one good photo is hard enough — let alone one worth framing. A custom family portrait fixes that: we take your photos (even separate ones) and hand-draw everyone into a single cartoon scene, up to 8 people and pets, in 48 hours from $15.',
    sections: [
      {
        title: 'Every family member, unmistakably themselves',
        body:
          'Grandma\'s glasses, your brother\'s beard, the baby\'s cowlick, the cat that hates everyone — a real artist draws each family member with their defining features intact. That is the difference between a hand-drawn family portrait and an AI mashup: everyone in the picture is recognizably, lovably themselves.',
      },
      {
        title: 'One portrait from many photos',
        body:
          'No need for a group photo. Send individual pictures of each person — even relatives who live far away or loved ones from older photos — and we compose everyone together in one scene: the family couch, your kitchen, a holiday backdrop or anywhere you dream up. It is the only way to get four generations into a single portrait.',
      },
      {
        title: 'The gift that works for every occasion',
        body:
          'Family portraits are our most-gifted product: anniversaries, Christmas, Mother\'s Day, grandparents\' birthdays, housewarmings. Simpsons style is the crowd favorite for families, Disney-Pixar style wins for young kids, and South Park style is the fun pick for big groups. Printed on canvas or framed, it becomes the piece everyone points at in the living room.',
      },
    ],
    bullets: {
      title: 'What your family portrait includes',
      items: [
        'Up to 8 people and pets in one hand-drawn scene',
        'Compose from separate photos — no group shot needed',
        'Any of our 8 cartoon styles',
        'Custom background: home, holidays or fantasy',
        'High-resolution file + revision, delivered in 48 hours',
      ],
    },
    faq: [
      { q: 'How many people can you draw?', a: 'Up to 8 people plus pets in a single scene. For bigger families, contact us and we will work it out.' },
      { q: 'Can you include a relative from an old photo?', a: 'Yes. As long as the photo shows their face clearly, we can draw them into the family scene.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Custom cartoon family portrait hand drawn from photos with parents kids and pets',
    relatedStyles: ['simpsons-style-portrait', 'disney-pixar-style-portrait', 'south-park-style-portrait'],
    relatedLandings: ['/gifts/christmas', '/custom-pet-portrait', '/memorial-portrait'],
  },
  {
    path: '/custom-pet-portrait',
    metaTitle: 'Custom Pet Portrait from Photo — Hand-Drawn Cartoon, No AI • 48h • From $15',
    metaDescription:
      'Turn your dog, cat or any pet into a hand-drawn cartoon portrait — drawn by a real artist from your photo, no AI. Delivered in 48 hours, from $15.',
    keywords: ['custom pet portrait', 'pet cartoon portrait', 'dog portrait from photo', 'cat cartoon portrait', 'pet portrait gift'],
    h1: 'Custom Pet Portrait, Hand-Drawn from Your Photo',
    intro:
      'Your pet already acts like a cartoon character — we just make it obvious. Send a photo of your dog, cat, bunny or bearded dragon and a real artist will hand-draw them as a cartoon star, solo or by your side, in 48 hours from $15.',
    sections: [
      {
        title: 'Drawn by hand, down to the last whisker',
        body:
          'The patch over one eye, the ear that never stands up, the judgmental stare — a real artist captures the exact markings and personality that make your pet yours. AI pet generators average your pet into a generic breed; we draw the individual animal, which is why pet parents can tell the difference instantly.',
      },
      {
        title: 'Solo star or part of the family',
        body:
          'Order a portrait of your pet alone — great for memorial pieces and pet-lover gifts — or add them to a couple or family portrait in the same style. Rick and Morty style gives pets hilarious sci-fi energy, Simpsons style makes them part of the yellow family, and Disney-Pixar style turns them into a movie protagonist.',
      },
      {
        title: 'A gift pet lovers actually keep',
        body:
          'Pet portraits are the safest gift in the world: nobody has ever been unhappy to receive a cartoon of their dog. Printed on canvas, a mug or a t-shirt, it beats another leash or treat jar every time. And for pets who have passed, a hand-drawn portrait from an old photo is a keepsake that AI cannot replicate with respect.',
      },
    ],
    bullets: {
      title: 'What your pet portrait includes',
      items: [
        'Any animal, hand-drawn from your photo',
        'Solo portrait or together with the humans',
        'Any of our 8 cartoon styles',
        'Custom background: park, home, space, anywhere',
        'High-resolution file + revision, delivered in 48 hours',
      ],
    },
    faq: [
      { q: 'What photo works best?', a: 'A sharp photo at your pet\'s eye level with visible markings. Phone photos are perfectly fine.' },
      { q: 'Can you draw a pet who passed away?', a: 'Yes. We regularly draw memorial pet portraits from older photos — see our memorial portraits page.' },
    ],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Custom pet portrait hand drawn from photo in cartoon style with dog and cat',
    relatedStyles: ['rick-and-morty-style-portrait', 'simpsons-style-portrait', 'disney-pixar-style-portrait'],
    relatedLandings: ['/memorial-portrait', '/custom-family-portrait', '/gifts/birthday'],
  },
  {
    path: '/memorial-portrait',
    metaTitle: 'Memorial Portrait from Photo — Hand-Drawn with Care, No AI • From $15',
    metaDescription:
      'A hand-drawn memorial portrait from a photo of your loved one or pet — drawn with care by a real artist, never AI. A keepsake to hold onto, from $15.',
    keywords: ['memorial portrait from photo', 'memorial drawing of loved one', 'pet memorial portrait', 'remembrance portrait gift', 'hand drawn memorial art'],
    h1: 'Memorial Portrait, Hand-Drawn from a Photo',
    intro:
      'Some portraits matter more than others. A memorial portrait turns a treasured photo of a loved one — a parent, a grandparent, a pet — into a hand-drawn keepsake, created with care by a real artist. Because for something this personal, feeding a photo to an AI is not an option.',
    sections: [
      {
        title: 'Drawn by human hands, with the respect it deserves',
        body:
          'Every memorial portrait is drawn from scratch by an artist who studies the photo, the expression and the details that made that person or pet who they were. We work from old, faded or low-quality photos too — restoring warmth that a scanner cannot. The result is not a filtered image; it is a piece of art made slowly, deliberately, for remembrance.',
      },
      {
        title: 'Together again in one portrait',
        body:
          'The most requested memorial piece: drawing someone who passed into a present-day family scene. A grandmother joining her grandchildren\'s portrait, a dog back at his spot on the couch, parents reunited in a single frame from two separate photos. Hand-drawing makes it possible to compose people from different photos and eras into one natural scene.',
      },
      {
        title: 'A gift for grief that actually helps',
        body:
          'A memorial portrait is one of the few sympathy gifts that people keep forever. Choose a gentle style — Disney-Pixar style and anime style carry the most warmth — or a faithful cartoon likeness with a background that meant something: their garden, their kitchen, their favorite bench. Delivered as a high-resolution file, ready to print and frame.',
      },
    ],
    bullets: {
      title: 'What your memorial portrait includes',
      items: [
        'Hand-drawn from any photo, including old or damaged ones',
        'Compose loved ones from different photos into one scene',
        'Gentle, warm styles suited to remembrance',
        'A meaningful custom background',
        'High-resolution file + careful revision round',
      ],
    },
    faq: [
      { q: 'The only photo I have is blurry. Can you work with it?', a: 'Usually yes. Send what you have — the artist will tell you honestly what can be drawn from it before you pay.' },
      { q: 'Can you draw someone who passed together with the family?', a: 'Yes. We compose them into the family scene from a separate photo, naturally and respectfully.' },
    ],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Hand drawn memorial portrait from photo of loved one in warm cartoon style',
    relatedStyles: ['disney-pixar-style-portrait', 'anime-style-portrait', 'simpsons-style-portrait'],
    relatedLandings: ['/custom-family-portrait', '/custom-pet-portrait', '/hand-drawn-no-ai'],
  },
  // ── By occasion ─────────────────────────────────────────────────────────
  {
    path: '/gifts/christmas',
    metaTitle: 'Custom Cartoon Portrait Christmas Gift — Hand-Drawn in 48h, From $15',
    metaDescription:
      'The Christmas gift they will actually keep: a custom cartoon portrait hand-drawn from their photo, no AI. Ready in 48 hours — even for last-minute gifting. From $15.',
    keywords: ['cartoon portrait christmas gift', 'personalized christmas gift portrait', 'custom family portrait christmas', 'last minute christmas gift personalized', 'christmas gift for parents'],
    h1: 'Custom Cartoon Portrait: the Christmas Gift They Will Keep',
    intro:
      'Every Christmas has one gift everyone gathers around — make it yours. A custom cartoon portrait of the family, the couple or the dog, hand-drawn from a photo and delivered in 48 hours, from $15. Yes, that includes the week before Christmas.',
    sections: [
      {
        title: 'The 48-hour Christmas miracle',
        body:
          'Most custom portrait shops need a week just to send a preview — useless on December 20th. We deliver the finished, hand-drawn portrait within 48 hours (24h express if you are really cutting it close), as a high-resolution file you can print at any local shop, frame, or gift digitally with a printed card. Last-minute has never looked this thoughtful.',
      },
      {
        title: 'One portrait, the whole family in it',
        body:
          'A Christmas family portrait in Simpsons style — everyone in holiday sweaters on the couch — is our December bestseller. Up to 8 people plus pets, composed from separate photos, with a snowy or fireplace background. It solves the impossible: one gift that works for parents, grandparents and siblings at once.',
      },
      {
        title: 'Not another AI gadget under the tree',
        body:
          'AI-generated portraits are the new socks: cheap, generic, forgotten by January. A hand-drawn portrait is the opposite — a real artist spent hours on their faces, and it shows. It is the difference between a present and a keepsake that hangs on the wall until next Christmas.',
      },
    ],
    bullets: {
      title: 'Why it works as a Christmas gift',
      items: [
        'Finished portrait in 48h — safe even in late December',
        'Family scenes with holiday backgrounds',
        'Digital delivery: no shipping deadlines to miss',
        'Printable on canvas, mugs or t-shirts',
        'From $15 — thoughtful without breaking the budget',
      ],
    },
    faq: [
      { q: 'Can I still get it before Christmas if I order on the 22nd?', a: 'With 24h express delivery, yes. The file arrives by email ready to print locally or gift digitally.' },
      { q: 'Can you add Santa hats and snow?', a: 'Yes. Ask for holiday details in your order notes — hats, sweaters, snow, fireplace, tree.' },
    ],
    image: '/backgrounds/rm-6.webp',
    imageAlt: 'Custom cartoon family portrait christmas gift hand drawn from photo with holiday background',
    relatedStyles: ['simpsons-style-portrait', 'disney-pixar-style-portrait', 'family-guy-style-portrait'],
    relatedLandings: ['/custom-family-portrait', '/gifts/birthday', '/gifts/anniversary'],
  },
  {
    path: '/gifts/anniversary',
    metaTitle: 'Anniversary Portrait Gift — Custom & Hand-Drawn in 48h, From $15',
    metaDescription:
      'An anniversary gift with actual thought in it: your couple photo hand-drawn as a custom cartoon portrait by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: ['anniversary portrait gift', 'custom anniversary gift for couple', 'couple portrait anniversary', 'personalized anniversary gift', 'first anniversary paper gift portrait'],
    h1: 'Anniversary Portrait: a Custom Gift That Shows You Tried',
    intro:
      'Anniversaries punish lazy gifts. A custom anniversary portrait — the two of you, hand-drawn from your favorite photo in a style you both love — is the opposite of lazy: personal, permanent and impossible to re-gift. Delivered in 48 hours, from $15.',
    sections: [
      {
        title: 'Recreate your story, scene by scene',
        body:
          'The best anniversary portraits tell a story: the restaurant where you met, the city of your honeymoon, the exact pose from your wedding photo — redrawn in Simpsons style, anime style or Disney-Pixar style. Add the date, your song lyric or an inside joke written into the scene. A real artist composes it all by hand from your photos and notes.',
      },
      {
        title: 'Paper anniversary? Portrait anniversary.',
        body:
          'The first anniversary is traditionally paper — which makes a printed portrait the smartest interpretation of the tradition. For year five (wood), print it on a wooden frame; for year ten (tin), a metal print. One gift concept that upgrades itself every single year, and never turns into another dusty photo frame.',
      },
      {
        title: 'Forgot until this week? You are fine.',
        body:
          'Standard delivery is 48 hours and express is 24. Order Monday, gift Wednesday. The portrait arrives as a high-resolution file: print it at any shop, frame it same-day, or reveal it on a tablet at dinner and print later. Panic, meet plan.',
      },
    ],
    bullets: {
      title: 'Why it works as an anniversary gift',
      items: [
        'Your real story: place, pose and details drawn in',
        'Works for year 1 or year 40',
        'Both of you plus pets, any of our 8 styles',
        '48h standard, 24h express delivery',
        'High-resolution file ready to print and frame',
      ],
    },
    faq: [
      { q: 'Can you recreate our wedding photo as a cartoon?', a: 'Yes. Wedding-photo recreations are one of the most popular anniversary orders.' },
      { q: 'Can you write our date or song into the portrait?', a: 'Yes. Add it in the order notes and the artist will work it into the scene.' },
    ],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Custom anniversary couple portrait hand drawn from photo in cartoon style',
    relatedStyles: ['anime-style-portrait', 'disney-pixar-style-portrait', 'simpsons-style-portrait'],
    relatedLandings: ['/custom-couple-portrait', '/gifts/valentines-day', '/gifts/christmas'],
  },
  {
    path: '/gifts/valentines-day',
    metaTitle: "Valentine's Day Custom Portrait — Hand-Drawn in 48h, From $15",
    metaDescription:
      "Skip the flowers that die in a week. A Valentine's Day custom portrait of you two, hand-drawn from your photo by a real artist, no AI. Ready in 48 hours, from $15.",
    keywords: ['valentines day custom portrait', 'valentines gift for boyfriend', 'valentines gift for girlfriend', 'couple portrait valentines day', 'personalized valentines gift'],
    h1: "Valentine's Day Custom Portrait, Hand-Drawn from Your Photo",
    intro:
      "Flowers wilt, chocolate disappears, and stuffed bears end up in a closet. A Valentine's custom portrait — you two, hand-drawn in your favorite cartoon style — hangs on the wall all year and gets better with time. From $15, delivered in 48 hours.",
    sections: [
      {
        title: 'Romantic, funny or both — you set the tone',
        body:
          "Anime style under cherry blossoms for maximum romance. Rick and Morty style for couples whose love language is roasting each other. Disney-Pixar style if you want them to actually tear up. The same photo becomes a completely different Valentine depending on the style — that choice is what makes the gift feel personally yours.",
      },
      {
        title: 'For new couples and old ones alike',
        body:
          "Three months in and terrified of over-gifting? A $15 cartoon of your first date is sweet without being intense. Fifteen years in and out of ideas? A full-body portrait recreating the day you met, with the kids and the dog drawn small in the corner, is the Valentine nobody else will think of.",
      },
      {
        title: 'Ordered on the 12th, gifted on the 14th',
        body:
          "Valentine's Day is the most last-minute gifting day of the year, and we are built for it: 48-hour standard delivery, 24-hour express. The portrait lands in your inbox as a high-resolution file — print and frame it locally, set it as their phone wallpaper, or reveal it at dinner straight from your phone.",
      },
    ],
    bullets: {
      title: "Why it wins Valentine's Day",
      items: [
        'More personal than flowers, longer-lasting than chocolate',
        'Romantic or funny — 8 styles to set the tone',
        'From $15: big gesture, small budget',
        '48h standard / 24h express — last-minute proof',
        'Digital file: frame it, wallpaper it, mug it',
      ],
    },
    faq: [
      { q: "We just started dating. Is a portrait too much?", a: 'A small torso portrait in a funny style reads as thoughtful, not intense. Save the romantic full-body scene for later years.' },
      { q: 'Can it arrive by February 14 if I order on the 12th?', a: 'Yes — choose 24h express and the file arrives in time to print or gift digitally.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: "Valentine's day custom couple portrait hand drawn from photo in romantic cartoon style",
    relatedStyles: ['anime-style-portrait', 'rick-and-morty-style-portrait', 'disney-pixar-style-portrait'],
    relatedLandings: ['/custom-couple-portrait', '/gifts/anniversary', '/gifts/birthday'],
  },
  {
    path: '/gifts/birthday',
    metaTitle: 'Custom Birthday Portrait Gift — Hand-Drawn in 48h, From $15',
    metaDescription:
      'A birthday gift they have never gotten before: themselves as a cartoon character, hand-drawn from a photo by a real artist, no AI. Delivered in 48 hours, from $15.',
    keywords: ['custom birthday portrait', 'personalized birthday gift portrait', 'cartoon portrait birthday gift', 'birthday gift for him personalized', 'birthday gift for her personalized'],
    h1: 'Custom Birthday Portrait: Turn Them into a Cartoon Character',
    intro:
      'The hardest people to shop for already own everything — except a portrait of themselves as a cartoon character. A custom birthday portrait is hand-drawn from their photo in the style that fits their personality, delivered in 48 hours, from $15.',
    sections: [
      {
        title: 'Match the style to the person',
        body:
          'The gamer brother becomes a Rick and Morty style scientist. The anime-obsessed best friend gets her shonen protagonist moment. Dad on his 60th joins the yellow family on the couch. Grandma gets a warm Disney-Pixar style scene with all the grandkids. Choosing the right style for the birthday person is half the gift — and the reaction is the other half.',
      },
      {
        title: 'Solo star or the whole squad',
        body:
          'A solo full-body portrait makes the birthday person the main character — great for milestone birthdays and office gifts. Or gather the friend group: up to 8 people composed from separate photos into one scene, each drawn with their defining features. Group birthday portraits in South Park style are a running favorite.',
      },
      {
        title: 'The birthday-week save',
        body:
          'Birthday in three days? Standard delivery is 48 hours, express is 24. The high-resolution file arrives by email: print it on canvas or a mug, frame it, or send it digitally at midnight sharp. No shipping, no customs, no "estimated delivery after the party".',
      },
    ],
    bullets: {
      title: 'Why it works as a birthday gift',
      items: [
        'A gift they literally cannot already own',
        'Style matched to their personality — 8 to choose from',
        'Solo, couple or full friend-group scenes',
        '48h standard / 24h express delivery',
        'From $15, printable on anything',
      ],
    },
    faq: [
      { q: 'Can you draw them with their hobby?', a: 'Yes. Guitars, consoles, bikes, kitchens — describe the props in your order notes and the artist draws them in.' },
      { q: 'Can I get it printed on a mug or shirt?', a: 'Yes. Beyond the digital file, we offer print-on-demand products shipped to your door.' },
    ],
    image: '/backgrounds/rm-10.webp',
    imageAlt: 'Custom birthday portrait hand drawn from photo in cartoon style with party background',
    relatedStyles: ['rick-and-morty-style-portrait', 'south-park-style-portrait', 'anime-style-portrait'],
    relatedLandings: ['/gifts/christmas', '/custom-couple-portrait', '/custom-pet-portrait'],
  },
  // ── Angle: anti-AI ──────────────────────────────────────────────────────
  {
    path: '/hand-drawn-no-ai',
    metaTitle: 'Hand-Drawn Portrait from Photo — 100% Human Artist, Zero AI • From $15',
    metaDescription:
      'Every portrait we sell is hand-drawn from your photo by a real artist. No AI generation, no filters, no shortcuts — and we can prove it. In 48 hours, from $15.',
    keywords: ['hand drawn portrait from photo', 'no AI portrait', 'real artist portrait commission', 'human made custom portrait', 'hand drawn cartoon portrait'],
    h1: 'Hand-Drawn Portraits from Your Photo — No AI, Ever',
    intro:
      'The custom portrait industry has a dirty secret: many shops now run your photo through AI, touch it up and charge you hand-made prices. We do the opposite. Every Negasva portrait is drawn from scratch by a real, named artist — and the difference is visible in every line.',
    sections: [
      {
        title: 'How you can tell AI from hand-drawn',
        body:
          'AI portraits smooth everyone into the same face: symmetric, plastic, generically pretty, with melted hands and jewelry that fuses into skin. A hand-drawn portrait keeps the asymmetries that make you recognizable — the one eyebrow that arches higher, the gap in your smile, your dog\'s crooked ear. If a shop delivers a preview in ten minutes, you already know how it was made. Ours takes hours, because a human is drawing it.',
      },
      {
        title: 'Why it matters for your portrait',
        body:
          'You are buying this to gift someone their own face. AI averages that face against millions of strangers; an artist studies it. That is why AI portraits of kids look like nobody\'s child and AI pets look like stock photos of the breed. For memorial portraits it matters even more — feeding a lost loved one\'s photo into a generator is not how a keepsake should be made.',
      },
      {
        title: 'Our guarantee: a human on every stroke',
        body:
          'One artist draws your portrait start to finish — sketch, lines, color, background. You get a revision round with that same artist, not a re-roll of a prompt. The style stays consistent across every person in the scene because one hand drew them all. 48-hour delivery, from $15: hand-made does not have to mean slow or expensive.',
      },
    ],
    bullets: {
      title: 'The no-AI checklist we pass',
      items: [
        'Drawn from scratch by a named human artist',
        'Real asymmetries and details kept, not smoothed away',
        'Revisions done by the same artist, not re-generated',
        'Consistent style across all people and pets in the scene',
        'Hours of real work, still delivered in 48h from $15',
      ],
    },
    faq: [
      { q: 'How do I know my portrait was not AI-generated?', a: 'Compare details: hands, jewelry, hair strands and background edges. AI artifacts show there. We also share work-in-progress shots on request.' },
      { q: 'Why are you cheaper than some AI-based shops?', a: 'Focused styles and a streamlined process — you order in 3 steps and the artist spends time drawing, not managing.' },
    ],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Hand drawn portrait from photo by real artist no AI cartoon style',
    relatedStyles: ['simpsons-style-portrait', 'anime-style-portrait', 'rick-and-morty-style-portrait'],
    relatedLandings: ['/memorial-portrait', '/custom-couple-portrait', '/custom-family-portrait'],
  },
];

export function getLandingByPath(path: string): LandingContent | undefined {
  return LANDINGS.find((l) => l.path === path);
}
