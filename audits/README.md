# Auditorías negasva.shop

Plan de auditorías del proyecto, organizado por área y prioridad.
Abre **`index.html`** para ver el cuadro de prioridades completo.

## Flujo de trabajo

1. Elige el siguiente item por prioridad (P0 → P1 → P2) en `index.html`.
2. Pega el contenido de `prompt.md` del item en Claude Code.
3. La auditoría genera `REPORTE.md` (hallazgos) y `BUENAS_PRACTICAS.md` (reglas permanentes).
4. Aplica los fixes siguiendo `despues-de-la-auditoria.html` del item (crítico → importante → opcional).

## Estructura

```
audits/
├── index.html                  ← cuadro de prioridades
├── seguridad/
│   ├── autenticacion-admin/   (P0)
│   ├── rls-supabase/   (P0)
│   ├── validacion-inputs/   (P0)
│   ├── csp-headers/   (P1)
│   ├── rate-limiting-antiabuso/   (P1)
│   ├── secretos-dependencias/   (P1)
├── pagos-y-dinero/
│   ├── integridad-precios/   (P0)
│   ├── webhooks/   (P0)
│   ├── conciliacion-pedidos/   (P1)
│   ├── codigos-descuento/   (P2)
├── rendimiento/
│   ├── core-web-vitals/   (P1)
│   ├── imagenes/   (P1)
│   ├── bundle-checkout/   (P1)
│   ├── caching-api/   (P2)
├── conversion/
│   ├── friccion-checkout/   (P1)
│   ├── senales-confianza/   (P1)
│   ├── mobile-responsive/   (P1)
│   ├── accesibilidad/   (P2)
│   ├── copy-cta/   (P2)
├── datos-y-privacidad/
│   ├── datos-personales-fotos/   (P1)
│   ├── cumplimiento-legal/   (P1)
│   ├── analitica-eventos/   (P2)
├── confiabilidad/
│   ├── manejo-errores/   (P0)
│   ├── monitoreo-alertas/   (P1)
│   ├── backups-recuperacion/   (P1)
```

Cada carpeta de item contiene:

| Archivo | Qué es |
|---|---|
| `prompt.md` | Prompt listo para pegar en Claude Code |
| `despues-de-la-auditoria.html` | Paso a paso post-auditoría por prioridad |
| `REPORTE.md` | *(lo genera Claude Code)* hallazgos con severidad y estado |
| `BUENAS_PRACTICAS.md` | *(lo genera Claude Code)* reglas permanentes del área |
