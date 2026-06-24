# Antes/después en la landing — diseño

Fecha: 2026-06-24
Rama: `feat/landing-before-after`

## Objetivo

Mostrar en la landing (`app/page.tsx`) una sección de "antes y después" con el
slider arrastrable que ya existe en `/galeria`, alimentada por obras reales de la
galería, y que muestre **distintos** pares conforme se suban desde el admin.

## Reutilización (no se crea nada nuevo de UI)

- `components/BeforeAfterSlider.tsx` se usa tal cual.
- Patrón de subida del admin (`uploadFile`), validación Zod y fetch en la landing
  ya existen y se siguen.

## Cambios

### 1. Datos
- Migración `021_gallery_before_url.sql` (idempotente):
  `ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS before_url text;`
  `before_url` es opcional (NULL = obra sin foto "antes").
- `lib/validation/schemas.ts`: añadir `before_url: SafeImageSchema.optional().nullable()`
  a `AdminGalleryCreateSchema` y `AdminGalleryUpdateSchema`.

### 2. APIs
- `app/api/admin/gallery/route.ts`:
  - POST: incluir `before_url: d.before_url ?? null` en el insert.
  - PUT: añadir `'before_url'` a `pickFields`.
- `app/api/gallery/route.ts` (público): añadir `before_url` al `select`.

### 3. Admin (`app/admin/(protected)/galeria/page.tsx`)
- Segundo input **opcional** "Foto antes" en el form de nueva obra (reusa
  `uploadFile`; modo archivo). Si no se sube, queda NULL.
- Añadir `before_url` a la interfaz local; badge "antes ✓" en tarjetas que lo tengan.

### 4. Landing (`app/page.tsx`)
Sección nueva **"Mira la transformación"** ubicada tras "Stats" y antes del
marquee "Estilos que enamoran". Layout a dos columnas (apilado en móvil):

- **Izquierda:** un `BeforeAfterSlider` con el par seleccionado. Debajo,
  miniaturas clicables para cambiar entre los distintos pares (solo si hay >1).
- **Derecha:** título + texto breve + CTA "Pedir mi retrato" → `/order`, en es/en/fr.

Fuente de datos: fetch a `/api/gallery`, filtrar items con `before_url` **y**
`image_url`. Si no hay ninguno, fallback al par de ejemplo
(`/samples/before-1.svg` + `/samples/after-1.svg`) para que la sección nunca
quede vacía. Se reemplaza solo cuando haya pares reales.

## Fuera de alcance
- `/galeria` no se modifica.
- No se renombran slugs ni se tocan otras secciones de la landing.

## Verificación
- `npm run build` pasa.
- La sección renderiza con el fallback de ejemplo aunque la BD no tenga `before_url`.
- Subir una obra con foto "antes" desde el admin la hace aparecer en la landing.
