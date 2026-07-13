# Auditoría · Señales de confianza

**Sección:** Conversión y UX de venta · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **señales de confianza** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Comprar un retrato custom a una tienda desconocida requiere fe. Reseñas, ejemplos reales, garantías y políticas visibles convierten escépticos en compradores.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/page.tsx
- app/order/page.tsx (paso 5)
- footer/páginas legales
- app/track-order

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- ¿Hay ejemplos reales de retratos entregados (portafolio/galería) visibles antes de comprar?
- ¿Hay reseñas/testimonios con foto, y son creíbles?
- ¿La garantía está explícita? (revisiones incluidas, reembolso si no te gusta, tiempos de entrega claros).
- ¿Existen y están enlazadas las páginas de términos, privacidad, reembolsos y contacto?
- En el paso de pago: ¿se refuerza la confianza justo ahí (candado, métodos, '¿dudas? WhatsApp')?
- ¿El track-order funciona y da información útil? (reduce ansiedad post-compra y tickets).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/conversion/senales-confianza/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/conversion/senales-confianza/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de señales de confianza para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   conversión y ux de venta, leer `audits/conversion/senales-confianza/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
