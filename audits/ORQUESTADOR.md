# PROMPT MAESTRO — Orquestador de auditorías (solo diagnóstico)

Pega TODO lo que está debajo de la línea en Claude Code, parado en la raíz del repo,
con la carpeta `audits/` ya presente.

---

Vas a ejecutar una serie de auditorías sobre este repo (negasva.shop) siguiendo un
orden estricto de prioridad, UNA A LA VEZ, deteniéndote a pedir mi aprobación entre
cada una. Lee estas reglas completas antes de empezar y luego síguelas al pie de la letra.

## Modo de trabajo (MUY IMPORTANTE)
- **SOLO DIAGNÓSTICO.** No modifiques NADA de código de la aplicación. No apliques
  fixes, no cambies config, no toques dependencias. Tu único output son archivos de
  documentación dentro de `audits/`. Los arreglos los haré yo después, con calma.
- Trabajas **item por item**, en el orden exacto del archivo `audits/RUN_ORDER.md`
  (del #1 al #25). No saltes, no reordenes, no agrupes.
- **Después de CADA item te detienes y me pides aprobación explícita** para continuar
  con el siguiente. No avanzas al siguiente item hasta que yo responda "sí" (o
  equivalente). Si respondo "no" o pido cambios, los atiendes sobre ese mismo item
  antes de seguir.

## Preparación (una sola vez, antes del item #1)
1. Lee `audits/RUN_ORDER.md` y confírmame que ves los 25 items en orden.
2. Crea (si no existe) el archivo `audits/PROGRESO.md` con una tabla de las 25 filas
   del RUN_ORDER y una columna "Estado" (Pendiente / Auditado / Aprobado). Este archivo
   es tu tablero: lo actualizas al cerrar cada item.
3. Dime que estás listo para empezar por el item #1 y espera mi "sí".

## Ciclo por cada item (repetir del #1 al #25)
Para el item N:
1. Anuncia: "▶️ Item N/25 — [nombre] ([prioridad])".
2. Abre y lee `audits/<sección>/<item>/prompt.md`. Ejecuta la auditoría EXACTAMENTE
   como ese archivo la describe (mismos puntos de checklist, mismas zonas del código).
3. Genera los dos entregables que ese prompt pide, dentro de la MISMA carpeta del item:
   - `REPORTE.md` — hallazgos por severidad (crítico/alto/medio/bajo), cada uno con
     evidencia (archivo:línea), riesgo en una frase, fix propuesto y esfuerzo (S/M/L),
     y una tabla-resumen final con columna "Estado" para cuando yo arregle después.
   - `BUENAS_PRACTICAS.md` — reglas permanentes de esa área para este proyecto.
   (NO ejecutes el paso de "commit" que mencionan los prompts individuales todavía —
   ver "Git" abajo. Ignora cualquier instrucción de ellos que implique tocar código.)
4. Actualiza `audits/PROGRESO.md`: marca el item como "Auditado".
5. Dame un **resumen corto en el chat** (máx ~8 líneas): cuántos hallazgos y de qué
   severidad, y si hay algo 🚨 crítico explotable ahora mismo, dímelo en la PRIMERA línea.
6. **Detente y pregúntame literalmente:** "¿Apruebas el item N y continúo con el item
   N+1 ([nombre])? (sí / no / ajustar)". No hagas nada más hasta mi respuesta.
   - "sí" → marca el item como "Aprobado" en PROGRESO.md y pasa al item N+1.
   - "ajustar" / "no" → corrige o amplía la auditoría de ESE item y vuelve a pedir aprobación.

## Git (solo documentación)
- Trabaja en una rama nueva, p. ej. `audits/diagnostico`.
- Puedes hacer commit de los archivos `.md` de `audits/` cuando yo apruebe cada item
  (un commit por item, mensaje claro en presente). **Nunca** commitees cambios de
  código de la app en este proceso — no debería haberlos.
- No abras el PR hasta terminar los 25 items (o hasta que yo lo pida). Sigue el flujo
  de git de CLAUDE.md para el PR final.

## Si encuentras algo crítico
Si en cualquier item detectas una vulnerabilidad explotable AHORA (fuga de datos de
clientes, bypass de pago, secreto expuesto): ponlo con 🚨 en la primera línea de tu
resumen del chat Y al inicio del REPORTE.md de ese item. Aun así, NO lo arregles —
solo documéntalo y adviérteme; yo decido.

Empieza ahora por la Preparación y espera mi aprobación antes del item #1.
