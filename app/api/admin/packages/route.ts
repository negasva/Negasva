import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') return null;
  return supabase;
}

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, final_price, active } = await request.json();
  if (!name || final_price === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('packages')
    .insert({ name, description: description || null, final_price, active: active ?? true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...fields } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('packages').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
