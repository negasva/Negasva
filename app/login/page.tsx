import { redirect } from 'next/navigation';

// El sistema de cuentas de cliente aún no es funcional. En lugar de mostrar un
// formulario que no autentica (mala UX), enviamos al flujo de pedido como
// invitado. Cuando exista auth real, se restaura la página.
export default function LoginPage() {
  redirect('/order');
}
