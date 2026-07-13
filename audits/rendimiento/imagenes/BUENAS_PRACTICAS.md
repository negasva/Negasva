# BUENAS PRÁCTICAS — Imágenes (negasva.shop)

1. **Toda imagen de contenido pasa por `next/image`** con `sizes` realista.
   `<img>` crudo solo se tolera en el admin interno y en el lightbox de galería.

2. **Nunca pases a `next/image` una URL que no matchee `remotePatterns`**
   (`https://**.supabase.co/storage/v1/object/public/**`). Las URLs firmadas
   (`/object/sign/…`) y los hosts externos producen 400 en `/_next/image`.
   Si un admin guarda URLs de imagen, valida el patrón al guardar.

3. **Nunca confíes solo en `browser-image-compression`**: tiene fallback al
   original. Toda foto de cliente debe recomprimirse en el servidor (sharp:
   máx ~2200 px, q80) antes de subir al bucket.

4. **Las imágenes que sube el admin se recomprimen al subir** con techo de peso
   (~300 KB para slots de landing). El "recommended" de `lib/siteImages.ts` es
   una sugerencia, no un guardarraíl — el guardarraíl es la recompresión.

5. **`priority` SOLO en la imagen hero de la página** (una por página). Todo lo
   bajo el fold: lazy (por defecto en `next/image`; en `<img>` heredado, añade
   `loading="lazy"`).

6. **No añadas hosts a `remotePatterns` "por si acaso"** — cada host nuevo es
   superficie para el optimizador. Añádelo solo cuando haya una fuente real.

7. **Formatos:** deja que el optimizador sirva AVIF/WebP (ya configurado). No
   subas PNG para fotos; los assets estáticos de `/public` van en WebP.

8. **Presupuesto:** la primera carga móvil de la landing debe pesar < 1.5 MB.
   Tras tocar imágenes de la landing, verifícalo con PSI o DevTools (Network,
   Disable cache, móvil).
