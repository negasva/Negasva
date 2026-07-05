// Artículos del blog con contenido completo server-side para SEO.
// Cada post se renderiza estático en /blog/[slug] con schema BlogPosting.

export interface BlogSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  date: string; // ISO
  dateLabel: string;
  excerpt: string;
  keywords: string[];
  image: string;
  imageAlt: string;
  intro: string;
  sections: BlogSection[];
  relatedStyleSlugs: string[]; // slugs de /estilos/[slug] para enlaces internos
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'ideas-para-regalar-un-retrato-animado',
    title: '10 ideas para regalar un retrato animado personalizado',
    metaTitle: '10 Ideas para Regalar un Retrato Animado Personalizado',
    metaDescription:
      'Cumpleaños, aniversarios, Navidad o San Valentín: descubre 10 ideas originales para regalar un retrato animado personalizado que nadie olvidará.',
    category: 'Inspiración',
    date: '2026-06-10',
    dateLabel: '10 de Junio, 2026',
    excerpt: 'Cumpleaños, aniversarios, Navidad... ideas originales para sorprender con un retrato animado que nadie más puede repetir.',
    keywords: ['regalar retrato animado', 'regalo original personalizado', 'ideas de regalo caricatura', 'regalo aniversario original'],
    image: '/backgrounds/rm-1.webp',
    imageAlt: 'Retrato animado personalizado estilo cartoon sci-fi como idea de regalo',
    intro:
      'Encontrar un regalo que sea original, personal y que de verdad emocione es cada vez más difícil. Todo el mundo tiene de todo, y los regalos genéricos se olvidan en una semana. Un retrato animado personalizado resuelve exactamente ese problema: es único por definición — está dibujado a partir de la foto de la persona — y combina humor, nostalgia y cariño en una sola pieza. Aquí van 10 ideas concretas para regalarlo según la ocasión y la persona.',
    sections: [
      {
        h2: '1. Aniversario de pareja: ustedes dos como personajes de su serie favorita',
        paragraphs: [
          'El clásico que nunca falla. Si ven cartoon sci-fi juntos, un retrato de los dos con el portal de fondo es el regalo de aniversario perfecto. Si su serie es de la infancia, el estilo fantasia brillante como personaje magico y personaje magico es el encargo romántico-friki más pedido que tenemos: pelo verde y rosa, coronas flotantes y varitas incluidas.',
        ],
      },
      {
        h2: '2. Cumpleaños: el retrato individual con sus hobbies',
        paragraphs: [
          'Un retrato individual donde la persona aparece con los elementos que la definen: su instrumento, su consola, su balón, su mascota. Las indicaciones especiales del pedido sirven exactamente para esto — cuéntanos qué hace única a esa persona y lo integramos al dibujo.',
        ],
      },
      {
        h2: '3. Día de la madre o del padre: la familia completa estilo familia amarilla',
        paragraphs: [
          'El retrato familiar amarillo en el sofá de una ciudad animada es nuestro encargo más popular para padres y abuelos. Funciona porque mezcla la nostalgia de una serie que toda la familia conoce con la emoción de verse todos juntos en un cuadro. Impreso en lienzo y enmarcado, es de esos regalos que terminan presidiendo la sala.',
        ],
      },
      {
        h2: '4. Navidad: un retrato grupal de toda la familia',
        paragraphs: [
          'En diciembre los retratos de grupo (hasta 8 personas y mascotas) son los protagonistas. Consejo: pídelo con tiempo — aunque entregamos en 48 horas, en temporada alta conviene asegurar el margen para imprimirlo y enmarcarlo antes del 24.',
        ],
      },
      {
        h2: '5. San Valentín: el antes y después de la relación',
        paragraphs: [
          'Una idea que pocos conocen: usar la primera foto que se tomaron juntos como base del retrato. El resultado es una pieza que cuenta la historia de la relación con el filtro del humor de su caricatura favorita.',
        ],
      },
      {
        h2: '6. Para tu mejor amigo: el dúo dinámico',
        paragraphs: [
          'Los retratos de mejores amigos al estilo misterio del bosque — la referencia de duo de hermanos aventureros es perfecta para hermanos o amigos inseparables — son un regalo de amistad que supera a cualquier objeto comprado en tienda.',
        ],
      },
      {
        h2: '7. Para gamers y streamers: el avatar definitivo',
        paragraphs: [
          'Un retrato animado en alta resolución funciona como foto de perfil en Discord, Twitch, Instagram o TikTok. Es un regalo útil de verdad para alguien que vive online: identidad visual única que nadie más puede copiar.',
        ],
      },
      {
        h2: '8. Para quien tiene mascota: el retrato con su compañero',
        paragraphs: [
          'Dibujamos perros, gatos y cualquier mascota con el mismo estilo de la serie elegida. Para los amantes de los animales, un retrato junto a su mascota suele emocionar más que cualquier otro regalo.',
        ],
      },
      {
        h2: '9. Despedidas y mudanzas: el recuerdo del grupo',
        paragraphs: [
          'Cuando un amigo se muda de ciudad o de país, un retrato de todo el grupo es el recuerdo perfecto para que se lleve a su nueva casa. Lo digital tiene aquí una ventaja: cada miembro del grupo puede imprimir su propia copia.',
        ],
      },
      {
        h2: '10. Para ti: porque sí',
        paragraphs: [
          'No todo regalo necesita ocasión. Muchos de nuestros clientes piden su retrato simplemente porque quieren verse como personaje de su serie favorita. Y honestamente, es razón suficiente.',
          'Cualquiera de estas ideas empieza igual: eliges el estilo, subes la foto y en 48 horas tienes el retrato en tu correo, listo para imprimir o regalar en digital. Desde $15 USD.',
        ],
      },
    ],
    relatedStyleSlugs: ['rick-and-morty-style-portrait', 'simpsons-style-portrait', 'fairly-oddparents-style-portrait'],
  },
  {
    slug: 'como-elegir-el-estilo-de-tu-retrato',
    title: 'Cómo elegir el estilo de tu retrato animado: guía completa',
    metaTitle: 'Cómo Elegir el Estilo de tu Retrato Animado — Guía Completa',
    metaDescription:
      '¿cartoon sci-fi, familia amarilla, misterio del bosque o fantasia brillante? Guía completa para elegir el estilo de caricatura que mejor va contigo y con el uso que le darás.',
    category: 'Guías',
    date: '2026-06-05',
    dateLabel: '5 de Junio, 2026',
    excerpt: 'Descubre cuál de nuestros 4 estilos se adapta mejor a tu personalidad y al uso que le darás a tu retrato.',
    keywords: ['como elegir estilo retrato', 'estilos de caricatura', 'mejor estilo retrato animado', 'tipos de retrato personalizado'],
    image: '/backgrounds/rm-4.webp',
    imageAlt: 'Comparación de estilos de retrato animado personalizados',
    intro:
      'Elegir el estilo es la decisión más importante de tu pedido — y la más divertida. Cada uno de nuestros cuatro estilos tiene una personalidad visual propia, y el que mejor funciona depende de tres cosas: quién aparece en el retrato, qué uso le vas a dar y qué serie conecta más contigo. Esta guía te ayuda a decidir en cinco minutos.',
    sections: [
      {
        h2: 'cartoon sci-fi: para los que quieren humor y ciencia ficción',
        paragraphs: [
          'Es nuestro estilo más pedido. Trazos irregulares, ojos saltones con pupilas pequeñas y fondos interdimensionales: portales verdes, garajes llenos de inventos, planetas alienígenas. Funciona especialmente bien en retratos de parejas y grupos de amigos con humor ácido.',
          'Elígelo si: ves la serie, quieres un resultado divertido antes que tierno, o buscas un fondo espectacular (el portal verde es nuestro fondo estrella).',
        ],
      },
      {
        h2: 'familia amarilla clasica: el clásico familiar',
        paragraphs: [
          'Piel amarilla, contornos gruesos y la estética más reconocible de la historia de la televisión. Es el estilo favorito para retratos familiares — la escena del sofá con tu familia es un encargo recurrente — y para regalos a padres y abuelos, porque absolutamente todo el mundo reconoce la referencia.',
          'Elígelo si: el retrato es de familia, el regalo es para alguien de otra generación, o quieres el efecto nostalgia más universal posible.',
        ],
      },
      {
        h2: 'misterio del bosque: tierno con un toque de misterio',
        paragraphs: [
          'Ojos grandes y brillantes, proporciones adorables y paleta de colores cálidos de bosque. Es el estilo más expresivo de los cuatro y el que mejor funciona en tamaño pequeño, lo que lo convierte en el favorito para avatares de redes sociales. La referencia de duo de hermanos aventureros lo hace ideal para retratos de hermanos.',
          'Elígelo si: quieres algo tierno sin ser cursi, el retrato será tu foto de perfil, o es un regalo entre hermanos o mejores amigos.',
        ],
      },
      {
        h2: 'fantasia brillante: nostalgia noventera en colores eléctricos',
        paragraphs: [
          'Siluetas angulosas, colores planos súper saturados y la energía caótica de animacion noventera. Es el estilo que más destaca impreso en una pared por la intensidad de sus colores. Para parejas existe el encargo clásico: ustedes dos como personaje magico y personaje magico, coronas y varitas incluidas.',
          'Elígelo si: creciste con animacion noventera, quieres los colores más vibrantes, o buscas el retrato de pareja más original.',
        ],
      },
      {
        h2: 'La pregunta clave: ¿dónde va a vivir tu retrato?',
        paragraphs: [
          'Si va impreso en grande para una pared: fantasia brillante y cartoon sci-fi lucen espectaculares por sus fondos y colores. Si es para foto de perfil: misterio del bosque gana por expresividad en tamaño pequeño. Si es un regalo familiar: familia amarilla es apuesta segura por reconocimiento universal.',
          'Y si sigues sin decidirte: en las indicaciones especiales del pedido puedes contarnos tu duda y te recomendamos el estilo según tus fotos. Sea cual sea tu elección, todos los estilos incluyen revisión, alta resolución y entrega en 48 horas.',
        ],
      },
    ],
    relatedStyleSlugs: ['rick-and-morty-style-portrait', 'simpsons-style-portrait', 'gravity-falls-style-portrait', 'fairly-oddparents-style-portrait'],
  },
  {
    slug: 'rick-y-morty-vs-simpsons-que-estilo-elegir',
    title: 'cartoon sci-fi vs familia amarilla clasica: ¿qué estilo de retrato elegir?',
    metaTitle: 'cartoon sci-fi vs familia amarilla — ¿Qué Estilo de Retrato Elegir?',
    metaDescription:
      'Comparamos los dos estilos de retrato animado más pedidos: cartoon sci-fi vs familia amarilla clasica. Diferencias, para quién es cada uno y cuál elegir según el uso.',
    category: 'Comparativas',
    date: '2026-05-28',
    dateLabel: '28 de Mayo, 2026',
    excerpt: 'Los dos estilos más pedidos, frente a frente: diferencias visuales, usos ideales y cómo decidir entre ellos.',
    keywords: ['comparacion estilos caricatura', 'retrato cartoon sci fi o familiar', 'que estilo de retrato elegir', 'retrato personalizado para regalo'],
    image: '/backgrounds/rm-6.webp',
    imageAlt: 'Comparativa entre retrato estilo cartoon sci-fi y estilo familia amarilla clasica',
    intro:
      'Son nuestros dos estilos más pedidos y la duda más frecuente entre quienes hacen su primer pedido: ¿me dibujo como personaje de cartoon sci-fi o como habitante de una ciudad animada? Los dos son icónicos, los dos quedan increíbles — pero son muy diferentes entre sí. Aquí va la comparativa honesta para que decidas en función de lo que de verdad importa.',
    sections: [
      {
        h2: 'Diferencias visuales: caos interdimensional vs clásico atemporal',
        paragraphs: [
          'cartoon sci-fi se caracteriza por trazos finos e irregulares, ojos enormes con pupilas diminutas y una paleta saturada con predominio de verdes y azules. El resultado transmite energía caótica y humor ácido. Los fondos son su gran fortaleza: portales, garajes de inventor, planetas alienígenas.',
          'familia amarilla clasica, en cambio, usa contornos gruesos y limpios, la icónica piel amarilla y colores planos cálidos. Es un estilo más "ordenado" visualmente, con un reconocimiento instantáneo que ninguna otra serie puede igualar: más de 30 temporadas en pantalla lo convirtieron en lenguaje visual universal.',
        ],
      },
      {
        h2: '¿Quién gana para retratos de pareja?',
        paragraphs: [
          'cartoon sci-fi, en general. El estilo tiene un punto irreverente que funciona muy bien en parejas jóvenes, y el fondo del portal da un resultado espectacular para imprimir. Dicho esto, si su plan favorito es ver familia amarilla clasica en el sofá, la respuesta es obvia.',
        ],
      },
      {
        h2: '¿Quién gana para retratos familiares?',
        paragraphs: [
          'familia amarilla clasica, sin discusión. La familia amarilla es el arquetipo del retrato familiar animado, y la escena del sofá con tu propia familia es un regalo que emociona a tres generaciones a la vez. Los abuelos reconocen la referencia igual que los nietos — eso no pasa con ninguna otra serie.',
        ],
      },
      {
        h2: '¿Quién gana como foto de perfil?',
        paragraphs: [
          'Empate técnico, depende de tu comunidad. En Discord, Twitch y comunidades gamer, cartoon sci-fi encaja con el tono. En un perfil más general (Instagram, WhatsApp), el amarillo familia amarilla llama la atención al instante en una pantalla pequeña.',
        ],
      },
      {
        h2: 'El veredicto',
        paragraphs: [
          'Elige cartoon sci-fi si: el retrato es de pareja o amigos, quieres fondos espectaculares, y el humor ácido va contigo.',
          'Elige familia amarilla clasica si: el retrato es familiar, es un regalo para alguien de otra generación, o quieres el estilo más reconocible que existe.',
          'Y recuerda que no tienes que casarte con uno para siempre: muchos clientes piden su primer retrato en un estilo y vuelven por el otro. Ambos cuestan lo mismo, desde $15 USD con entrega en 48 horas.',
        ],
      },
      {
        h2: 'Cuando NO conviene cartoon sci-fi',
        paragraphs: [
          'Si la persona que recibirá el regalo no conoce la serie, puede perder parte del efecto. También puede quedarse corto si buscas algo tierno o familiar: cartoon sci-fi destaca por humor negro, caos visual y una vibra más adulta. Para abuelos, padres o un retrato multigeneracional, normalmente familia amarilla funciona mejor.',
        ],
      },
      {
        h2: 'Cuando NO conviene familia amarilla clasica',
        paragraphs: [
          'Si quieres algo más moderno, más rebelde o con un fondo espectacular, familia amarilla puede sentirse demasiado clásico. También pasa que, en perfiles gamer o de humor más irreverente, cartoon sci-fi conecta mejor con la estética del cliente. No es un problema del dibujo: es pura intención de uso.',
        ],
      },
      {
        h2: 'Resumen rápido para decidir en 30 segundos',
        paragraphs: [
          'Pareja friki, amigos, avatar con energía caótica: cartoon sci-fi.',
          'Familia, generaciones mezcladas, regalo universal: familia amarilla clasica.',
          'Si aún dudas, piensa en quién va a ver el retrato primero y dónde va a vivir: pared, escritorio, Instagram o WhatsApp. Ese contexto casi siempre te dice el estilo correcto.',
        ],
      },
    ],
    relatedStyleSlugs: ['rick-and-morty-style-portrait', 'simpsons-style-portrait'],
  },
  {
    slug: 'consejos-para-fotos-perfectas',
    title: 'Cómo tomar la foto perfecta para tu retrato animado',
    metaTitle: 'Cómo Tomar la Foto Perfecta para tu Retrato Animado',
    metaDescription:
      'La calidad de tu retrato animado empieza en la foto. Guía práctica: luz, ángulo, resolución y errores comunes a evitar antes de hacer tu pedido.',
    category: 'Tips',
    date: '2026-05-20',
    dateLabel: '20 de Mayo, 2026',
    excerpt: 'Luz, ángulo, resolución y los errores más comunes: todo lo que necesitas saber antes de subir tu foto.',
    keywords: ['foto para retrato animado', 'como tomar foto para caricatura', 'consejos foto retrato personalizado'],
    image: '/backgrounds/rm-5.webp',
    imageAlt: 'Ejemplo de foto bien iluminada para convertir en retrato animado',
    intro:
      'Nuestros ilustradores dibujan cada retrato a mano partiendo de tu foto. Eso significa que cuanto mejor sea la foto, más fiel y detallado será el resultado: captamos mejor tus rasgos, tu peinado, tu expresión. La buena noticia es que no necesitas cámara profesional — solo seguir estas reglas simples con tu celular.',
    sections: [
      {
        h2: 'La regla de oro: que se vea bien tu cara',
        paragraphs: [
          'Parece obvio, pero es el error número uno. Fotos de cuerpo entero donde la cara ocupa un 5% de la imagen, selfies con lentes de sol, fotos de espaldas "porque esa me gusta"... El ilustrador necesita ver tus rasgos con claridad: ojos, nariz, boca, forma de la cara y peinado. Si dudas, sube varias fotos — una de cara cercana y otra del look completo que quieres.',
        ],
      },
      {
        h2: 'Luz natural, siempre que puedas',
        paragraphs: [
          'La mejor foto es la que tomas de día cerca de una ventana o en exteriores con sombra. La luz natural muestra los colores reales de tu piel, pelo y ropa. Evita: contraluces (la ventana detrás de ti), flash directo de noche y luces de neón que tiñen todo de un color.',
        ],
      },
      {
        h2: 'Resolución: la foto original, no la captura',
        paragraphs: [
          'Envía la foto original desde tu galería, no una captura de pantalla ni una imagen reenviada veinte veces por WhatsApp (cada reenvío comprime y pierde calidad). Si la foto está pixelada, los detalles finos — pecas, mechones, texturas de ropa — se pierden para el ilustrador.',
        ],
      },
      {
        h2: 'Retratos de grupo: una foto por persona vale más que una grupal lejana',
        paragraphs: [
          'Para retratos de varias personas no necesitas que todos salgan en la misma foto. De hecho, suele ser mejor enviar una foto clara de cada persona por separado y contarnos en las indicaciones cómo quieres agruparlos y en qué pose. Lo mismo aplica para mascotas: una buena foto del perro mirando a cámara hace magia.',
        ],
      },
      {
        h2: 'Lo que sí puedes pedir aunque no salga en la foto',
        paragraphs: [
          'El retrato no tiene que ser una copia exacta de la foto. ¿Quieres salir con otra ropa, con tu camiseta favorita, con un accesorio de la serie o abrazando a tu pareja aunque las fotos sean separadas? Escríbelo en las indicaciones especiales del pedido. La foto define tus rasgos; las indicaciones definen la escena.',
          'Con una buena foto y unas indicaciones claras, el resultado llega en 48 horas y la revisión incluida cubre cualquier ajuste fino. Así de simple.',
        ],
      },
    ],
    relatedStyleSlugs: ['rick-and-morty-style-portrait', 'gravity-falls-style-portrait'],
  },
  {
    slug: 'el-proceso-detras-de-cada-retrato',
    title: 'El proceso detrás de cada retrato: de tu foto al dibujo final',
    metaTitle: 'El Proceso Detrás de Cada Retrato Animado — Así lo Hacemos',
    metaDescription:
      'Así se hace un retrato animado personalizado en NEGASVA: del análisis de tu foto al dibujo a mano, revisión y entrega en 48 horas. Sin IA ni filtros.',
    category: 'Behind the Scenes',
    date: '2026-05-12',
    dateLabel: '12 de Mayo, 2026',
    excerpt: 'Del análisis de tu foto al dibujo a mano y la entrega final: así trabaja nuestro equipo en cada encargo.',
    keywords: ['como se hace un retrato animado', 'retrato dibujado a mano', 'proceso ilustracion personalizada'],
    image: '/backgrounds/rm-3.webp',
    imageAlt: 'Proceso de ilustración de un retrato animado personalizado',
    intro:
      'Una de las preguntas que más nos hacen: "¿esto lo hace una IA?". No. Cada retrato de NEGASVA lo dibuja un ilustrador real, a mano, en tableta digital. Por eso los resultados capturan cosas que ningún filtro automático logra: tu gesto característico, el detalle de tus gafas, la postura de tu mascota. Aquí te contamos el proceso completo, paso a paso.',
    sections: [
      {
        h2: 'Paso 1: análisis de tu foto y tus indicaciones',
        paragraphs: [
          'Cuando llega tu pedido, lo primero que hace el ilustrador es estudiar tus fotos: forma de la cara, peinado, rasgos distintivos, ropa. Después lee tus indicaciones especiales — la pose que pediste, los accesorios, cómo agrupar a las personas — y define la composición de la escena junto con el fondo que elegiste.',
        ],
      },
      {
        h2: 'Paso 2: el boceto en el lenguaje del estilo',
        paragraphs: [
          'Aquí está la verdadera dificultad del oficio: traducir tus rasgos reales al lenguaje visual de la serie. Cada estilo tiene reglas propias — los ojos de cartoon sci-fi no se construyen igual que los de familia amarilla clasica, y las proporciones de misterio del bosque no tienen nada que ver con las siluetas angulosas de fantasia brillante. El reto es que el dibujo sea 100% fiel al estilo y que aun así cualquiera te reconozca al primer vistazo.',
        ],
      },
      {
        h2: 'Paso 3: línea, color y fondo',
        paragraphs: [
          'Sobre el boceto aprobado internamente se trabaja la línea definitiva, el color plano característico de cada serie y la integración con el fondo: que la iluminación del portal verde se refleje en los personajes, que las sombras del sofá de una ciudad animada caigan donde deben. Son los detalles que separan un retrato profesional de un "pegote" de personaje sobre fondo.',
        ],
      },
      {
        h2: 'Paso 4: entrega en 48 horas y revisión incluida',
        paragraphs: [
          'El archivo final llega a tu correo en alta resolución, listo para imprimir en lienzo, póster o marco, o para usar directamente como avatar. Y si algo no te convence — un tono de pelo, un detalle de la ropa — la revisión está incluida: nos escribes y lo ajustamos.',
          '¿Por qué no usamos IA? Porque los generadores automáticos no entienden qué te hace reconocible: producen un personaje genérico del estilo con un parecido vago. Nuestro valor está exactamente en lo contrario — que tu retrato sea inconfundiblemente tuyo.',
        ],
      },
    ],
    relatedStyleSlugs: ['rick-and-morty-style-portrait', 'simpsons-style-portrait', 'gravity-falls-style-portrait', 'fairly-oddparents-style-portrait'],
  },
  {
    slug: 'retratos-familiares-personalizados',
    title: 'Retratos familiares personalizados: el regalo que une generaciones',
    metaTitle: 'Retratos Familiares Personalizados — El Regalo que Une Generaciones',
    metaDescription:
      'Por qué un retrato familiar animado es el regalo perfecto: hasta 8 personas y mascotas, estilos familia amarilla o cartoon sci-fi, entrega en 48h desde $15.',
    category: 'Historias',
    date: '2026-05-02',
    dateLabel: '2 de Mayo, 2026',
    excerpt: 'Por qué un retrato familiar animado es el regalo perfecto para cualquier ocasión especial, y cómo pedirlo bien.',
    keywords: ['retrato familiar personalizado', 'regalo familiar original', 'caricatura familiar personalizada', 'retrato para familia'],
    image: '/backgrounds/rm-10.webp',
    imageAlt: 'Retrato familiar animado personalizado con varias personas y mascota',
    intro:
      'Hay una razón por la que los retratos familiares son nuestro encargo más emotivo: son el único formato donde caben todos. Los abuelos, los niños, el perro que es un miembro más, el primo que vive lejos. Un retrato familiar animado convierte a tu familia en el elenco de una serie — y a diferencia de la típica foto familiar acartonada, este cuadro saca sonrisas cada vez que alguien lo mira.',
    sections: [
      {
        h2: 'Por qué funciona tan bien como regalo',
        paragraphs: [
          'Un retrato familiar resuelve el problema clásico de regalar a padres y abuelos: ya lo tienen todo, y lo que de verdad valoran es la familia. Cuando una madre recibe el cuadro de todos sus hijos y nietos en versión familia amarilla, el regalo no es el dibujo — es la escena de la familia completa, junta, en un formato que mezcla humor y cariño.',
          'Además es un regalo colectivo perfecto: los hermanos se dividen el costo, cada uno aporta una foto, y el resultado supera con creces lo que cualquiera hubiera comprado por separado.',
        ],
      },
      {
        h2: 'Hasta 8 personas y mascotas en el mismo retrato',
        paragraphs: [
          'Nuestros retratos admiten de 1 a 8 personas, y las mascotas también cuentan como parte de la familia: perros, gatos y hasta animales menos comunes se dibujan con el mismo estilo de la serie. No necesitas una foto donde salgan todos juntos — basta una foto clara de cada miembro, y en las indicaciones nos cuentas cómo agruparlos.',
        ],
      },
      {
        h2: 'El estilo ideal para familias: familia amarilla primero, pero no único',
        paragraphs: [
          'La escena del sofá de una ciudad animada con tu propia familia es el retrato familiar por excelencia: tres generaciones reconocen la referencia al instante. Pero no es la única opción — las familias jóvenes piden cada vez más el estilo cartoon sci-fi con el portal de fondo, y misterio del bosque funciona precioso para familias con niños pequeños por su estética tierna.',
        ],
      },
      {
        h2: 'Del archivo digital al cuadro en la pared',
        paragraphs: [
          'Entregamos el retrato en alta resolución, apto para imprimir en el tamaño que quieras: lienzo, póster enmarcado, o incluso tazas y camisetas. Un truco que usan muchos clientes: imprimen una copia grande para la casa de los padres y copias pequeñas para cada hermano.',
          'El pedido completo toma cinco minutos: eliges estilo, indicas cuántas personas, subes las fotos y nos das las indicaciones. En 48 horas, tu familia es oficialmente parte de una ciudad animada. Desde $15 USD.',
        ],
      },
    ],
    relatedStyleSlugs: ['simpsons-style-portrait', 'rick-and-morty-style-portrait', 'gravity-falls-style-portrait'],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
