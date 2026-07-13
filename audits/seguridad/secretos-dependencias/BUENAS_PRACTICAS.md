# BUENAS PRÁCTICAS · Secretos y dependencias (negasva.shop)

## Secretos
1. **Nunca** commitees valores reales de claves — ni en código, ni en docs, ni en `audits/`. Los ejemplos siempre con placeholder vacío o `xxx` en `.env.example`.
2. **Nunca** uses el prefijo `NEXT_PUBLIC_` para nada que no deba verse en el navegador. Regla rápida: si la variable permite gastar dinero, leer datos privados o firmar algo, va SIN prefijo. Solo son públicas: URLs, client IDs, site keys, public keys de pago.
3. `SUPABASE_SERVICE_ROLE_KEY` se usa EXCLUSIVAMENTE en código server (`lib/supabase/server.ts` y rutas API); jamás la importes desde un componente `'use client'`.
4. Si una clave se filtra (aunque sea 1 minuto): rotarla en el proveedor INMEDIATAMENTE; limpiar el historial es secundario y no sustituye la rotación.
5. Mantén `.gitignore` cubriendo `.env` y todas sus variantes; añade cualquier archivo nuevo de credenciales (service accounts, certificados) antes del primer commit.
6. Al eliminar una integración (p. ej. Stripe), retira sus env de `.env.example`, de `next.config.js` y de la documentación en el mismo PR.

## Dependencias
7. **Nunca** añadas un paquete npm sin comprobar primero que no exista ya la capacidad (fetch nativo > axios; el proyecto NO usa axios). Prefiere SDK por CDN oficial cuando el proveedor lo exige (Mercado Pago).
8. Desinstala lo que dejes de usar en el mismo PR que elimina su último import — un paquete muerto sigue siendo superficie de supply-chain.
9. Corre `npm audit` antes de cada release; high/critical en dependencias de PRODUCCIÓN se resuelven o se documenta por escrito por qué no aplican (p. ej. mitigado por Vercel). Las de devDependencies se triagean, no se ignoran para siempre.
10. Actualizaciones del framework: leer `node_modules/next/dist/docs/` ANTES de tocar versiones de Next (esta versión tiene breaking changes propios — ver `AGENTS.md`).
11. Mantén activos (cuando se configuren): GitHub secret scanning + push protection, Dependabot y gitleaks en CI. No los desactives para "destrabar" un PR.
12. Fija versiones con lockfile commiteado (ya se hace); nunca borres `package-lock.json` para resolver un conflicto.
