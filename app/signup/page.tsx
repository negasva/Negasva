import { redirect } from 'next/navigation';

// Las cuentas de cliente aún no están implementadas. Evitamos el stub de
// registro (no crea ninguna cuenta) y enviamos al pedido como invitado.
export default function SignupPage() {
  redirect('/order');
}
