# Buenas prácticas — Caching de API y datos

Reglas permanentes para este proyecto. Léelas antes de tocar endpoints de
catálogo, `lib/cache/clientCache.ts` o la configuración de `revalidate`.

- **Siempre** pon `Cache-Control: public, s-maxage=<n>, stale-while-revalidate=<m>`
  en los endpoints de catálogo (styles, backgrounds, prices, body-types, rates).
  Es el patrón vigente; no devuelvas catálogo sin cabecera de caché.
- **Nunca** caches el quote, el checkout, ni nada por-usuario o de estado de pago.
  Son POST (no cacheables) o llevan `no-store`. El keepalive es `force-dynamic`
  a propósito: no lo toques.
- **Siempre** que una ruta GET devuelva datos por-usuario o de estado, pon
  `Cache-Control: no-store` explícito. No dependas del default de Next.
- **Siempre** usa `cachedFetchJSON` para leer catálogo en el cliente, y pasa un
  `ttlMs` coherente con el `s-maxage` del endpoint (no dejes el default de 5 min
  para datos con ventana de CDN más corta, como precios).
- Para leer catálogo en el servidor, memoriza con `unstable_cache`/`React.cache`
  y `tags`; invalida con `revalidateTag` desde el admin al editar. No pegues a
  Supabase en cada request para datos que casi no cambian.
- **Siempre** invalida (`invalidateCache` en cliente, `revalidateTag` en servidor)
  después de una mutación del admin, para que el cambio se vea sin recargar duro.
- Mantén las páginas de estilos/pricing como ISR (`export const revalidate`), no
  las vuelvas dinámicas sin una razón.
