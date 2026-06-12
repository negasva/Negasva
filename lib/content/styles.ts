// Contenido SEO de cada estilo de retrato. Server-side: se renderiza en HTML
// estático para que Google indexe el texto completo sin ejecutar JS.

export interface StyleContent {
  slug: string;          // slug de la URL pública (/estilos/[slug])
  dbSlug: string;        // slug en la tabla portrait_styles (para /order?style=)
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
    name: 'Rick & Morty',
    h1: 'Retrato personalizado estilo Rick & Morty',
    metaTitle: 'Retrato Rick y Morty Personalizado — Tu Foto Convertida en Caricatura',
    metaDescription:
      'Convierte tu foto en un personaje de Rick & Morty. Retrato digital personalizado dibujado a mano, entrega en 48h desde $20 USD. Pide el tuyo hoy.',
    keywords: [
      'retrato rick y morty personalizado', 'caricatura rick y morty',
      'dibujo estilo rick y morty', 'convertir foto en rick y morty',
      'retrato animado rick and morty',
    ],
    intro:
      'Transforma tu foto en un personaje del universo de Rick & Morty: ojos saltones, trazos irregulares y ese toque de ciencia ficción caótica que hizo icónica a la serie. Nuestro estilo más pedido, perfecto para fans de la serie y regalos con personalidad.',
    whatIs: {
      title: '¿Qué es un retrato estilo Rick & Morty?',
      body:
        'Es una ilustración digital dibujada a mano en la que te convertimos a ti, a tu pareja, a tus amigos o a tu familia en personajes con la estética exacta de la serie de Adult Swim: pupilas pequeñas sobre ojos enormes, líneas de contorno finas, paleta de colores saturada y fondos interdimensionales con portales verdes, garajes llenos de inventos o paisajes alienígenas. No usamos filtros automáticos ni inteligencia artificial: cada retrato lo dibuja un ilustrador real partiendo de tu foto, cuidando que tu peinado, tu ropa y tus rasgos sean reconocibles al instante.',
    },
    forWho: {
      title: '¿Para quién es este estilo?',
      body:
        'Es el regalo perfecto para fans de Rick & Morty, parejas frikis, grupos de amigos que quieren un cuadro divertido para el apartamento, o cualquier persona que quiera una foto de perfil única para Instagram, TikTok o Discord. También funciona increíble como regalo de cumpleaños, aniversario o Navidad: imprimes el archivo digital en lienzo o lo enmarcas y tienes un regalo que nadie más puede repetir.',
    },
    includes: {
      title: '¿Qué incluye tu retrato?',
      items: [
        'Ilustración digital en alta resolución lista para imprimir',
        'De 1 a 8 personas (también mascotas) en el mismo retrato',
        'Fondo temático de la serie: portal, garage, espacio, dimensión C-137 y más',
        'Revisión incluida para ajustar detalles antes de la entrega',
        'Entrega estándar en 48 horas o exprés en 24h',
      ],
    },
    process: {
      title: '¿Cómo se hace?',
      body:
        'Subes una o varias fotos donde se vea bien tu cara, eliges cuántas personas aparecen, seleccionas el fondo y nos cuentas cualquier detalle especial (poses, accesorios, mascotas). Nuestro equipo dibuja el retrato desde cero y te lo envía por correo en alta resolución en un máximo de 48 horas. Si algo no te convence, lo ajustamos.',
    },
    faq: [
      { q: '¿Puedo salir con el portal verde de fondo?', a: 'Sí, el portal interdimensional es nuestro fondo más pedido. También tenemos el garage de Rick, el espacio y varios planetas.' },
      { q: '¿Pueden incluir a mi mascota?', a: 'Claro, dibujamos perros, gatos y cualquier mascota con el mismo estilo de la serie.' },
    ],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Ejemplo de retrato personalizado estilo Rick & Morty con fondo de portal interdimensional',
  },
  {
    slug: 'simpsons',
    dbSlug: 'simpsons',
    name: 'Los Simpsons',
    h1: 'Retrato personalizado estilo Los Simpsons',
    metaTitle: 'Retrato Simpsons Personalizado — Conviértete en Personaje Amarillo',
    metaDescription:
      'Tu foto convertida en personaje de Los Simpsons: piel amarilla, ojos redondos y el estilo de Springfield. Dibujado a mano, entrega en 48h desde $20.',
    keywords: [
      'retrato simpsons personalizado', 'caricatura simpsons',
      'convertir foto en simpson', 'dibujo estilo simpsons',
      'retrato familia simpsons',
    ],
    intro:
      'Piel amarilla, ojos redondos gigantes y el sobremordido más famoso de la televisión. Con este estilo te convertimos en un habitante más de Springfield, con el look exacto que Matt Groening hizo legendario durante más de 30 temporadas.',
    whatIs: {
      title: '¿Qué es un retrato estilo Los Simpsons?',
      body:
        'Es una ilustración digital hecha a mano donde tú y los tuyos aparecen con la estética clásica de la serie: piel amarilla, contornos gruesos, cuatro dedos y esa expresividad inconfundible. Adaptamos tu peinado, tu ropa, tus gafas y tus rasgos al lenguaje visual de Springfield para que cualquiera te reconozca de inmediato, igual que reconocería a Homero o a Marge. Cada pieza se dibuja desde cero a partir de tu foto — nada de plantillas ni filtros automáticos.',
    },
    forWho: {
      title: '¿Para quién es este estilo?',
      body:
        'Es el estilo favorito para retratos familiares: la familia amarilla en el sofá es un clásico que funciona como regalo para padres, abuelos y aniversarios. También es muy pedido por parejas y grupos de amigos que crecieron viendo la serie. Si buscas un regalo nostálgico que saque una sonrisa garantizada, este es tu estilo.',
    },
    includes: {
      title: '¿Qué incluye tu retrato?',
      items: [
        'Ilustración digital en alta resolución lista para imprimir',
        'De 1 a 8 personas y mascotas en el mismo retrato',
        'Fondos temáticos: el sofá de la sala, Springfield y más escenarios',
        'Revisión incluida antes de la entrega final',
        'Entrega estándar en 48 horas o exprés en 24h',
      ],
    },
    process: {
      title: '¿Cómo se hace?',
      body:
        'Eliges el estilo Simpsons en nuestro formulario, subes tus fotos, seleccionas fondo y número de personas, y añades indicaciones especiales si quieres (poses, objetos, la escena del sofá). Un ilustrador dibuja tu retrato a mano y lo recibes por correo en alta resolución en 48 horas o menos.',
    },
    faq: [
      { q: '¿Pueden hacer la escena del sofá con mi familia?', a: 'Sí, la escena del sofá es uno de nuestros encargos más populares para familias. Indícalo en las instrucciones especiales.' },
      { q: '¿Cuántas personas pueden salir?', a: 'Hasta 8 personas en el mismo retrato, además de mascotas.' },
    ],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Ejemplo de retrato familiar personalizado estilo Los Simpsons',
  },
  {
    slug: 'gravity-falls',
    dbSlug: 'gravity-falls',
    name: 'Gravity Falls',
    h1: 'Retrato personalizado estilo Gravity Falls',
    metaTitle: 'Retrato Gravity Falls Personalizado — Tu Foto al Estilo de la Serie',
    metaDescription:
      'Convierte tu foto en un personaje de Gravity Falls: estilo misterioso del bosque, dibujado a mano. Entrega en 48h desde $20 USD. Pide el tuyo.',
    keywords: [
      'retrato gravity falls personalizado', 'caricatura gravity falls',
      'dibujo estilo gravity falls', 'convertir foto en gravity falls',
    ],
    intro:
      'Ojos grandes y expresivos, colores cálidos de bosque y ese aire de misterio del pueblo más extraño de Oregón. El estilo Gravity Falls convierte tu foto en un personaje digno de la Cabaña del Misterio.',
    whatIs: {
      title: '¿Qué es un retrato estilo Gravity Falls?',
      body:
        'Es una ilustración digital dibujada a mano con la estética de la serie de Alex Hirsch: proporciones caricaturescas adorables, ojos enormes con brillo, paleta de tonos tierra y bosque, y ese equilibrio único entre lo tierno y lo misterioso. Tomamos tu foto y te rediseñamos como si fueras un personaje del pueblo: mantenemos tu peinado, tus gafas, tu ropa y tus gestos característicos, pero con el encanto visual de Dipper, Mabel y compañía.',
    },
    forWho: {
      title: '¿Para quién es este estilo?',
      body:
        'Ideal para fans de la animación moderna, parejas que quieren algo tierno sin ser cursi, y hermanos — el dúo Dipper y Mabel es la referencia perfecta para retratos de hermanos o mejores amigos. También es muy elegido como avatar para redes sociales por su expresividad y por lo bien que funciona en tamaño pequeño.',
    },
    includes: {
      title: '¿Qué incluye tu retrato?',
      items: [
        'Ilustración digital en alta resolución lista para imprimir',
        'De 1 a 8 personas y mascotas en el mismo retrato',
        'Fondos temáticos: el bosque, la Cabaña del Misterio y más',
        'Revisión incluida antes de la entrega final',
        'Entrega estándar en 48 horas o exprés en 24h',
      ],
    },
    process: {
      title: '¿Cómo se hace?',
      body:
        'Subes tus fotos al formulario de pedido, eliges el estilo Gravity Falls, el fondo y el número de personas. Puedes pedir detalles especiales como el gorro de Dipper o el suéter de Mabel. Un ilustrador dibuja tu retrato desde cero y te lo entrega en alta resolución en máximo 48 horas.',
    },
    faq: [
      { q: '¿Puedo pedir accesorios de la serie?', a: 'Sí: gorros, suéteres tejidos, el diario 3 y cualquier guiño a la serie que quieras incluir.' },
      { q: '¿Sirve para foto de perfil?', a: 'Es uno de los estilos que mejor funciona como avatar por sus ojos grandes y alta expresividad.' },
    ],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Ejemplo de retrato personalizado estilo Gravity Falls con fondo de bosque',
  },
  {
    slug: 'padrinos-magicos',
    dbSlug: 'fairly-odd',
    name: 'Los Padrinos Mágicos',
    h1: 'Retrato personalizado estilo Los Padrinos Mágicos',
    metaTitle: 'Retrato Padrinos Mágicos Personalizado — Tu Foto Hecha Caricatura',
    metaDescription:
      'Tu foto convertida en personaje de Los Padrinos Mágicos: colores vibrantes y estilo noventero. Dibujado a mano, entrega en 48h desde $20 USD.',
    keywords: [
      'retrato padrinos magicos personalizado', 'caricatura padrinos magicos',
      'dibujo estilo fairly oddparents', 'convertir foto en caricatura nickelodeon',
    ],
    intro:
      'Colores eléctricos, formas geométricas y la energía caótica de Cosmo y Wanda. El estilo Padrinos Mágicos es pura nostalgia noventera de Nickelodeon convertida en tu retrato personalizado.',
    whatIs: {
      title: '¿Qué es un retrato estilo Padrinos Mágicos?',
      body:
        'Es una ilustración digital hecha a mano con la estética de la serie de Butch Hartman: siluetas angulosas, colores planos súper saturados, ojos expresivos y ese dinamismo que hace que cada escena parezca a punto de explotar de magia. Te dibujamos a ti y a quien quieras como personajes de Dimmsdale, respetando tu peinado, tu estilo de ropa y tus rasgos para que el parecido sea inmediato, con coronas flotantes y varitas mágicas opcionales.',
    },
    forWho: {
      title: '¿Para quién es este estilo?',
      body:
        'Perfecto para millennials y generación Z que crecieron con Nickelodeon, parejas que quieren retratarse como Cosmo y Wanda (nuestro encargo más romántico-friki), y cualquiera que busque un retrato con colores vibrantes que destaque impreso en una pared o como avatar. Es también una opción muy original para regalos de amistad.',
    },
    includes: {
      title: '¿Qué incluye tu retrato?',
      items: [
        'Ilustración digital en alta resolución lista para imprimir',
        'De 1 a 8 personas y mascotas en el mismo retrato',
        'Fondos temáticos vibrantes del universo de la serie',
        'Coronas flotantes y varitas mágicas si las quieres',
        'Entrega estándar en 48 horas o exprés en 24h',
      ],
    },
    process: {
      title: '¿Cómo se hace?',
      body:
        'Eliges el estilo en el formulario, subes tus fotos, seleccionas fondo y número de personas, y nos cuentas tus ideas: ¿quieres ser Cosmo y Wanda? ¿Con corona y varita? Un ilustrador real dibuja tu retrato desde cero y lo recibes en alta resolución en un máximo de 48 horas.',
    },
    faq: [
      { q: '¿Podemos salir como Cosmo y Wanda?', a: 'Sí, es nuestro encargo de pareja más popular en este estilo: pelo verde y rosa, coronas y varitas incluidas.' },
      { q: '¿El archivo sirve para imprimir en grande?', a: 'Sí, entregamos en alta resolución apta para impresión en lienzo, póster o marco.' },
    ],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Ejemplo de retrato personalizado estilo Los Padrinos Mágicos con colores vibrantes',
  },
];

export function getStyleBySlug(slug: string): StyleContent | undefined {
  return STYLES_CONTENT.find((s) => s.slug === slug);
}

/** Mapea slug de la base de datos → slug de URL pública. */
export const DB_SLUG_TO_URL: Record<string, string> = Object.fromEntries(
  STYLES_CONTENT.map((s) => [s.dbSlug, s.slug]),
);
