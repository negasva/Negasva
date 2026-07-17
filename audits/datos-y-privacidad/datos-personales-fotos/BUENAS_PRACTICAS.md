# BUENAS PRÁCTICAS — Ciclo de vida de fotos y datos personales (negasva.shop)

Guardamos fotos de familias (a veces menores) para pintar retratos. Al tocar
subida de fotos, el bucket `order-photos`, `orders`, o cualquier flujo con datos
personales:

1. **Nunca prometas en la política lo que el código no ejecuta.** Si `/privacy`
   dice "borrado a 30 días", tiene que existir un cron que lo haga. Antes de tocar
   el texto de retención o el flujo de fotos, verifica que la implementación y la
   política coincidan.

2. **Toda foto tiene fecha de muerte.** Fotos de pedidos entregados: borrar a los
   30 días de la entrega. Fotos de checkouts nunca pagados (carpetas huérfanas):
   borrar a las 48–72 h. Ninguna carpeta de `order-photos` debe vivir para siempre.

3. **El bucket `order-photos` es SIEMPRE privado.** Nunca lo pongas `public=true`
   ni añadas una policy de lectura anónima. El acceso del admin es solo por URLs
   firmadas de corta vida (≤ 1 h) generadas server-side con el service role.

4. **Escritura de fotos solo con el service role, desde el servidor.** Nunca subas
   fotos de cliente con la clave anon ni desde el navegador directo al bucket.
   Mantén la validación (nº de archivos, tamaño por archivo y total, MIME whitelist).

5. **Las policies de admin usan `app_metadata`, no `user_metadata`.** `user_metadata`
   lo puede editar el propio usuario. Al crear o tocar cualquier policy de Storage o
   RLS que distinga admin, usa `auth.jwt() -> 'app_metadata' ->> 'role'` (alineado
   con la migración 028).

6. **El borrado a petición del cliente debe ser atómico.** Una petición ARCO/derecho
   al olvido borra: la carpeta de `order-photos`, la fila de `orders` (o la
   anonimiza), su contacto, la entrada en `newsletter_subscribers` y en `carts`. No
   dejes datos personales sueltos en una sola tabla.

7. **Minimiza lo que se guarda.** No añadas columnas de datos personales nuevas sin
   una razón operativa clara y sin definir su retención en el mismo cambio.

8. **La referencia de pedido es un token de capacidad, trátala como tal.** En
   flujos post-pago no expongas fotos ni PII sin exigir la referencia, y nunca
   permitas sobrescribir fotos existentes de un pedido.
</content>
