// SEO copy for each portrait style. Slugs stay stable to avoid breaking old URLs.

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
    slug: 'rick-y-morty',
    dbSlug: 'rick-morty',
    name: 'Cartoon sci-fi',
    h1: 'Retrato personalizado estilo cartoon sci-fi',
    metaTitle: 'Retrato Cartoon Sci-Fi Personalizado | NEGASVA',
    metaDescription:
      'Convierte tu foto en un retrato cartoon sci-fi con trazos expresivos, colores intensos y fondos espaciales. Dibujado a mano, desde $15 USD.',
    keywords: [
      'retrato personalizado sci fi',
      'caricatura personalizada sci fi',
      'dibujo personalizado futurista',
      'retrato animado espacial',
      'foto convertida en dibujo cartoon',
    ],
    intro:
      'Un estilo de retrato personalizado con energia caotica, humor visual y estetica de aventura espacial. Usamos ojos grandes, expresiones exageradas, lineas nerviosas y fondos con portales, laboratorios, planetas y escenas futuristas para que tu foto se sienta como parte de una historia animada.',
    whatIs: {
      title: 'Que es un retrato cartoon sci-fi?',
      body:
        'Es una ilustracion digital dibujada a mano donde convertimos tu foto en un personaje de animacion adulta con aire de ciencia ficcion: contornos finos, pupilas pequenas, gestos intensos, colores acidos y escenarios interdimensionales. El objetivo es que el resultado sea divertido, reconocible y con mucha personalidad, sin depender de plantillas ni filtros genericos.',
    },
    forWho: {
      title: 'Para quien funciona mejor?',
      body:
        'Es ideal para parejas, amigos, perfiles gamer, regalos con humor y retratos que necesitan un fondo llamativo. Si quieres una caricatura personalizada con actitud, energia y un toque de caos visual, este estilo suele ser la mejor eleccion.',
    },
    includes: {
      title: 'Que incluye tu retrato?',
      items: [
        'Retrato digital en alta resolucion listo para imprimir',
        'De 1 a 8 personas y mascotas en el mismo dibujo',
        'Fondos sci-fi: portal, laboratorio, espacio, nave o planeta',
        'Revision incluida para ajustar detalles menores',
        'Entrega estandar en 48 horas o expres en 24h',
      ],
    },
    process: {
      title: 'Como se hace?',
      body:
        'Subes fotos claras, eliges cantidad de personas, tipo de cuerpo y fondo. Luego nos cuentas detalles como pose, ropa, accesorios o mascotas. Un ilustrador toma esa informacion y crea el retrato desde cero, cuidando que el parecido sea claro y que el estilo visual se sienta consistente.',
    },
    faq: [
      { q: 'Puedo pedir un fondo con portal o escena espacial?', a: 'Si. Puedes elegir un portal, laboratorio, nave, planeta o fondo personalizado segun la escena que quieras.' },
      { q: 'Sirve como regalo de pareja o amigos?', a: 'Si. Es uno de los estilos mas fuertes para regalos divertidos, aniversarios informales y grupos de amigos.' },
    ],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Retrato personalizado estilo cartoon sci-fi con fondo de portal verde y colores intensos',
  },
  {
    slug: 'simpsons',
    dbSlug: 'simpsons',
    name: 'Familia amarilla clasica',
    h1: 'Retrato personalizado estilo familia amarilla clasica',
    metaTitle: 'Retrato Familiar Amarillo Personalizado | NEGASVA',
    metaDescription:
      'Retrato personalizado con piel amarilla, contornos limpios y humor familiar. Ideal para parejas, familias y regalos. Dibujado a mano desde $15 USD.',
    keywords: [
      'retrato familiar personalizado',
      'caricatura familiar personalizada',
      'retrato amarillo personalizado',
      'dibujo personalizado familiar',
      'regalo personalizado familiar',
    ],
    intro:
      'Un estilo de caricatura familiar, limpio y muy reconocible: piel amarilla, ojos redondos, contornos gruesos y colores planos. Es perfecto para transformar una foto familiar en un retrato digital divertido, calido y facil de regalar.',
    whatIs: {
      title: 'Que es un retrato estilo familia amarilla?',
      body:
        'Es una ilustracion digital hecha a mano donde tu familia, pareja, mascota o grupo aparece con una estetica de comedia animada clasica: siluetas simples, expresiones claras, piel amarilla y escenarios de hogar o ciudad. Adaptamos peinado, ropa, gafas, gestos y rasgos importantes para que cada persona sea reconocible.',
    },
    forWho: {
      title: 'Para quien funciona mejor?',
      body:
        'Es la opcion mas segura para regalos familiares, padres, abuelos, aniversarios y grupos grandes. Tiene una lectura inmediata, funciona muy bien impresa y suele emocionar porque convierte a todos en parte de una escena comun.',
    },
    includes: {
      title: 'Que incluye tu retrato?',
      items: [
        'Ilustracion digital en alta resolucion',
        'De 1 a 8 personas y mascotas',
        'Fondos de sala, casa, calle o escena familiar personalizada',
        'Revision incluida para detalles de parecido',
        'Entrega en 48 horas o expres en 24h',
      ],
    },
    process: {
      title: 'Como se hace?',
      body:
        'Nos envias las fotos, eliges torso o cuerpo completo, numero de personas y fondo. Si quieres una composicion familiar especial, la escribes en notas. Dibujamos cada personaje con rasgos reconocibles y entregamos el archivo digital listo para imprimir o compartir.',
    },
    faq: [
      { q: 'Pueden hacer un retrato familiar completo?', a: 'Si. Podemos dibujar hasta 8 personas y tambien mascotas en una sola escena.' },
      { q: 'Es buena opcion para regalar a padres o abuelos?', a: 'Si. Es uno de los estilos mas claros y faciles de reconocer para regalos familiares.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Retrato familiar personalizado estilo caricatura amarilla con contornos limpios',
  },
  {
    slug: 'gravity-falls',
    dbSlug: 'gravity-falls',
    name: 'Misterio del bosque',
    h1: 'Retrato personalizado estilo misterio del bosque',
    metaTitle: 'Retrato Estilo Misterio del Bosque | NEGASVA',
    metaDescription:
      'Retrato personalizado con ojos grandes, colores calidos y vibra de aventura misteriosa. Ideal para hermanos, parejas y avatares.',
    keywords: [
      'retrato personalizado bosque',
      'caricatura personalizada tierna',
      'dibujo personalizado misterioso',
      'retrato animado para avatar',
      'ilustracion personalizada cartoon',
    ],
    intro:
      'Un estilo tierno, expresivo y aventurero: ojos grandes, proporciones suaves, colores de bosque y una atmosfera de misterio ligero. Funciona muy bien cuando quieres un retrato animado con encanto, detalle y una sensacion mas dulce.',
    whatIs: {
      title: 'Que es un retrato estilo misterio del bosque?',
      body:
        'Es una caricatura personalizada dibujada a mano con rasgos grandes y expresivos, paleta calida, ropa simplificada y fondos naturales como bosque, cabana, lago o noche estrellada. El resultado se siente cercano, juvenil y muy usable como avatar o regalo emotivo.',
    },
    forWho: {
      title: 'Para quien funciona mejor?',
      body:
        'Es ideal para hermanos, mejores amigos, parejas tiernas, ninos, mascotas y perfiles de redes. Si buscas algo menos sarcastico y mas emocional, este estilo equilibra aventura, ternura y personalidad.',
    },
    includes: {
      title: 'Que incluye tu retrato?',
      items: [
        'Retrato digital en alta resolucion',
        'Personas y mascotas en estilo cartoon expresivo',
        'Fondos de bosque, cabana, lago o escena personalizada',
        'Revision incluida para detalles menores',
        'Entrega en 48 horas o expres en 24h',
      ],
    },
    process: {
      title: 'Como se hace?',
      body:
        'Subes tus fotos y nos cuentas que vibra quieres: aventura, amistad, pareja, familia o avatar. El ilustrador traduce tus rasgos a un estilo de ojos grandes y formas suaves, manteniendo tu peinado, ropa y expresion principal.',
    },
    faq: [
      { q: 'Sirve para foto de perfil?', a: 'Si. Sus ojos grandes y formas limpias se leen muy bien en tamano pequeno.' },
      { q: 'Puedo pedir un fondo de bosque o cabana?', a: 'Si. Puedes elegir un fondo natural o describir una escena personalizada.' },
    ],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Retrato personalizado estilo misterio del bosque con ojos grandes y colores calidos',
  },
  {
    slug: 'padrinos-magicos',
    dbSlug: 'fairly-odd',
    name: 'Fantasia brillante',
    h1: 'Retrato personalizado estilo fantasia brillante',
    metaTitle: 'Retrato Fantasia Brillante Personalizado | NEGASVA',
    metaDescription:
      'Retrato personalizado con formas geometricas, colores brillantes y energia magica. Ideal para parejas, amigos y regalos divertidos.',
    keywords: [
      'retrato fantasia personalizado',
      'caricatura personalizada colorida',
      'dibujo personalizado magico',
      'retrato animado vibrante',
      'regalo personalizado divertido',
    ],
    intro:
      'Un estilo colorido, geometrico y lleno de energia. Usa siluetas angulosas, colores planos muy vivos, expresiones grandes y detalles magicos como coronas, brillos, varitas o fondos de fantasia. Es perfecto cuando quieres un retrato que se vea alegre desde lejos.',
    whatIs: {
      title: 'Que es un retrato estilo fantasia brillante?',
      body:
        'Es una ilustracion digital dibujada a mano con formas simples, lineas limpias, colores electricos y una sensacion de comedia magica. Convertimos tu foto en un personaje expresivo, con accesorios y escena personalizada si quieres un resultado mas romantico, divertido o exagerado.',
    },
    forWho: {
      title: 'Para quien funciona mejor?',
      body:
        'Funciona muy bien para parejas, amigos, regalos de cumpleanos, perfiles llamativos y personas que quieren un retrato menos serio. Es el estilo con mas energia de color y una vibra nostalgica sin depender de una referencia concreta.',
    },
    includes: {
      title: 'Que incluye tu retrato?',
      items: [
        'Ilustracion digital en alta resolucion',
        'De 1 a 8 personas y mascotas',
        'Fondos brillantes, magicos o personalizados',
        'Accesorios como coronas, brillos y varitas si los pides',
        'Entrega en 48 horas o expres en 24h',
      ],
    },
    process: {
      title: 'Como se hace?',
      body:
        'Eliges el estilo, subes fotos claras y escribes las ideas de escena. Podemos sumar colores de pelo exagerados, accesorios, objetos especiales o una composicion de pareja. Luego dibujamos todo a mano y enviamos el archivo final en alta resolucion.',
    },
    faq: [
      { q: 'Puedo pedir coronas, brillos o varitas?', a: 'Si. Puedes pedir detalles magicos o accesorios especiales en las notas del pedido.' },
      { q: 'Se ve bien impreso?', a: 'Si. Por sus colores planos y alto contraste, funciona muy bien en poster, marco o lienzo.' },
    ],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Retrato personalizado estilo fantasia brillante con colores electricos y formas geometricas',
  },
];

export function getStyleBySlug(slug: string): StyleContent | undefined {
  return STYLES_CONTENT.find((s) => s.slug === slug);
}

export const DB_SLUG_TO_URL: Record<string, string> = Object.fromEntries(
  STYLES_CONTENT.map((s) => [s.dbSlug, s.slug]),
);
