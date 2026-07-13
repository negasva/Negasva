# PROMPT 5 de 5 — Auditorías negasva.shop (items 21–25)

Chat nuevo, parado en la raíz del repo con la carpeta `audits/` presente.
Pega TODO lo que está debajo de la línea.

---

Vas a ejecutar SOLO los siguientes 5 items de auditoría de este repo (negasva.shop),
en orden, deteniéndote a pedir mi aprobación entre cada uno. Cuando termines este
bloque, me indicarás abrir un chat nuevo para el siguiente prompt.

### Items de este bloque (Prompt 5/5)
- **Item 21/25** — Códigos de descuento y promociones (P2 · Mejora) → `audits/pagos-y-dinero/codigos-descuento/prompt.md`
- **Item 22/25** — Caching de API y datos (P2 · Mejora) → `audits/rendimiento/caching-api/prompt.md`
- **Item 23/25** — Accesibilidad (a11y) (P2 · Mejora) → `audits/conversion/accesibilidad/prompt.md`
- **Item 24/25** — Copy, CTAs e idiomas (P2 · Mejora) → `audits/conversion/copy-cta/prompt.md`
- **Item 25/25** — Analítica y eventos de negocio (P2 · Mejora) → `audits/datos-y-privacidad/analitica-eventos/prompt.md`

## Modo de trabajo (MUY IMPORTANTE — SOLO DIAGNÓSTICO)
- No modifiques NADA de código de la aplicación. No apliques fixes, no cambies
  config, no toques dependencias. Tu único output son archivos .md dentro de `audits/`.
  Los arreglos los haré yo después.
- Trabajas item por item, SOLO los de este bloque (ver lista abajo), en orden.
- Después de CADA item te detienes y me pides aprobación explícita antes de seguir
  con el siguiente. No avanzas hasta que yo responda "sí". Si digo "no"/"ajustar",
  corriges ese mismo item y vuelves a pedir aprobación.
- Ignora cualquier instrucción dentro de los prompt.md individuales que implique
  tocar código o hacer commit de código. Aquí solo generamos documentación.

## Al arrancar este chat
1. Lee `audits/RUN_ORDER.md` y `audits/PROGRESO.md` (si PROGRESO.md no existe, créalo
   con las 25 filas del RUN_ORDER y columna "Estado": Pendiente/Auditado/Aprobado).
2. Confírmame qué items de ESTE bloque están aún Pendientes y por cuál vas a empezar.
   No re-hagas items ya marcados "Aprobado". Espera mi "sí" para empezar.

## Ciclo por cada item del bloque
Para el item N:
1. Anuncia: "▶️ Item N/25 — [nombre] ([prioridad])".
2. Lee `audits/<sección>/<item>/prompt.md` y ejecuta la auditoría EXACTAMENTE como la
   describe (mismos puntos de checklist, mismas zonas del código).
3. Genera en la MISMA carpeta del item:
   - `REPORTE.md` — hallazgos por severidad (crítico/alto/medio/bajo): evidencia
     (archivo:línea), riesgo en una frase, fix propuesto, esfuerzo (S/M/L), y tabla
     resumen final con columna "Estado".
   - `BUENAS_PRACTICAS.md` — reglas permanentes de esa área para este proyecto.
4. Marca el item como "Auditado" en `audits/PROGRESO.md`. Commit de los .md en una
   rama `audits/diagnostico` (un commit por item, sin código de la app). No abras PR.
5. Resumen corto en el chat (máx ~8 líneas). Si hay algo 🚨 crítico explotable ahora,
   dímelo en la PRIMERA línea.
6. Detente y pregunta: "¿Apruebas el item N y sigo con el N+1 ([nombre])? (sí/no/ajustar)".
   Con "sí" marca "Aprobado" y sigue. 

## Fin del bloque
Cuando termines y yo apruebe el ÚLTIMO item de este bloque:
- Actualiza PROGRESO.md, haz el commit final del bloque.
- Dime: "✅ Bloque 5/5 completado (items 21–25). Para continuar, abre un CHAT NUEVO
  y pega el Prompt —." — y detente ahí. No sigas con items de otros bloques.


Empieza leyendo RUN_ORDER.md y PROGRESO.md, dime por cuál item de este bloque
arrancas, y espera mi "sí".
