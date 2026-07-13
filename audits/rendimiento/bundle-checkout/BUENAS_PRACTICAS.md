# BUENAS PRÁCTICAS — Bundle JS del checkout (negasva.shop)

1. **`/order` es la página sagrada: presupuesto de first load ≤ 147 kB gz**
   (línea base 2026-07-13). Ningún PR puede subirlo sin justificarlo. Verifica con
   `next build` (columna "First Load JS") antes de mergear cambios en `/order`.

2. **SDKs de pago: siempre diferidos al momento de uso.**
   - Mercado Pago: solo se inyecta al montar el Brick (patrón actual, mantener).
   - PayPal: el SDK externo solo al montar el provider (paso 5); el wrapper de
     React debería ir en `next/dynamic`, nunca en el import raíz de la página.
   - Nunca cargues un SDK de pago en pasos 1-4 ni para monedas que no lo usan.

3. **reCAPTCHA solo donde y cuando se necesita**: nunca en el layout raíz; dentro
   de `/order`, móntalo lo más tarde posible (paso 4/5), no en el paso 1.

4. **Librerías pesadas del cliente → `import()` dinámico con timeout** (patrón de
   `browser-image-compression` en `useCheckout.ts`: dynamic + `withTimeout` +
   fallback). Copia ese patrón, no inventes otro.

5. **Iconos: solo imports nombrados de `lucide-react`** (`import { X } from
   'lucide-react'`). Nunca `import *` ni otra librería de iconos en paralelo.

6. **Toda dependencia usada en runtime va en `dependencies`**, no en
   `devDependencies`, aunque el bundler la incluya igual.

7. **Nada de framer-motion / lodash / moment** en páginas públicas: CSS
   transitions y stdlib primero (ya hay precedente: la sticky CTA usa CSS).

8. **Al añadir un paso o componente al wizard, pregúntate: ¿lo ve el usuario en
   el paso 1?** Si no, cárgalo con `next/dynamic`.

9. **Scripts de analítica:** GA `afterInteractive`, todo lo demás `lazyOnload`,
   siempre vía `next/script`.
