import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de pago',
  uploaded: 'Fotos recibidas',
  drawing: 'Dibujando',
  ready: 'Listo para enviar',
  sent: 'Enviado',
};

export async function POST(request: Request) {
  let orderId: string | undefined;
  let email: string | undefined;
  try {
    const body = await request.json();
    orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : undefined;
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!orderId || !email) {
    return NextResponse.json({ error: 'Missing orderId or email' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, production_status, status, created_at, completed_at')
    .eq('id', orderId)
    .eq('customer_email', email)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: data.id,
    productionStatus: data.production_status,
    statusLabel: STATUS_LABEL[data.production_status] ?? data.production_status,
    paymentStatus: data.status,
    createdAt: data.created_at,
    completedAt: data.completed_at,
  });
}
